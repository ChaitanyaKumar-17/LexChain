import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";
import { generateFileHash } from "../utils/hash";
import { uploadToIPFS } from "../utils/pinata";
import { UploadCloud, Clock, CheckCircle } from "lucide-react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file first.");

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // 1. Generate local SHA-256 hash
      setStatus("Generating cryptographic hash...");
      const docHash = await generateFileHash(file);

      // 2. Connect to provider (Read-only, no MetaMask popup yet)
      setStatus("Checking blockchain ledger...");
      if (!window.ethereum) throw new Error("Please install MetaMask.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // 3. NEW LOGIC: Check if document already exists on LexChain
      const docData = await contract.documents(docHash);
      
      // If timestamp is > 0, the document is already on the blockchain
      if (docData.timestamp > 0n) {
          setStatus("Document found on-chain. Restoring to IPFS...");
          // We only upload to Pinata to restore the broken link
          await uploadToIPFS(file); 
          
          setSuccess(true);
          setStatus("Success! Missing file was re-pinned and restored to the network.");
          setLoading(false);
          setFile(null);
          return; // EXIT EARLY! We skip the MetaMask transaction completely.
      }

      // 4. NORMAL FLOW: If it's a brand new document
      setStatus("Uploading new file to IPFS...");
      const ipfsHash = await uploadToIPFS(file);

      // 5. Ask MetaMask for a signature to write to the blockchain
      setStatus("Waiting for wallet approval...");
      const signer = await provider.getSigner(); 
      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setStatus("Sending transaction to blockchain...");
      const tx = await contractWithSigner.uploadDocument(ipfsHash, docHash, {
        maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
        maxFeePerGas: ethers.parseUnits("40", "gwei")
      });
      
      setStatus("Waiting for block confirmation...");
      await tx.wait();

      setSuccess(true);
      setStatus("Document successfully secured on LexChain!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Upload Document</h2>
      <p className="text-slate-600 mb-8 text-center max-w-md">
        Secure your document on the blockchain. This will generate a unique hash and store the file on decentralized storage.
      </p>

      <form onSubmit={handleUpload} className="w-full max-w-lg">
        <div className="mb-6 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition relative bg-white">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          <UploadCloud className="mx-auto text-blue-500 mb-4" size={48} />
          <p className="text-slate-600 font-medium">
            {file ? file.name : "Click or Drag & Drop a file here"}
          </p>
        </div>

        {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 text-center">{error}</p>}
        
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-center justify-center gap-2">
            <CheckCircle size={20} />
            <p className="font-medium">Upload Complete!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-slate-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Clock className="animate-spin" size={20} />
              {status}
            </>
          ) : (
            "Secure Document on Blockchain"
          )}
        </button>
      </form>
    </div>
  );
}
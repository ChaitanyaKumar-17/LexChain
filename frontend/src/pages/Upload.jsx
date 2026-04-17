// src/pages/Upload.jsx
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";
import { generateFileHash } from "../utils/hash";
import { uploadToIPFS } from "../utils/pinata";
import { useWeb3 } from "../context/Web3Context"; 
import { UploadCloud, Clock, CheckCircle, Plus, Trash2 } from "lucide-react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [signers, setSigners] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { account } = useWeb3();

  const handleSignerChange = (index, value) => {
    const newSigners = [...signers];
    newSigners[index] = value;
    setSigners(newSigners);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file first.");

    const validSigners = signers.filter(s => s.trim() !== "");
    if (validSigners.length === 0) return setError("You must add at least one required signer.");
    if (!account) return setError("Please connect your wallet first.");

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      setStatus("Generating cryptographic hash...");
      const docHash = await generateFileHash(file);

      setStatus("Checking blockchain ledger...");
      if (!window.ethereum) throw new Error("Please install MetaMask.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const docData = await contract.documents(docHash);
      
      if (docData.timestamp > 0n) {
          setStatus("Document found on-chain. Restoring to IPFS...");
          await uploadToIPFS(file); 
          setSuccess(true);
          setStatus("Success! Missing file was re-pinned and restored.");
          setLoading(false);
          setFile(null);
          return;
      }

      setStatus("Uploading new file to IPFS...");
      const ipfsHash = await uploadToIPFS(file);

      setStatus("Syncing metadata to local database...");

      const apiResponse = await fetch("http://localhost:5000/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              docHash: docHash,
              ipfsHash: ipfsHash,
              uploaderAddress: account,
              requiredSigners: validSigners 
          })
      });
      
      if (!apiResponse.ok) {
          throw new Error("Failed to sync with local database. Blockchain transaction halted.");
      }

      setStatus("Waiting for wallet approval...");
      const signer = await provider.getSigner(); 
      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setStatus("Sending transaction to blockchain...");
      const tx = await contractWithSigner.uploadDocument(ipfsHash, docHash, validSigners, {
        maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
        maxFeePerGas: ethers.parseUnits("40", "gwei")
      });
      
      setStatus("Waiting for block confirmation...");
      await tx.wait();

      setSuccess(true);
      setStatus("Document successfully secured and routed for signatures!");
      setFile(null);
      setSigners(["", ""]);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 w-full max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-text-dark-headers mb-6">Upload & Route Document</h2>
      <p className="text-text-dark-secondary mb-8 text-center max-w-md">
        Secure your document and assign the wallets required to sign it.
      </p>

      <form onSubmit={handleUpload} className="w-full grid md:grid-cols-2 gap-8 items-start">
        
        <div className="w-full border-2 border-dashed border-legal-muted bg-legal-muted/40 rounded-xl p-8 text-center hover:bg-legal-muted/60 transition relative h-64 flex flex-col justify-center">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          <UploadCloud className="mx-auto text-seal-crimson mb-4" size={48} />
          <p className="text-text-dark-primary font-medium">
            {file ? file.name : "Click or Drag & Drop a file here"}
          </p>
        </div>

        <div className="w-full bg-legal-surface border border-legal-muted rounded-xl p-6 h-64 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-legal-muted pb-2">
            <h3 className="font-bold text-text-dark-headers">Required Signatories</h3>
            <button 
              type="button" 
              onClick={() => setSigners([...signers, ""])}
              className="text-blockchain-blue hover:text-blockchain-blue/80 flex items-center text-sm font-bold"
            >
              <Plus size={16}/> Add Signer
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {signers.map((addr, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x... Wallet Address"
                  value={addr}
                  onChange={(e) => handleSignerChange(index, e.target.value)}
                  className="flex-1 p-2 bg-legal-base border border-legal-muted text-text-dark-primary rounded focus:outline-none focus:ring-2 focus:ring-seal-crimson font-mono text-sm placeholder-text-dark-secondary/50"
                  disabled={loading}
                />
                {signers.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setSigners(signers.filter((_, i) => i !== index))}
                    className="p-2 text-dark-error hover:bg-dark-error/10 rounded transition"
                  >
                    <Trash2 size={18}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 w-full max-w-lg mx-auto">
          {error && <p className="text-dark-error bg-dark-error/10 border border-dark-error/20 p-3 rounded-lg mb-4 text-center">{error}</p>}
          {success && (
            <div className="bg-dark-success/10 text-dark-success border border-dark-success/20 p-4 rounded-lg mb-4 flex items-center justify-center gap-2">
              <CheckCircle size={20} /> <p className="font-medium">{status}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-seal-crimson hover:bg-seal-crimson/80 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-legal-muted disabled:text-text-dark-secondary disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? <><Clock className="animate-spin" size={20} />{status}</> : "Secure Document on Blockchain"}
          </button>
        </div>
      </form>
    </div>
  );
}
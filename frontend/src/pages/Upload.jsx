// src/pages/Upload.jsx
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";
import { generateFileHash } from "../utils/hash";
import { uploadToIPFS } from "../utils/pinata";
import { useWeb3 } from "../context/Web3Context"; 
import { UploadCloud, Clock, CheckCircle, Plus, Trash2, FileText, X } from "lucide-react";

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

      // 1. Request Wallet Signature BEFORE touching the DB
      setStatus("Waiting for wallet approval...");
      const signer = await provider.getSigner(); 
      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setStatus("Sending transaction to blockchain...");
      const tx = await contractWithSigner.uploadDocument(ipfsHash, docHash, validSigners, {
          gasLimit: 500000 
      });
      
      // 2. Wait for immutable confirmation
      setStatus("Waiting for block confirmation...");
      await tx.wait();

      // 3. ONLY if successful, sync to local database
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
          console.warn("Blockchain succeeded, but off-chain DB sync had a delay.");
      }

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

  // Truncate long file names while preserving the extension
  const getDisplayName = (fileName) => {
    if (!fileName) return "";
    const maxLen = 35;
    if (fileName.length <= maxLen) return fileName;
    const ext = fileName.lastIndexOf(".") !== -1 ? fileName.substring(fileName.lastIndexOf(".")) : "";
    const nameWithoutExt = fileName.substring(0, fileName.length - ext.length);
    const truncatedName = nameWithoutExt.substring(0, maxLen - ext.length - 3);
    return `${truncatedName}...${ext}`;
  };

  return (
    <div className="flex flex-col items-center mt-10 w-full max-w-4xl mx-auto">
      <h2 className="page-title mb-6">Upload & Route Document</h2>
      <p className="page-subtitle mb-8">
        Secure your document and assign the wallets required to sign it.
      </p>

      <form onSubmit={handleUpload} className="w-full flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">
        
        {/* File Drop Zone */}
        <div className="dropzone min-h-[256px]">
          {!file && (
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={loading}
            />
          )}

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="icon-circle-file">
                <FileText className="text-seal-crimson" size={36} />
              </div>
              <p className="text-text-dark-primary font-medium break-all px-2 leading-relaxed max-w-full" title={file.name}>
                {getDisplayName(file.name)}
              </p>
              <p className="text-text-dark-secondary text-xs">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button type="button" onClick={() => setFile(null)} className="btn-remove mt-1">
                <X size={14} /> Remove File
              </button>
            </div>
          ) : (
            <>
              <UploadCloud className="mx-auto text-seal-crimson mb-4" size={40} />
              <p className="text-text-dark-primary font-medium">
                Click or Drag & Drop a file here
              </p>
              <p className="text-text-dark-secondary text-xs mt-1">PDF, DOCX, or any document format</p>
            </>
          )}
        </div>

        {/* Signatories Panel */}
        <div className="card-surface w-full p-6 min-h-[256px] flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-legal-muted pb-2 gap-2">
            <h3 className="font-bold text-text-dark-headers">Required Signatories</h3>
            <button 
              type="button" 
              onClick={() => setSigners([...signers, ""])}
              className="text-blockchain-blue hover:text-blockchain-blue/80 flex items-center text-sm font-bold whitespace-nowrap shrink-0"
            >
              <Plus size={14}/> Add Signer
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {signers.map((addr, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x... Wallet Address"
                  value={addr}
                  onChange={(e) => handleSignerChange(index, e.target.value)}
                  className="input-mono flex-1"
                  disabled={loading}
                />
                {signers.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setSigners(signers.filter((_, i) => i !== index))}
                    className="btn-icon-danger"
                  >
                    <Trash2 size={16}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Area */}
        <div className="lg:col-span-2 w-full max-w-lg mx-auto">
          {error && <p className="alert-error text-center mb-4">{error}</p>}
          {success && (
            <div className="alert-success mb-4 flex items-center justify-center gap-2">
              <CheckCircle size={18} /> <p className="font-medium">{status}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={!file || loading}
            className="btn-primary w-full py-3 px-4 flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2 truncate">
                <Clock className="animate-spin shrink-0" size={18} />
                <span className="truncate">{status}</span>
              </span>
            ) : "Secure Document on Blockchain"}
          </button>
        </div>
      </form>
    </div>
  );
}
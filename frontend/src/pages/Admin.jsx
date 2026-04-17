// src/pages/Admin.jsx
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";
import { ShieldCheck, Search, Clock, CheckCircle, AlertTriangle, FileText, Users } from "lucide-react";

export default function Admin() {
  const [hashInput, setHashInput] = useState("");
  const [documentDetails, setDocumentDetails] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [targetAddress, setTargetAddress] = useState("");
  const [roleAction, setRoleAction] = useState("grant"); 
  const [targetRole, setTargetRole] = useState("lawyer"); 
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    fetchPendingList();
  }, []);

  const fetchPendingList = async () => {
    setLoadingList(true);
    try {
      const response = await fetch("http://localhost:5000/api/documents/pending");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const formattedDocs = data.map(doc => ({
        hash: doc.docHash,
        ipfsHash: doc.ipfsHash,
        uploader: doc.uploaderAddress || doc.uploader,
        date: new Date(doc.timestamp).toLocaleString()
      }));
      setPendingDocuments(formattedDocs);
    } catch (err) {
      console.error("Failed to fetch pending list:", err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleRoleUpdate = async (e) => {
    e.preventDefault();
    if (!targetAddress) return;
    
    setIsUpdatingRole(true);
    setStatus("Waiting for wallet approval...");
    setError("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      let tx;
      setStatus(`Sending transaction to ${roleAction} ${targetRole}...`);

      if (roleAction === "grant" && targetRole === "lawyer") tx = await contract.addLawyer(targetAddress);
      else if (roleAction === "revoke" && targetRole === "lawyer") tx = await contract.removeLawyer(targetAddress);
      else if (roleAction === "grant" && targetRole === "governor") tx = await contract.addGovernor(targetAddress);
      else if (roleAction === "revoke" && targetRole === "governor") tx = await contract.removeGovernor(targetAddress);

      setStatus("Waiting for block confirmation...");
      await tx.wait();

      alert(`Success! Operation completed: ${roleAction.toUpperCase()} ${targetRole.toUpperCase()}`);
      setTargetAddress("");
    } catch (err) {
      console.error(err);
      if (err.message.includes("Safety Check")) {
        alert("Action denied: You cannot remove yourself from the Governor role.");
      } else {
        alert("Transaction failed. Ensure the address is correct and you have permission.");
      }
    } finally {
      setIsUpdatingRole(false);
      setStatus("");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!hashInput) return setError("Please enter a document hash.");
    setLoading(true); setError(""); setDocumentDetails(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const [isVerified, ipfsHash, timestamp, sigCount, reqCount] = await contract.verify(hashInput);

      if (timestamp === 0n) {
        setError("No document found with this hash on LexChain.");
      } else {
        setDocumentDetails({
          hash: hashInput,
          isVerified,
          ipfsHash,
          date: new Date(Number(timestamp) * 1000).toLocaleString(),
          signatures: Number(sigCount),
          requiredSignatures: Number(reqCount)
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch document details.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (targetHash) => {
    setLoading(true); setError(""); setStatus("Waiting for wallet approval...");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setStatus("Sending verification transaction...");
      const tx = await contract.verifyDocument(targetHash, {
        maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
        maxFeePerGas: ethers.parseUnits("40", "gwei")
      });
      
      setStatus("Waiting for block confirmation...");
      await tx.wait(); 

      fetchPendingList();
      if (documentDetails && documentDetails.hash === targetHash) {
         setDocumentDetails((prev) => ({ ...prev, isVerified: true })); 
      }
    } catch (err) {
      if (err.message.includes("Pending Signatures")) {
        setError("Cannot verify: Waiting for pending signatures.");
      } else {
        setError("Transaction failed: Your wallet is not an authorized Governor.");
      }
    } finally {
      setLoading(false); setStatus("");
    }
  };

  return (
    <div className="flex flex-col items-center mt-6 w-full max-w-5xl mx-auto px-4">
      <div className="bg-seal-crimson text-white p-3 rounded-full mb-4"><ShieldCheck size={40} /></div>
      <h2 className="text-3xl font-bold text-text-dark-headers mb-8">Admin Dashboard</h2>

      <div className="w-full bg-legal-surface border border-legal-muted rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-text-dark-headers mb-4 flex items-center gap-2 border-b border-legal-muted pb-2">
          <Users size={20} className="text-seal-crimson"/> System Role Management
        </h3>
        <form onSubmit={handleRoleUpdate} className="flex flex-col md:flex-row gap-3">
          <select 
            value={roleAction} 
            onChange={(e) => setRoleAction(e.target.value)}
            className="p-3 border border-legal-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-seal-crimson font-bold bg-legal-base text-text-dark-primary"
          >
            <option value="grant">Grant Access</option>
            <option value="revoke">Revoke Access</option>
          </select>

          <select 
            value={targetRole} 
            onChange={(e) => setTargetRole(e.target.value)}
            className="p-3 border border-legal-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-seal-crimson font-bold bg-legal-base text-text-dark-primary"
          >
            <option value="lawyer">Lawyer (Uploader)</option>
            <option value="governor">Governor (Admin)</option>
          </select>

          <input 
            type="text" 
            placeholder="0x... Target Wallet Address" 
            value={targetAddress} 
            onChange={(e) => setTargetAddress(e.target.value)} 
            className="flex-1 p-3 border border-legal-muted bg-legal-base text-text-dark-primary rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-seal-crimson placeholder-text-dark-secondary/50" 
            required
            disabled={isUpdatingRole}
          />

          <button 
            type="submit" 
            disabled={isUpdatingRole} 
            className={`${roleAction === 'grant' ? 'bg-seal-crimson hover:bg-seal-crimson/80 text-white' : 'bg-dark-error hover:bg-dark-error/80 text-white'} font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 whitespace-nowrap`}
          >
            {isUpdatingRole ? "Processing..." : "Execute Role Update"}
          </button>
        </form>
      </div>

      <div className="w-full grid md:grid-cols-2 gap-8 items-start">
        {/* Manual Search */}
        <div className="w-full">
          <h3 className="text-lg font-bold text-text-dark-headers mb-4 border-b border-legal-muted pb-2">Manual Verification</h3>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input type="text" placeholder="Paste SHA-256 Hash..." value={hashInput} onChange={(e) => setHashInput(e.target.value)} className="flex-1 p-3 border border-legal-muted bg-legal-base text-text-dark-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-seal-crimson" disabled={loading}/>
              <button type="submit" disabled={loading || !hashInput} className="bg-seal-crimson hover:bg-seal-crimson/80 text-white p-3 rounded-lg transition"><Search size={24} /></button>
            </div>
          </form>

          {error && <div className="bg-dark-error/10 text-dark-error border border-dark-error/20 p-4 rounded-lg mb-6 flex items-start gap-3"><AlertTriangle size={20} className="mt-0.5 flex-shrink-0" /><p>{error}</p></div>}

          {documentDetails && (
            <div className="border border-legal-muted rounded-xl p-6 bg-legal-surface shadow-sm">
              <div className="space-y-3 mb-6">
                <p className="text-sm text-text-dark-secondary"><span className="font-semibold text-text-dark-primary">Uploaded:</span> {documentDetails.date}</p>
                <div className="flex items-center gap-2 mt-2 border-t border-legal-muted pt-2">
                  <span className="font-semibold text-text-dark-primary text-sm">Signatures:</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${documentDetails.signatures === documentDetails.requiredSignatures ? 'bg-dark-success/20 text-dark-success' : 'bg-dark-warning/20 text-dark-warning'}`}>
                    {documentDetails.signatures} / {documentDetails.requiredSignatures} Collected
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold text-text-dark-primary text-sm">Status:</span>
                  {documentDetails.isVerified ? (
                    <span className="bg-dark-success/20 text-dark-success text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={14} /> Verified</span>
                  ) : (
                    <span className="bg-dark-warning/20 text-dark-warning text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Clock size={14} /> Pending Verification</span>
                  )}
                </div>
              </div>

              {!documentDetails.isVerified && (
                <button
                  onClick={() => handleVerify(documentDetails.hash)}
                  disabled={loading || documentDetails.signatures < documentDetails.requiredSignatures}
                  className="w-full bg-seal-crimson hover:bg-seal-crimson/80 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-legal-muted disabled:text-text-dark-secondary flex justify-center items-center gap-2"
                >
                  {loading ? status || "Processing..." : 
                    documentDetails.signatures < documentDetails.requiredSignatures ? "Awaiting Signatures..." : "Approve & Verify"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pending Inbox */}
        <div className="w-full bg-legal-base border border-legal-muted rounded-xl p-6 h-[500px] flex flex-col">
          <div className="flex justify-between items-center border-b border-legal-muted pb-2 mb-4">
            <h3 className="text-lg font-bold text-text-dark-headers flex items-center gap-2"><FileText size={20} className="text-blockchain-blue"/> Pending Inbox</h3>
            <span className="bg-blockchain-blue/20 text-blockchain-blue text-xs font-bold px-2 py-1 rounded-full">{pendingDocuments.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {loadingList ? <p className="text-center text-text-dark-secondary mt-10">Fetching...</p> : pendingDocuments.length === 0 ? <p className="text-center text-text-dark-secondary mt-10">No pending documents!</p> : (
              pendingDocuments.map((doc, index) => (
                <div key={index} className="bg-legal-surface p-4 rounded-lg shadow-sm border border-legal-muted">
                  <p className="text-xs text-text-dark-secondary mb-1">{doc.date}</p>
                  <p className="text-sm font-mono text-text-dark-primary truncate mb-2">Hash: {doc.hash.substring(0, 16)}...</p>
                  <div className="flex justify-between mt-3">
                     <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} target="_blank" rel="noreferrer" className="text-sm text-blockchain-blue hover:text-blockchain-blue/80 font-medium">Review ↗</a>
                     <button onClick={() => {setHashInput(doc.hash); handleSearch({preventDefault:()=>null});}} className="bg-legal-muted hover:bg-legal-muted/80 text-authority-gold text-xs font-bold py-1.5 px-4 rounded transition">Check Status</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
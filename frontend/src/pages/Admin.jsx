// src/pages/Admin.jsx
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";
import { ShieldCheck, Search, Clock, CheckCircle, AlertTriangle, FileText, Users } from "lucide-react";
import CustomSelect from "../components/CustomSelect";

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

      if (roleAction === "grant" && targetRole === "lawyer") tx = await contract.addLawyer(targetAddress, { gasLimit: 300000 });
      else if (roleAction === "revoke" && targetRole === "lawyer") tx = await contract.removeLawyer(targetAddress, { gasLimit: 300000 });
      else if (roleAction === "grant" && targetRole === "governor") tx = await contract.addGovernor(targetAddress, { gasLimit: 300000 });
      else if (roleAction === "revoke" && targetRole === "governor") tx = await contract.removeGovernor(targetAddress, { gasLimit: 300000 });

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
          gasLimit: 500000 
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
    <div className="flex flex-col items-center mt-6 w-full max-w-5xl mx-auto">
      <div className="icon-circle-crimson mb-4"><ShieldCheck size={40} /></div>
      <h2 className="page-title mb-8">Admin Dashboard</h2>

      {/* Role Management Panel */}
      <div className="card-surface w-full p-6 shadow-sm mb-8">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <Users size={20} className="text-seal-crimson shrink-0"/> System Role Management
        </h3>
        <form onSubmit={handleRoleUpdate} className="flex flex-col gap-3">
          {/* Selects Row */}
          <div className="grid grid-cols-2 gap-3">
            <CustomSelect
              value={roleAction}
              onChange={(e) => setRoleAction(e.target.value)}
              options={[
                { value: "grant", label: "Grant Access" },
                { value: "revoke", label: "Revoke Access" },
              ]}
              disabled={isUpdatingRole}
            />
            <CustomSelect
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              options={[
                { value: "lawyer", label: "Lawyer (Uploader)" },
                { value: "governor", label: "Governor (Admin)" },
              ]}
              disabled={isUpdatingRole}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <input 
              type="text" 
              placeholder="0x... Target Wallet Address" 
              value={targetAddress} 
              onChange={(e) => setTargetAddress(e.target.value)} 
              className="input-mono flex-1" 
              required
              disabled={isUpdatingRole}
            />
            <button 
              type="submit" 
              disabled={isUpdatingRole} 
              className={`${roleAction === 'grant' ? 'btn-primary' : 'btn-danger'} py-3 px-6 whitespace-nowrap shrink-0`}
            >
              {isUpdatingRole ? "Processing..." : "Execute Role Update"}
            </button>
          </div>
        </form>
      </div>

      {/* Two-Column Grid: Manual Search + Pending Inbox */}
      <div className="w-full flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Manual Search */}
        <div className="w-full">
          <h3 className="section-title mb-4">Manual Verification</h3>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Paste SHA-256 Hash..." 
                value={hashInput} 
                onChange={(e) => setHashInput(e.target.value)} 
                className="input-field flex-1" 
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading || !hashInput} 
                className="btn-primary p-3 shrink-0"
              >
                <Search size={24} />
              </button>
            </div>
          </form>

          {error && (
            <div className="alert-error mb-6 flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" /><p>{error}</p>
            </div>
          )}

          {documentDetails && (
            <div className="card-surface p-6 shadow-sm">
              <div className="space-y-3 mb-6">
                <p className="text-sm text-text-dark-secondary">
                  <span className="font-semibold text-text-dark-primary">Uploaded:</span> {documentDetails.date}
                </p>
                <div className="flex items-center gap-2 mt-2 border-t border-legal-muted pt-2 flex-wrap">
                  <span className="font-semibold text-text-dark-primary text-sm">Signatures:</span>
                  <span className={documentDetails.signatures === documentDetails.requiredSignatures ? 'badge-success' : 'badge-warning'}>
                    {documentDetails.signatures} / {documentDetails.requiredSignatures} Collected
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="font-semibold text-text-dark-primary text-sm">Status:</span>
                  {documentDetails.isVerified ? (
                    <span className="badge-success"><CheckCircle size={14} /> Verified</span>
                  ) : (
                    <span className="badge-warning"><Clock size={14} /> Pending Verification</span>
                  )}
                </div>
              </div>

              {!documentDetails.isVerified && (
                <button
                  onClick={() => handleVerify(documentDetails.hash)}
                  disabled={loading || documentDetails.signatures < documentDetails.requiredSignatures}
                  className="btn-primary w-full py-3 px-4 flex justify-center items-center gap-2"
                >
                  {loading ? status || "Processing..." : 
                    documentDetails.signatures < documentDetails.requiredSignatures ? "Awaiting Signatures..." : "Approve & Verify"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pending Inbox */}
        <div className="card-base w-full p-6 min-h-[300px] lg:min-h-[400px] max-h-[500px] flex flex-col">
          <div className="flex justify-between items-center border-b border-legal-muted pb-2 mb-4">
            <h3 className="text-lg font-bold text-text-dark-headers flex items-center gap-2">
              <FileText size={20} className="text-blockchain-blue shrink-0"/> Pending Inbox
            </h3>
            <span className="badge-info">{pendingDocuments.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {loadingList ? (
              <p className="text-center text-text-dark-secondary mt-10">Fetching...</p>
            ) : pendingDocuments.length === 0 ? (
              <p className="text-center text-text-dark-secondary mt-10">No pending documents!</p>
            ) : (
              pendingDocuments.map((doc, index) => (
                <div key={index} className="card-surface p-4 shadow-sm">
                  <p className="text-xs text-text-dark-secondary mb-1">{doc.date}</p>
                  <p className="text-sm font-mono text-text-dark-primary truncate mb-2">Hash: {doc.hash.substring(0, 16)}...</p>
                  <div className="flex justify-between mt-3">
                     <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} target="_blank" rel="noreferrer" className="text-sm text-blockchain-blue hover:text-blockchain-blue/80 font-medium">Review ↗</a>
                     <button onClick={() => {setHashInput(doc.hash); handleSearch({preventDefault:()=>null});}} className="btn-gold text-xs py-1.5 px-4">Check Status</button>
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
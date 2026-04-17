// src/pages/Sign.jsx
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";
import { useWeb3 } from "../context/Web3Context";
import { PenTool, CheckCircle, Clock, FileText, AlertTriangle } from "lucide-react";

export default function Sign() {
  const [pendingDocs, setPendingDocs] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [processingHash, setProcessingHash] = useState(null); 
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const { account } = useWeb3();

  useEffect(() => {
    if (account) {
      fetchMyDocuments();
    }
  }, [account]);

  const fetchMyDocuments = async () => {
    setLoadingList(true);
    try {
      const response = await fetch(`http://localhost:5000/api/documents/signatory/${account}`);
      if (!response.ok) throw new Error("Network error");
      
      const data = await response.json();
      setPendingDocs(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSign = async (docHash) => {
    setProcessingHash(docHash);
    setError("");
    setStatus("Waiting for wallet signature...");

    try {
      if (!window.ethereum) throw new Error("Please install MetaMask.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.signDocument(docHash, {
        maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
        maxFeePerGas: ethers.parseUnits("40", "gwei")
      });

      setStatus("Waiting for block confirmation...");
      await tx.wait();

      fetchMyDocuments();
      alert("Success! You have officially signed the document.");

    } catch (err) {
      console.error(err);
      if (err.message.includes("Unauthorized")) {
        setError("Blockchain Error: You are not an authorized signer for this document.");
      } else if (err.message.includes("already signed")) {
        setError("You have already signed this document.");
      } else {
        setError("Transaction failed or was rejected in MetaMask.");
      }
    } finally {
      setProcessingHash(null);
      setStatus("");
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 w-full max-w-2xl mx-auto px-4">
      <div className="bg-blockchain-blue/20 text-blockchain-blue p-4 rounded-full mb-4">
        <PenTool size={40} />
      </div>
      <h2 className="text-3xl font-bold text-text-dark-headers mb-2">Signatory Inbox</h2>
      <p className="text-text-dark-secondary mb-8 text-center">
        Review and sign legal documents assigned to your wallet address.
      </p>

      {error && (
        <div className="w-full bg-dark-error/10 border border-dark-error/20 text-dark-error p-4 rounded-lg mb-6 flex items-center gap-3">
          <AlertTriangle size={20} /> <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="w-full bg-legal-surface border border-legal-muted rounded-xl p-6 shadow-sm min-h-[300px]">
        {loadingList ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-dark-secondary">
            <Clock className="animate-spin mb-2" size={24} />
            <p>Checking for assigned documents...</p>
          </div>
        ) : pendingDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-dark-secondary text-center">
            <CheckCircle size={48} className="text-legal-muted mb-4" />
            <h3 className="text-lg font-bold text-text-dark-primary mb-1">You're all caught up!</h3>
            <p className="text-sm">No pending documents require your signature at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 border-b border-legal-muted pb-2">
              <FileText size={18} className="text-text-dark-secondary"/> 
              <span className="font-bold text-text-dark-primary">Action Required ({pendingDocs.length})</span>
            </div>
            
            {pendingDocs.map((doc, index) => (
              <div key={index} className="bg-legal-base border border-legal-muted rounded-lg p-4 hover:bg-legal-muted/40 transition flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1 w-full overflow-hidden">
                  <p className="text-xs text-text-dark-secondary mb-1">Uploaded: {new Date(doc.timestamp).toLocaleString()}</p>
                  <p className="text-sm font-mono text-text-dark-primary truncate w-full mb-2">Hash: {doc.docHash}</p>
                  <a 
                    href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-sm text-blockchain-blue hover:text-blockchain-blue/80 font-medium"
                  >
                    Review Document Contents ↗
                  </a>
                </div>
                
                <button
                  onClick={() => handleSign(doc.docHash)}
                  disabled={processingHash !== null}
                  className="w-full md:w-auto bg-seal-crimson hover:bg-seal-crimson/80 text-white font-bold py-2 px-6 rounded shadow-sm transition disabled:bg-legal-muted disabled:text-text-dark-secondary whitespace-nowrap"
                >
                  {processingHash === doc.docHash ? "Processing..." : "Sign Document"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
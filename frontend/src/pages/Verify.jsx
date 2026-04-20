// src/pages/Verify.jsx
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";
import { generateFileHash } from "../utils/hash"; 
import { UploadCloud, CheckCircle, XCircle, Clock, PenTool, FileText, X } from "lucide-react";

export default function Verify() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const generatedHash = await generateFileHash(uploadedFile);
      const AMOY_RPC_URL = "https://rpc-amoy.polygon.technology/"; 
      const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL); 
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const data = await contract.verify(generatedHash);

      setResult({
        isVerified: data[0],
        ipfsHash: data[1],
        timestamp: Number(data[2]), 
        sigCount: Number(data[3]), 
        reqCount: Number(data[4])  
      });
    } catch (err) {
      console.error(err);
      setError("Error checking the blockchain. Ensure you are connected to Polygon Amoy.");
    } finally {
      setLoading(false);
    }
  };

  // Truncate long file names while preserving the extension
  const getDisplayName = (fileName) => {
    if (!fileName) return "";
    const maxLen = 40;
    if (fileName.length <= maxLen) return fileName;
    const ext = fileName.lastIndexOf(".") !== -1 ? fileName.substring(fileName.lastIndexOf(".")) : "";
    const nameWithoutExt = fileName.substring(0, fileName.length - ext.length);
    const truncatedName = nameWithoutExt.substring(0, maxLen - ext.length - 3);
    return `${truncatedName}...${ext}`;
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="page-title mb-6">Verify a Document</h2>
      <p className="page-subtitle mb-8">
        Upload a document to instantly check its cryptographic authenticity and signature status on LexChain.
      </p>

      {/* Upload Zone */}
      <div className="dropzone max-w-lg mb-8 min-h-[180px]">
        {!file && (
          <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loading}/>
        )}

        {loading ? (
          <>
            <Clock className="mx-auto text-seal-crimson mb-3 animate-spin" size={40} />
            <p className="text-text-dark-primary font-medium">Analyzing file and checking blockchain...</p>
          </>
        ) : file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="icon-circle-file">
              <FileText className="text-seal-crimson" size={32} />
            </div>
            <p className="text-text-dark-primary font-medium text-sm break-all px-2 leading-relaxed max-w-full" title={file.name}>
              {getDisplayName(file.name)}
            </p>
            <p className="text-text-dark-secondary text-xs">{(file.size / 1024).toFixed(1)} KB</p>
            <button type="button" onClick={clearFile} className="btn-remove mt-1">
              <X size={14} /> Clear & Re-upload
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="mx-auto text-text-dark-secondary mb-4" size={40} />
            <p className="text-text-dark-primary font-medium">Click or Drag & Drop a document here</p>
            <p className="text-text-dark-secondary text-xs mt-1">PDF, DOCX, or any document format</p>
          </>
        )}
      </div>

      {error && (
        <div className="alert-error w-full max-w-lg flex items-center gap-2">
          <XCircle size={18} className="shrink-0"/> {error}
        </div>
      )}

      {result && result.timestamp > 0 && (
        <div className="card-surface w-full max-w-lg p-6 shadow-sm mt-4">
          <h3 className="text-xl font-semibold text-text-dark-headers border-b border-legal-muted pb-4 mb-4">Document Record Found</h3>
          <div className="space-y-4 text-text-dark-primary">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-text-dark-secondary">Status:</span>
              {result.isVerified ? (
                <span className="flex items-center gap-2 text-dark-success font-medium"><CheckCircle size={20} /> Officially Verified</span>
              ) : (
                <span className="flex items-center gap-2 text-dark-warning font-medium"><Clock size={20} /> Pending Verification</span>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-b border-legal-muted py-3 my-2 flex-wrap gap-2">
              <span className="text-text-dark-secondary">Signatures:</span>
              <span className="flex items-center gap-2 font-mono text-sm bg-legal-muted px-3 py-1 rounded text-seal-crimson">
                <PenTool size={16} /> {result.sigCount} / {result.reqCount}
              </span>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-text-dark-secondary">Timestamp:</span>
              <span className="text-text-dark-primary">{new Date(result.timestamp * 1000).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {result && result.timestamp === 0 && (
        <div className="w-full max-w-lg bg-dark-error/5 border border-dark-error/20 rounded-xl p-6 text-center mt-4">
          <XCircle className="mx-auto text-dark-error mb-2" size={32} />
          <h3 className="text-lg font-semibold text-dark-error">No Record Found</h3>
          <p className="text-dark-error/80 text-sm mt-1">This document does not exist on the LexChain network. It may be altered or forged.</p>
        </div>
      )}
    </div>
  );
}
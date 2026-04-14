import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";
import { generateFileHash } from "../utils/hash"; 
import { UploadCloud, CheckCircle, XCircle, Clock, PenTool } from "lucide-react";

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

      // NEW: Reads 5 values from blockchain
      const data = await contract.verify(generatedHash);

      setResult({
        isVerified: data[0],
        ipfsHash: data[1],
        timestamp: Number(data[2]), 
        sigCount: Number(data[3]), // Signatures collected
        reqCount: Number(data[4])  // Signatures required
      });
    } catch (err) {
      console.error(err);
      setError("Error checking the blockchain. Ensure you are connected to Polygon Amoy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Verify a Document</h2>
      <p className="text-slate-600 mb-8 text-center max-w-md">
        Upload a document to instantly check its cryptographic authenticity and signature status on LexChain.
      </p>

      <div className="w-full max-w-lg mb-8 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition relative">
        <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loading}/>
        {loading ? <Clock className="mx-auto text-blue-500 mb-4 animate-spin" size={48} /> : <UploadCloud className="mx-auto text-slate-400 mb-4" size={48} />}
        <p className="text-slate-600 font-medium">
          {loading ? "Analyzing file and checking blockchain..." : "Click or Drag & Drop a document here"}
        </p>
      </div>

      {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg w-full max-w-lg">{error}</p>}

      {result && result.timestamp > 0 && (
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold border-b pb-4 mb-4">Document Record Found</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status:</span>
              {result.isVerified ? (
                <span className="flex items-center gap-2 text-green-600 font-medium"><CheckCircle size={20} /> Officially Verified</span>
              ) : (
                <span className="flex items-center gap-2 text-amber-600 font-medium"><Clock size={20} /> Pending Verification</span>
              )}
            </div>

            {/* NEW: Signature Tracker on Public Face */}
            <div className="flex justify-between items-center border-t border-b border-slate-100 py-3 my-2">
              <span className="text-slate-500">Signatures:</span>
              <span className="flex items-center gap-2 font-mono text-sm bg-slate-100 px-3 py-1 rounded text-slate-700">
                <PenTool size={16} /> {result.sigCount} / {result.reqCount}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Timestamp:</span>
              <span className="text-slate-800">{new Date(result.timestamp * 1000).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {result && result.timestamp === 0 && (
        <div className="w-full max-w-lg bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <XCircle className="mx-auto text-red-500 mb-2" size={32} />
          <h3 className="text-lg font-semibold text-red-700">No Record Found</h3>
          <p className="text-red-600 text-sm mt-1">This document does not exist on the LexChain network. It may be altered or forged.</p>
        </div>
      )}
    </div>
  );
}
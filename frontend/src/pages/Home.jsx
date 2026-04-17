import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";
import { generateFileHash } from "../utils/hash"; 
import { Search, CheckCircle, XCircle, Clock, PenTool } from "lucide-react";

export default function Home() {
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
      setError("Error validating against LexChain. Please ensure the document is authentic and has not been altered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-12 w-full max-w-6xl mx-auto px-4">
      {/* AUTHORITATIVE HEADER: Serif font, large */}
      <h2 className="text-5xl font-header font-bold text-text-dark-headers mb-6 tracking-tight leading-tight">
        Blockchain Document Authentication
      </h2>
      <p className="text-text-dark-secondary mb-10 text-center max-w-xl text-lg leading-relaxed">
        Verify the legal status, signature count, and authenticity of any LexChain-secured document.
      </p>

      {/* DASHED UPLOAD AREA: Dark, subtle node pattern implied by the simple layout */}
      <div className="w-full max-w-2xl mb-12 border-2 border-dashed border-legal-muted rounded-2xl p-10 text-center hover:bg-legal-surface transition duration-150 relative bg-legal-base h-64 flex flex-col justify-center border-trust-teal/30">
        <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loading}/>
        {loading ? <Clock className="mx-auto text-blockchain-blue mb-4 animate-spin" size={56} /> : <Search className="mx-auto text-trust-teal mb-4" size={56} />}
        <p className="text-text-dark-primary font-medium text-lg">
          {loading ? "Performing cryptographic hash validation..." : "Drop file or Click here to Validate Authenticity"}
        </p>
      </div>

      {error && (
        <div className="w-full max-w-2xl bg-dark-error/10 text-dark-error p-5 rounded-xl mb-10 flex items-center justify-center gap-3 border border-dark-error/30 font-medium">
          <XCircle size={20} /> <p>{error}</p>
        </div>
      )}

      {/* RESULT CARD: Sophisticated Dark Charcoal Surface */}
      {result && result.timestamp > 0 && (
        <div className="w-full max-w-2xl bg-legal-surface border border-legal-muted rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl font-header font-bold border-b border-legal-muted pb-5 mb-5 tracking-tight text-text-dark-headers">
            LexChain Authentication Record Found
          </h3>
          <div className="space-y-5 text-text-dark-primary">
            <div className="flex justify-between items-center">
              <span className="text-text-dark-secondary">Status:</span>
              {result.isVerified ? (
                <span className="flex items-center gap-2.5 text-dark-success font-medium"><CheckCircle size={22} /> Officially Verified</span>
              ) : (
                <span className="flex items-center gap-2.5 text-dark-warning font-medium"><Clock size={22} /> Pending Verification</span>
              )}
            </div>

            {/* Signature Tracker: Mono font for numbers, Teal accent */}
            <div className="flex justify-between items-center border-t border-b border-legal-muted py-5 my-3">
              <span className="text-text-dark-secondary">Signatures Collected:</span>
              <span className="flex items-center gap-2 font-mono text-sm bg-legal-muted px-4 py-1.5 rounded text-trust-teal border border-trust-teal/10">
                <PenTool size={16} /> {result.sigCount} / {result.reqCount}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-text-dark-secondary">Blockchain Timestamp:</span>
              <span className="text-text-dark-primary">{new Date(result.timestamp * 1000).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* No Record Card: Darker, muted error style */}
      {result && result.timestamp === 0 && (
        <div className="w-full max-w-2xl bg-dark-error/5 border border-dark-error/20 rounded-2xl p-8 text-center shadow-lg">
          <XCircle className="mx-auto text-dark-error mb-4" size={40} />
          <h3 className="text-xl font-header font-bold text-dark-error mb-2 tracking-tight">LexChain Record Negative</h3>
          <p className="text-dark-error/90 text-sm mt-1">This document hash is not present on the LexChain network. It has likely been altered or is unauthorized.</p>
        </div>
      )}
    </div>
  );
}
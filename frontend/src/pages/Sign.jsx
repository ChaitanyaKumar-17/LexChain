// src/pages/Sign.jsx
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";
import { PenTool, CheckCircle, Clock } from "lucide-react";

export default function Sign() {
  const [hashInput, setHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSign = async (e) => {
    e.preventDefault();
    if (!hashInput) return setError("Please enter a document hash.");
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!window.ethereum) throw new Error("Please install MetaMask.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setStatus("Waiting for wallet signature...");
      
      const tx = await contract.signDocument(hashInput, {
        maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
        maxFeePerGas: ethers.parseUnits("40", "gwei")
      });

      setStatus("Waiting for block confirmation...");
      await tx.wait();

      setSuccess("You have successfully signed this document!");
      setHashInput("");
    } catch (err) {
      console.error(err);
      if (err.message.includes("Unauthorized")) {
        setError("You are not a required signer for this document.");
      } else if (err.message.includes("already signed")) {
        setError("You have already signed this document.");
      } else {
        setError("Transaction failed or was rejected.");
      }
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 w-full max-w-lg mx-auto px-4">
      <div className="bg-blue-100 text-blue-700 p-4 rounded-full mb-4">
        <PenTool size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign Document</h2>
      <p className="text-slate-600 mb-8 text-center">
        Enter the Document Hash to execute your cryptographic signature.
      </p>

      <form onSubmit={handleSign} className="w-full bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <input
          type="text"
          placeholder="Paste Document SHA-256 Hash..."
          value={hashInput}
          onChange={(e) => setHashInput(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 font-mono text-sm"
          disabled={loading}
        />

        {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-center gap-2 text-sm">
            <CheckCircle size={20} /> <p className="font-bold">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!hashInput || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-slate-400 flex justify-center items-center gap-2"
        >
          {loading ? <><Clock className="animate-spin" size={20} /> {status}</> : "Execute Signature"}
        </button>
      </form>
    </div>
  );
}
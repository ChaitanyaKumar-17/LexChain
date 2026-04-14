// src/components/Protected.jsx
import { Navigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

export default function Protected({ children, requireAdmin = false }) {
  // Just grab the data from our global state!
  const { account, isAdmin, isInitializing } = useWeb3();

  if (isInitializing) return <div className="p-8 text-center">Loading...</div>;

  if (!account) {
    return <div className="p-8 text-center text-red-600 font-bold">Please connect your wallet.</div>;
  }

  if (requireAdmin && !isAdmin) {
    return <div className="p-8 text-center text-red-600 font-bold">Access Denied: Admin Only.</div>;
  }

  return children;
}
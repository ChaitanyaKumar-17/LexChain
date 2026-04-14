// src/components/Protected.jsx
import { Navigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

export default function Protected({ children, requireAdmin = false, requireLawyer = false }) {
  const { account, isAdmin, isLawyer, isInitializing } = useWeb3();

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 font-medium animate-pulse">
          Authenticating Roles with Web3...
        </div>
      </div>
    );
  }

  if (!account) return <Navigate to="/" replace />;

  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  
  // NEW: Block non-lawyers from restricted routes
  if (requireLawyer && !isLawyer) return <Navigate to="/" replace />;

  return children;
}
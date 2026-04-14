// src/components/Protected.jsx
import { Navigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

export default function Protected({ children, requireAdmin = false }) {
  const { account, isAdmin, isInitializing } = useWeb3();

  // 1. Show a loading state while MetaMask is connecting/checking status
  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 font-medium animate-pulse">
          Authenticating with Web3...
        </div>
      </div>
    );
  }

  // 2. If no wallet is connected, bounce them to the public home page
  if (!account) {
    // The 'replace' prop ensures they don't get stuck in a back-button loop
    return <Navigate to="/" replace />;
  }

  // 3. If the route needs Governor rights and they aren't a Governor, bounce them
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. If all checks pass, render the protected page (Upload or Admin Dashboard)
  return children;
}
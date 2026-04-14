// src/components/NavigationBar.jsx
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

const NavigationBar = () => {
  // Pulling directly from our global Web3Context
  const { account, isAdmin, isLawyer, connectWallet } = useWeb3();

  const formatAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return (
    <nav className="bg-white shadow-md p-4 mb-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">LexChain</h1>
        
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Verify Document</Link>

          {/* Connected Links */}
          {account && (
            <Link to="/sign" className="text-gray-600 hover:text-blue-600 font-medium">Sign Portal</Link>
          )}

          {/* UPGRADED: Only show Upload Portal if the user holds the Lawyer role */}
          {isLawyer && (
            <Link to="/upload" className="text-gray-600 hover:text-blue-600 font-medium">Upload Portal</Link>
          )}
          
          {/* Admin Link */}
          {isAdmin && (
            <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium">Gov Admin</Link>
          )}

          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm"
          >
            {account ? formatAddress(account) : "Connect Wallet"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
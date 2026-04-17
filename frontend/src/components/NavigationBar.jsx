import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

const NavigationBar = () => {
  const { account, isAdmin, isLawyer, connectWallet } = useWeb3();

  const formatAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return (
    <nav className="bg-white shadow-md p-4 mb-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">LexChain</h1>
        
        <div className="flex items-center gap-6">
          {/* 1. PUBLIC PORTAL: Visible to everyone, connected or not */}
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">
            Verify Document
          </Link>

          {/* 2. SIGNATORY PORTAL: Must be connected, but strictly NEITHER a Lawyer nor Governor */}
          {account && !isAdmin && !isLawyer && (
            <Link to="/sign" className="text-gray-600 hover:text-blue-600 font-medium">
              Sign Portal
            </Link>
          )}

          {/* 3. LAWYER PORTAL: Only visible if the wallet holds the Lawyer role */}
          {isLawyer && (
            <Link to="/upload" className="text-gray-600 hover:text-blue-600 font-medium">
              Upload Portal
            </Link>
          )}
          
          {/* 4. ADMIN PORTAL: Only visible if the wallet holds the Governor role */}
          {isAdmin && (
            <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium">
              Gov Admin
            </Link>
          )}

          {/* Connect / Disconnect UI */}
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition duration-200"
          >
            {account ? formatAddress(account) : "Connect Wallet"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
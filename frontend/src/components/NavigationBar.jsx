import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { Scale } from "lucide-react";

const NavigationBar = () => {
  const { account, isAdmin, isLawyer, connectWallet } = useWeb3();

  const formatAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const navLinkClass = "text-text-dark-secondary hover:text-blockchain-blue font-medium transition duration-150 text-sm flex items-center gap-1.5";

  return (
    <nav className="bg-legal-surface shadow-lg border-b border-legal-muted p-4 mb-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Authoritative Teal Logo with serious icon */}
        <div className="flex items-center gap-2">
          <Scale className="text-trust-teal" size={28}/>
          <h1 className="text-2xl font-header font-bold text-trust-teal tracking-tighter">
            LexChain
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <Link to="/" className={navLinkClass}>Verify Document</Link>

          {/* Connected Links */}
          {account && (
            <Link to="/sign" className={navLinkClass}>Sign Portal</Link>
          )}

          {/* ROLE CHECK: Only visible to authorized Lawyers */}
          {isLawyer && (
            <Link to="/upload" className={navLinkClass}>Upload Portal</Link>
          )}
          
          {/* Admin Link with special highlighting */}
          {isAdmin && (
            <Link to="/admin" className={`${navLinkClass} text-dark-warning`}>Gov Admin</Link>
          )}

          {/* Connect Wallet Button: Sophisticated Muted Gold */}
          <button
            onClick={connectWallet}
            className="bg-legal-muted hover:bg-legal-muted/80 text-authority-gold px-5 py-2.5 rounded-lg text-sm font-bold transition duration-200 shadow-sm flex items-center gap-2 border border-authority-gold/20"
          >
            {account ? formatAddress(account) : "Connect Wallet"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
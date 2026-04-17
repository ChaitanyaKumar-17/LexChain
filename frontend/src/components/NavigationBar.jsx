// src/components/NavigationBar.jsx
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

// The Custom SVG Logo Component (Gold Theme)
const LexChainLogo = () => (
  <svg 
    width="34" 
    height="34" 
    viewBox="0 0 36 36" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="transform transition-transform duration-300 hover:scale-105"
  >
    {/* Outer Hexagon representing a Blockchain Node */}
    <path 
      d="M18 2.5L31 10V25L18 32.5L5 25V10L18 2.5Z" 
      stroke="#C5A065" 
      strokeWidth="2.5" 
      strokeLinejoin="round"
    />
    {/* Center Legal Pillar */}
    <path 
      d="M18 9V26" 
      stroke="#C5A065" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    {/* Base of the Pillar */}
    <path 
      d="M14 26H22" 
      stroke="#C5A065" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    {/* The Scale Beam */}
    <path 
      d="M10 14H26" 
      stroke="#C5A065" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    {/* Left Scale Pan */}
    <path 
      d="M10 14L7.5 21H12.5L10 14Z" 
      fill="#C5A065" 
      stroke="#C5A065" 
      strokeWidth="1" 
      strokeLinejoin="round"
    />
    {/* Right Scale Pan */}
    <path 
      d="M26 14L23.5 21H28.5L26 14Z" 
      fill="#C5A065" 
      stroke="#C5A065" 
      strokeWidth="1" 
      strokeLinejoin="round"
    />
  </svg>
);

const NavigationBar = () => {
  const { account, isAdmin, isLawyer, connectWallet } = useWeb3();

  const formatAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const navLinkClass = "text-text-dark-secondary hover:text-blockchain-blue font-medium transition duration-150 text-sm flex items-center gap-1.5";

  return (
    <nav className="bg-legal-surface shadow-lg border-b border-legal-muted p-4 mb-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* Brand Logo & Name Area */}
        <div className="flex items-center gap-3">
          <LexChainLogo />
          <h1 className="text-2xl font-header font-bold text-white tracking-tighter pt-1">
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
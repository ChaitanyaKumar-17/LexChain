// src/components/NavigationBar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { Menu, X } from "lucide-react";

const LexChainLogo = () => (
  <svg 
    width="34" 
    height="34" 
    viewBox="0 0 36 36" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="transform transition-transform duration-300 hover:scale-105"
  >

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const formatAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  const isActive = (path) => location.pathname === path;
  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="navbar-brand" onClick={closeMobile}>
          <LexChainLogo />
          <h1 className="navbar-brand-title">LexChain</h1>
        </Link>
        
        {/* Desktop Navigation — hidden below lg */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6">
          <Link to="/" className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}>
            Verify Document
          </Link>

          {account && (
            <Link to="/sign" className={`nav-link ${isActive("/sign") ? "nav-link-active" : ""}`}>
              Sign Portal
            </Link>
          )}

          {isLawyer && (
            <Link to="/upload" className={`nav-link ${isActive("/upload") ? "nav-link-active" : ""}`}>
              Upload Portal
            </Link>
          )}
          
          {isAdmin && (
            <Link to="/admin" className="nav-link-warning">Gov Admin</Link>
          )}

          <button onClick={connectWallet} className="wallet-btn">
            {account ? formatAddress(account) : "Connect Wallet"}
          </button>
        </div>

        {/* Tablet: Wallet Badge + Hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          {account && (
            <span className="wallet-address-mobile">
              {formatAddress(account)}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hamburger-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Tablet Menu Dropdown */}
      <div
        className={`lg:hidden mobile-menu ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mobile-menu-inner">
          <Link to="/" className={`mobile-nav-link ${isActive("/") ? "mobile-nav-link-active" : ""}`} onClick={closeMobile}>
            Verify Document
          </Link>

          {account && (
            <Link to="/sign" className={`mobile-nav-link ${isActive("/sign") ? "mobile-nav-link-active" : ""}`} onClick={closeMobile}>
              Sign Portal
            </Link>
          )}

          {isLawyer && (
            <Link to="/upload" className={`mobile-nav-link ${isActive("/upload") ? "mobile-nav-link-active" : ""}`} onClick={closeMobile}>
              Upload Portal
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="mobile-nav-link-warning" onClick={closeMobile}>
              Gov Admin
            </Link>
          )}

          {!account && (
            <button
              onClick={() => { connectWallet(); closeMobile(); }}
              className="mobile-wallet-btn btn-gold"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
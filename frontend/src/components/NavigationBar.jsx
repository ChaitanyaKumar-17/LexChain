import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";

const NavigationBar = () => {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async (connectedAccount) => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const isUserGovernor = await contract.isGovernor(connectedAccount);
      setIsAdmin(isUserGovernor);
    } catch (error) {
      console.error("Error checking governor status:", error);
      setIsAdmin(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask.");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkAdmin(accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkAdmin(accounts[0]);
        }
        window.ethereum.on("accountsChanged", (newAccounts) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
            checkAdmin(newAccounts[0]);
          } else {
            setAccount("");
            setIsAdmin(false);
          }
        });
      }
    };
    checkIfWalletIsConnected();
  }, []);

  const formatAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return (
    <nav className="bg-white shadow-md p-4 mb-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">LexChain</h1>
        
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Verify Document</Link>

          {/* Connected Links */}
          {account && (
            <>
              <Link to="/upload" className="text-gray-600 hover:text-blue-600 font-medium">Upload Portal</Link>
              <Link to="/sign" className="text-gray-600 hover:text-blue-600 font-medium">Sign Portal</Link>
            </>
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
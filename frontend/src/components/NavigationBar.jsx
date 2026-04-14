import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";

const NavigationBar = () => {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to check if the connected wallet is the Admin
  const checkAdmin = async (connectedAccount) => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Fetch the admin address from the smart contract
      const adminAddress = await contract.admin();
      
      // Compare addresses (convert to lowercase to avoid case-sensitivity bugs)
      setIsAdmin(connectedAccount.toLowerCase() === adminAddress.toLowerCase());
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  // Function triggered by the "Connect Wallet" button
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this feature.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkAdmin(accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  // Effect to run when the component first loads
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // "eth_accounts" checks if already connected without popping up MetaMask
        const accounts = await provider.send("eth_accounts", []);
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkAdmin(accounts[0]);
        }

        // Event listener: If the user switches accounts in MetaMask, update the UI
        window.ethereum.on("accountsChanged", (newAccounts) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
            checkAdmin(newAccounts[0]);
          } else {
            // User disconnected their wallet
            setAccount("");
            setIsAdmin(false);
          }
        });
      }
    };

    checkIfWalletIsConnected();
  }, []);

  // Helper to make the wallet address look nice (e.g., 0x1234...5678)
  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="bg-white shadow-md p-4 mb-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">LexChain</h1>
        
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">
            Verify Document
          </Link>
          <Link to="/upload" className="text-gray-600 hover:text-blue-600 font-medium">
            Upload Portal
          </Link>
          
          {/* Only render this link if the user is the Admin */}
          {isAdmin && (
            <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium">
              Gov Admin
            </Link>
          )}

          {/* Connect Wallet Button */}
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 shadow-sm"
          >
            {account ? formatAddress(account) : "Connect Wallet"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
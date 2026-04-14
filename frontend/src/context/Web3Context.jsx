// src/context/Web3Context.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";

// 1. Create the Context
const Web3Context = createContext();

// 2. Create the Provider Component
export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const checkAdmin = async (connectedAccount) => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // UPGRADED: We now check the 'isGovernor' mapping instead of the old 'admin()' variable
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
      console.error("Connection failed:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await checkAdmin(accounts[0]);
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
      setIsInitializing(false);
    };
    init();
  }, []);

  // 3. Provide the data to the rest of the app
  return (
    <Web3Context.Provider value={{ account, isAdmin, connectWallet, isInitializing }}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to easily grab this data anywhere
export const useWeb3 = () => useContext(Web3Context);
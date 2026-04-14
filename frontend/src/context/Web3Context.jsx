// src/context/Web3Context.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/config";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLawyer, setIsLawyer] = useState(false); // NEW: Track the Lawyer role
  const [isInitializing, setIsInitializing] = useState(true);

  // UPGRADED: Checks both Governor and Lawyer status
  const checkRoles = async (connectedAccount) => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const govStatus = await contract.isGovernor(connectedAccount);
      const lawyerStatus = await contract.isLawyer(connectedAccount);
      
      setIsAdmin(govStatus);
      setIsLawyer(lawyerStatus);
    } catch (error) {
      console.error("Error checking roles:", error);
      setIsAdmin(false);
      setIsLawyer(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask.");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkRoles(accounts[0]);
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
          await checkRoles(accounts[0]);
        }
        
        window.ethereum.on("accountsChanged", (newAccounts) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
            checkRoles(newAccounts[0]);
          } else {
            setAccount("");
            setIsAdmin(false);
            setIsLawyer(false);
          }
        });
      }
      setIsInitializing(false);
    };
    init();
  }, []);

  return (
    <Web3Context.Provider value={{ account, isAdmin, isLawyer, connectWallet, isInitializing }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
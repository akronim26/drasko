import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

export const useWalletConnection = () => {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const getShortAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const connectWallet = async () => {
    setIsConnecting(true);

    try {
      if (!window.ethereum) {
        toast.error("No wallet extension found!");
        return;
      }

      console.log("Creating provider...");
      const providerInstance = new ethers.BrowserProvider(window.ethereum);
      await providerInstance.send("eth_requestAccounts", []);
      const signerInstance = await providerInstance.getSigner();
      const userAddress = await signerInstance.getAddress();

      if (userAddress) {
        if (userAddress !== address) {
          setAddress(userAddress);
          setProvider(providerInstance);
          setSigner(signerInstance);
          toast.success("Wallet connected!");
        }
      } else {
        toast.error("No account returned from wallet.");
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      if (error.code === 4001) {
        toast.error("Connection rejected by user.");
      } else {
        toast.error("Failed to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const providerInstance = new ethers.BrowserProvider(window.ethereum);
          const signerInstance = await providerInstance.getSigner();
          setProvider(providerInstance);
          setSigner(signerInstance);
          setAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        setProvider(null);
        setSigner(null);
        toast.info("Wallet disconnected.");
      } else {
        setAddress(accounts[0]);
        toast.info("Wallet account changed.");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return {
    address,
    provider,
    signer,
    isConnecting,
    connectWallet,
    getShortAddress,
    isConnected: !!address,
  };
};
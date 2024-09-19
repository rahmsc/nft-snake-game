"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

interface Web3ContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  simulateMint: (code: string) => Promise<string>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  };

  const simulateMint = async (code: string): Promise<string> => {
    if (!account) {
      throw new Error("Wallet not connected");
    }
    // Simulate minting process
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay to simulate transaction
    const fakeTokenId = Math.floor(Math.random() * 1000000).toString();
    console.log(
      `Simulated minting of token ${fakeTokenId} with code ${code} for account ${account}`
    );
    return fakeTokenId;
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (...args: unknown[]) => {
        const accounts = args[0] as string[];
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, connectWallet, simulateMint }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

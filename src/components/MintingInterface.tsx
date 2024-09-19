"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "../components/web3Provider";
import { truncateAddress } from "@/utils/addressUtils";

export default function MintingInterface() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "validating" | "minting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const { account, connectWallet, simulateMint } = useWeb3();

  const handleMint = async () => {
    if (!account) {
      setMessage("Please connect your wallet first.");
      return;
    }

    setStatus("validating");
    try {
      // First, validate the code
      const validateResponse = await fetch("/api/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const validateData = await validateResponse.json();

      if (validateData.valid) {
        setStatus("minting");
        // Simulate minting process
        const tokenId = await simulateMint(code);
        setStatus("success");
        setMessage(`NFT minted successfully! Token ID: ${tokenId}`);
      } else {
        setStatus("error");
        setMessage(
          "Invalid code. Please enter a valid code generated from the game."
        );
      }
    } catch (error) {
      console.error("Minting error:", error);
      setStatus("error");
      setMessage("An error occurred during minting. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 pixel-border">
      <h2 className="text-2xl font-bold">Mint Your NFT</h2>
      {!account ? (
        <Button onClick={connectWallet} className="pixel-button">
          Connect Wallet
        </Button>
      ) : (
        <>
          <p className="text-sm">Connected: {truncateAddress(account)}</p>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your unique code"
            className="w-full max-w-xs pixel-border"
          />
          <Button
            onClick={handleMint}
            disabled={status === "validating" || status === "minting"}
            className="w-full max-w-xs pixel-button"
          >
            {status === "idle" && "Mint NFT"}
            {status === "validating" && "Validating..."}
            {status === "minting" && "Minting..."}
            {status === "success" && "Minted!"}
            {status === "error" && "Try Again"}
          </Button>
        </>
      )}
      {message && (
        <p
          className={`text-sm ${
            status === "success" ? "text-green-800" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

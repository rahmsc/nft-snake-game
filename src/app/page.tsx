import React from "react";
import dynamic from "next/dynamic";
import MintingInterface from "@/components/MintingInterface";

const SnakeGame = dynamic(() => import("@/components/SnakeGame"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex justify-center min-h-screen bg-[var(--background-color)]">
      <main className="w-full max-w-[85%] p-4">
        <h1 className="text-4xl font-bold  pixel-border p-4 text-center">
          NFT Snake Game
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="pixel-border p-4">
            <SnakeGame onGameComplete={handleGameComplete} />
          </div>
          <div className="pixel-border p-4">
            <h2 className="text-2xl font-semibold mb-4">Mint Your NFT</h2>
            <MintingInterface />
          </div>
        </div>
      </main>
    </div>
  );
}
async function handleGameComplete(score: number) {
  "use server";

  if (score >= 10) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/generate-code`, {
        method: "POST",
      });
      const data = await response.json();
      return data.code;
    } catch (error) {
      console.error("Error generating code:", error);
      return null;
    }
  }
  return null;
}

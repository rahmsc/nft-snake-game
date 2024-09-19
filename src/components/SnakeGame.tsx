"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "../components/web3Provider";

const CANVAS_SIZE = [400, 400];
const SNAKE_START = [
  [8, 7],
  [8, 8],
];
const APPLE_START = [8, 3];
const SCALE = 20;
const SPEED = 100;
const DIRECTIONS = {
  38: [0, -1], // up
  40: [0, 1], // down
  37: [-1, 0], // left
  39: [1, 0], // right
};

export default function SnakeGame({
  onGameComplete,
}: {
  onGameComplete: (score: number) => void;
}) {
  const { account, connectWallet } = useWeb3();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [dir, setDir] = useState([0, -1]);
  const [speed, setSpeed] = useState<null | number>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const createApple = useCallback(
    () =>
      Array.from({ length: 2 }, () =>
        Math.floor(Math.random() * (CANVAS_SIZE[0] / SCALE))
      ),
    []
  );

  const generateCode = useCallback(async () => {
    try {
      const response = await fetch("/api/generate-code", { method: "POST" });
      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (error) {
      console.error("Error generating code:", error);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const moveSnake = useCallback(() => {
    const newSnake = [...snake];
    const newSnakeHead = [
      (newSnake[0][0] + dir[0] + CANVAS_SIZE[0] / SCALE) %
        (CANVAS_SIZE[0] / SCALE),
      (newSnake[0][1] + dir[1] + CANVAS_SIZE[1] / SCALE) %
        (CANVAS_SIZE[1] / SCALE),
    ];
    newSnake.unshift(newSnakeHead as [number, number]);
    if (newSnakeHead[0] === apple[0] && newSnakeHead[1] === apple[1]) {
      setScore((prevScore) => {
        const newScore = prevScore + 1;
        if (newScore === 3 && !generatedCode) {
          // Change to 10 for final version
          generateCode();
        }
        return newScore;
      });
      setApple(createApple());
    } else {
      newSnake.pop();
    }
    return newSnake;
  }, [snake, dir, apple, createApple, generatedCode, generateCode]);

  const checkCollision = useCallback(
    (piece: number[], snk = snake) => {
      if (
        piece[0] * SCALE >= CANVAS_SIZE[0] ||
        piece[0] < 0 ||
        piece[1] * SCALE >= CANVAS_SIZE[1] ||
        piece[1] < 0
      )
        return true;
      for (const segment of snk) {
        if (piece[0] === segment[0] && piece[1] === segment[1]) return true;
      }
      return false;
    },
    [snake]
  );

  const endGame = useCallback(() => {
    setSpeed(null);
    setGameOver(true);
    onGameComplete(score);
  }, [score, onGameComplete]);

  const gameLoop = useCallback(() => {
    const newSnake = moveSnake();
    if (checkCollision(newSnake[0])) {
      endGame();
    } else {
      setSnake(newSnake);
    }
  }, [moveSnake, checkCollision, endGame]);

  const startGame = useCallback(() => {
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    setDir([0, -1]);
    setSpeed(SPEED);
    setGameOver(false);
    setScore(0);
    setGeneratedCode(null);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (context) {
      context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
      context.fillStyle = "var(--snake-color)";
      for (const [x, y] of snake) {
        context.fillRect(x, y, 1, 1);
      }
      context.fillStyle = "var(--apple-color)";
      context.fillRect(apple[0], apple[1], 1, 1);
    }
  }, [snake, apple]);

  useEffect(() => {
    if (speed !== null) {
      const intervalId = setInterval(gameLoop, speed);
      return () => clearInterval(intervalId);
    }
  }, [speed, gameLoop]);

  const changeDirection = useCallback((e: KeyboardEvent) => {
    const key = e.keyCode;
    setDir((prevDir) => {
      if (key === 37 && prevDir[0] !== 1) return DIRECTIONS[37];
      if (key === 38 && prevDir[1] !== 1) return DIRECTIONS[38];
      if (key === 39 && prevDir[0] !== -1) return DIRECTIONS[39];
      if (key === 40 && prevDir[1] !== -1) return DIRECTIONS[40];
      return prevDir;
    });
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", changeDirection);
    return () => document.removeEventListener("keydown", changeDirection);
  }, [changeDirection]);

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p>Please connect your wallet to play the game.</p>
        <Button onClick={connectWallet} className="pixel-button">
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="text-2xl font-bold">Score: {score}</div>
      <canvas
        ref={canvasRef}
        width={`${CANVAS_SIZE[0]}px`}
        height={`${CANVAS_SIZE[1]}px`}
        className="pixel-border"
      />
      {gameOver && (
        <div className="text-xl font-semibold text-red-500 text-center">
          Game Over! Your final score: {score}
        </div>
      )}
      {generatedCode && (
        <div className="text-xl font-semibold text-green-800 text-center w-full px-4">
          <p>Congratulations!</p>
          <p>Your unique code: {generatedCode}</p>
        </div>
      )}
      <Button onClick={startGame} className="pixel-button">
        {gameOver ? "Restart Game" : "Start Game"}
      </Button>
    </div>
  );
}

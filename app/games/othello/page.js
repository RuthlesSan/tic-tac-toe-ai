"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SIZE = 8;

const createBoard = () => {
  const board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));

  // Initial setup
  board[3][3] = "W";
  board[3][4] = "B";
  board[4][3] = "B";
  board[4][4] = "W";

  return board;
};

const directions = [
  [0,1],[1,0],[0,-1],[-1,0],
  [1,1],[1,-1],[-1,1],[-1,-1]
];

export default function Othello() {
  const router = useRouter();

  const [board, setBoard] = useState(createBoard());
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(null);

  const [playerTurn, setPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);

  // 🔊 sounds
  const clickSound = typeof Audio !== "undefined" ? new Audio("/click.mp3") : null;

  const playSound = (sound) => {
    if (!sound) return;
    sound.currentTime = 0;
    sound.play();
  };

  // 🧠 Check valid move
  const isValidMove = (b, row, col, player) => {
    if (b[row][col]) return false;

    const opponent = player === "B" ? "W" : "B";

    for (let [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      let foundOpponent = false;

      while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
        if (b[r][c] === opponent) {
          foundOpponent = true;
        } else if (b[r][c] === player) {
          if (foundOpponent) return true;
          break;
        } else break;

        r += dr;
        c += dc;
      }
    }
    return false;
  };

  // 🔄 Apply move (flip discs)
  const makeMove = (row, col, player) => {
    const newBoard = board.map(r => [...r]);
    const opponent = player === "B" ? "W" : "B";

    newBoard[row][col] = player;

    for (let [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      let toFlip = [];

      while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
        if (newBoard[r][c] === opponent) {
          toFlip.push([r,c]);
        } else if (newBoard[r][c] === player) {
          toFlip.forEach(([fr,fc]) => {
            newBoard[fr][fc] = player;
          });
          break;
        } else break;

        r += dr;
        c += dc;
      }
    }

    return newBoard;
  };

  // 🤖 AI (random for now)
  const aiMove = (currentBoard) => {
    let moves = [];

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (isValidMove(currentBoard, r, c, "W")) {
          moves.push([r,c]);
        }
      }
    }

    if (moves.length === 0) return;

    const [r,c] = moves[Math.floor(Math.random() * moves.length)];
    const newBoard = makeMove(r, c, "W");
    setBoard(newBoard);
    setPlayerTurn(true);
  };

  const handleClick = (row, col) => {
    if (!playerTurn || winner) return;
    if (!isValidMove(board, row, col, "B")) return;

    playSound(clickSound);

    const newBoard = makeMove(row, col, "B");
    setBoard(newBoard);
    setPlayerTurn(false);

    setTimeout(() => aiMove(newBoard), 500);
  };

  const resetGame = () => {
    setBoard(createBoard());
    setWinner(null);
    setPlayerTurn(true);
  };

  // 🎮 START SCREEN
  if (!gameStarted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-5xl mb-6 font-bold">Othello</h1>

        <p className="mb-3">
          {difficulty ? `Difficulty: ${difficulty.toUpperCase()}` : "Select Difficulty:"}
        </p>

        <div className="flex gap-4 mb-6">
          {["easy","medium","hard"].map(level => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className="px-5 py-2 rounded bg-blue-500 font-bold"
            >
              {level}
            </button>
          ))}
        </div>

        <button
          onClick={() => setGameStarted(true)}
          className="px-8 py-3 bg-blue-500 rounded-xl font-bold"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">

      <h1 className="text-3xl mb-2">Othello</h1>
      <p className="mb-4">
        Difficulty: <span className="uppercase">{difficulty}</span>
      </p>

      {/* Board */}
      <div className="grid grid-cols-8 gap-1 bg-green-800 p-2 rounded-xl">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => handleClick(r,c)}
              className="w-10 h-10 bg-green-700 flex items-center justify-center cursor-pointer"
            >
              {cell === "B" && <div className="w-6 h-6 bg-black rounded-full" />}
              {cell === "W" && <div className="w-6 h-6 bg-white rounded-full" />}
            </div>
          ))
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4">
        <button onClick={resetGame} className="bg-yellow-500 px-4 py-2 rounded">
          Reset
        </button>

        <button
          onClick={() => {
            resetGame();
            setGameStarted(false);
          }}
          className="bg-red-500 px-4 py-2 rounded"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
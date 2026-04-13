"use client";
import { useState } from "react";

const emptyBoard = Array(9).fill(null);

function checkWinner(board) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  for (let [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return board.includes(null) ? null : "Draw";
}

// HARD (Minimax)
function minimax(board, isMaximizing) {
  const winner = checkWinner(board);

  if (winner === "O") return 1;
  if (winner === "X") return -1;
  if (winner === "Draw") return 0;

  if (isMaximizing) {
    let best = -Infinity;
    board.forEach((cell, i) => {
      if (!cell) {
        board[i] = "O";
        let score = minimax(board, false);
        board[i] = null;
        best = Math.max(score, best);
      }
    });
    return best;
  } else {
    let best = Infinity;
    board.forEach((cell, i) => {
      if (!cell) {
        board[i] = "X";
        let score = minimax(board, true);
        board[i] = null;
        best = Math.min(score, best);
      }
    });
    return best;
  }
}

function bestMove(board) {
  let bestScore = -Infinity;
  let move;

  board.forEach((cell, i) => {
    if (!cell) {
      board[i] = "O";
      let score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  });

  return move;
}

// EASY
function randomMove(board) {
  const empty = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v) => v !== null);

  return empty[Math.floor(Math.random() * empty.length)];
}

// MEDIUM
function mediumMove(board) {
  return Math.random() < 0.5 ? randomMove(board) : bestMove(board);
}

export default function Home() {
  const [board, setBoard] = useState(emptyBoard);
  const [gameStarted, setGameStarted] = useState(false);
  const [result, setResult] = useState(null);

  const [difficulty, setDifficulty] = useState("hard");

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [round, setRound] = useState(1);

  const getAIMove = (board) => {
    if (difficulty === "easy") return randomMove(board);
    if (difficulty === "medium") return mediumMove(board);
    return bestMove(board);
  };

  const handleClick = (index) => {
    if (board[index] || result) return;

    let newBoard = [...board];
    newBoard[index] = "X";

    let winner = checkWinner(newBoard);
    if (winner) return endRound(winner, newBoard);

    let aiMove = getAIMove(newBoard);
    newBoard[aiMove] = "O";

    winner = checkWinner(newBoard);
    endRound(winner, newBoard);
  };

  const endRound = (winner, newBoard) => {
    setBoard(newBoard);

    if (winner === "X") setPlayerScore((s) => s + 1);
    if (winner === "O") setAiScore((s) => s + 1);

    if (winner) setResult(winner);
  };

  const nextRound = () => {
    setBoard(emptyBoard);
    setResult(null);
    setRound((r) => r + 1);
  };

  const resetGame = () => {
    setBoard(emptyBoard);
    setResult(null);
    setPlayerScore(0);
    setAiScore(0);
    setRound(1);
  };

  // START SCREEN
  if (!gameStarted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-5xl mb-6 font-bold">Tic Tac Toe</h1>

        <div className="mb-4 text-center">
          <p className="mb-2 text-lg">
            {difficulty
              ? `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
              : "Select Difficulty:"}
          </p>
          <div className="flex gap-4 justify-center">

            <button
              onClick={() => setDifficulty("easy")}
              className="bg-green-500 px-5 py-2 rounded hover:bg-green-700 transition duration-200"
            >
              Easy
            </button>

            <button
              onClick={() => setDifficulty("medium")}
              className="bg-yellow-500 px-5 py-2 rounded hover:bg-yellow-600 transition duration-200"
            >
              Medium
            </button>

            <button
              onClick={() => setDifficulty("hard")}
              className="bg-red-500 px-5 py-2 rounded hover:bg-red-600 transition duration-200"
            >
              Hard
            </button>

          </div>
        </div>

        <button
          onClick={() => setGameStarted(true)}
          className="px-8 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition duration-200"
        >
          Start Game
        </button>

        <p className="mt-6 text-gray-400 text-sm">
          Game Developed By Sanjay and Team
        </p>
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-2">Round {round}</h1>

      <div className="mb-2">
        Difficulty: <span className="uppercase">{difficulty}</span>
      </div>

      <div className="mb-4">
        You: {playerScore} | AI: {aiScore}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className="w-24 h-24 flex items-center justify-center bg-gray-800 text-3xl cursor-pointer hover:bg-gray-700 rounded-lg"
          >
            {cell}
          </div>
        ))}
      </div>

      {result && (
        <div className="mt-4 text-xl">
          {result === "Draw"
            ? "Draw 🤝"
            : result === "X"
              ? "You Win 🎉"
              : "AI Wins 🤖"}
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <button
          onClick={nextRound}
          className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          Next
        </button>

        <button
          onClick={resetGame}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Reset
        </button>

        <button
          onClick={() => setGameStarted(false)}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
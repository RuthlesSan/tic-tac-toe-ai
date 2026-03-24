"use client";
import { useState } from "react";

const emptyBoard = Array(9).fill(null);

function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];

  for (let [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.includes(null) ? null : "Draw";
}

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

export default function Home() {
  const [board, setBoard] = useState(emptyBoard);
  const [gameStarted, setGameStarted] = useState(false);
  const [result, setResult] = useState(null);

  const handleClick = (index) => {
    if (board[index] || result) return;

    let newBoard = [...board];
    newBoard[index] = "X";

    let winner = checkWinner(newBoard);
    if (winner) {
      setBoard(newBoard);
      setResult(winner);
      return;
    }

    let aiMove = bestMove(newBoard);
    newBoard[aiMove] = "O";

    winner = checkWinner(newBoard);

    setBoard(newBoard);
    if (winner) setResult(winner);
  };

  const resetGame = () => {
    setBoard(emptyBoard);
    setResult(null);
  };

  if (!gameStarted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl mb-6">Tic Tac Toe AI</h1>
        <button
          onClick={() => setGameStarted(true)}
          className="px-6 py-3 bg-blue-500 rounded-xl"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-4">Tic Tac Toe</h1>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className="w-20 h-20 flex items-center justify-center bg-gray-800 text-2xl cursor-pointer"
          >
            {cell}
          </div>
        ))}
      </div>

      {result && (
        <div className="mt-4 text-xl">
          {result === "Draw"
            ? "It's a Draw 🤝"
            : result === "X"
            ? "You Win 🎉"
            : "Computer Wins 🤖"}
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-green-500 rounded"
        >
          Restart
        </button>

        <button
          onClick={() => setGameStarted(false)}
          className="px-4 py-2 bg-red-500 rounded"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
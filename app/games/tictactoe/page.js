"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const emptyBoard = Array(9).fill(null);

function checkWinner(board) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  for (let [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  if (!board.includes(null)) return { winner: "Draw", line: [] };
  return null;
}

// 🔥 MINIMAX
function minimax(board, isMax) {
  const res = checkWinner(board);

  if (res?.winner === "O") return 1;
  if (res?.winner === "X") return -1;
  if (res?.winner === "Draw") return 0;

  if (isMax) {
    let best = -Infinity;
    board.forEach((cell, i) => {
      if (!cell) {
        board[i] = "O";
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    });
    return best;
  } else {
    let best = Infinity;
    board.forEach((cell, i) => {
      if (!cell) {
        board[i] = "X";
        best = Math.min(best, minimax(board, true));
        board[i] = null;
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

function randomMove(board) {
  const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function mediumMove(board) {
  return Math.random() < 0.5 ? randomMove(board) : bestMove(board);
}

export default function Home() {
  const router = useRouter();

  const [board, setBoard] = useState(emptyBoard);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(null);

  const [result, setResult] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [round, setRound] = useState(1);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [matchWinner, setMatchWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  // 🔊 Sounds
  const clickSound = typeof Audio !== "undefined" ? new Audio("/click.mp3") : null;
  const winSound = typeof Audio !== "undefined" ? new Audio("/win.mp3") : null;
  const loseSound = typeof Audio !== "undefined" ? new Audio("/lose.mp3") : null;

  const play = (s) => { if (!s) return; s.currentTime = 0; s.play(); };

  const getAIMove = (b) => {
    if (difficulty === "easy") return randomMove(b);
    if (difficulty === "medium") return mediumMove(b);
    return bestMove(b);
  };

  const handleClick = (i) => {
    if (board[i] || result || matchWinner) return;

    play(clickSound);

    let newBoard = [...board];
    newBoard[i] = "X";

    let res = checkWinner(newBoard);
    if (res) {
      setWinningLine(res.line);
      return endRound(res.winner, newBoard);
    }

    let ai = getAIMove(newBoard);
    newBoard[ai] = "O";

    res = checkWinner(newBoard);
    if (res) setWinningLine(res.line);

    endRound(res?.winner, newBoard);
  };

  const endRound = (winner, newBoard) => {
    setBoard(newBoard);

    if (winner === "X") {
      play(winSound);
      let s = playerScore + 1;
      setPlayerScore(s);

      if (s === 3) setMatchWinner("player");
      else {
        setPopupMessage("🎉 You Win!");
        setShowPopup(true);
      }
    }

    if (winner === "O") {
      play(loseSound);
      let s = aiScore + 1;
      setAiScore(s);

      if (s === 3) setMatchWinner("ai");
      else {
        setPopupMessage("🤖 AI Wins!");
        setShowPopup(true);
      }
    }

    if (winner === "Draw") {
      setPopupMessage("🤝 Draw!");
      setShowPopup(true);
    }

    if (winner) setResult(winner);
  };

  const nextRound = () => {
    setBoard(emptyBoard);
    setResult(null);
    setWinningLine([]);
    setRound(r => r + 1);
  };

  const resetGame = () => {
    setBoard(emptyBoard);
    setResult(null);
    setPlayerScore(0);
    setAiScore(0);
    setRound(1);
    setMatchWinner(null);
    setWinningLine([]);
  };

  // 🎮 START SCREEN
  if (!gameStarted) {
    return (
      return (
      <div className="bg-black min-h-screen text-white">


        {/* your existing content */}
      </div>
    );
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-5xl mb-6 font-bold">Tic Tac Toe</h1>

      <p className="mb-3">
        {difficulty ? `Difficulty: ${difficulty.toUpperCase()}` : "Select Difficulty:"}
      </p>

      <div className="flex gap-4 mb-6">
        {["easy", "medium", "hard"].map(level => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`px-5 py-2 rounded font-bold ${difficulty === level
                ? "bg-blue-600 scale-105"
                : level === "easy"
                  ? "bg-green-500"
                  : level === "medium"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={() => difficulty && setGameStarted(true)}
          className={`px-8 py-3 rounded-xl font-bold ${difficulty ? "bg-blue-500" : "bg-gray-500 cursor-not-allowed"
            }`}
        >
          Start Game
        </button>


      </div>
    </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-2">Round {round}</h1>
      <p>Difficulty: {difficulty.toUpperCase()}</p>
      <p>You: {playerScore} | AI: {aiScore}</p>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className={`w-24 h-24 flex items-center justify-center text-3xl rounded-lg cursor-pointer
              ${winningLine.includes(i) ? "bg-green-500" : "bg-gray-800 hover:bg-gray-700"}
            `}
          >
            {cell}
          </div>
        ))}
      </div>

      {!matchWinner && (
        <div className="mt-4 flex gap-4">
          <button onClick={resetGame} className="bg-green-500 px-4 py-2 rounded">
            Reset
          </button>
          <button
            onClick={() => { resetGame(); setGameStarted(false); }}
            className="bg-red-500 px-4 py-2 rounded"
          >
            Exit
          </button>
        </div>
      )}

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 p-6 rounded-xl text-center">
            <h2 className="text-xl mb-4">{popupMessage}</h2>
            <button
              onClick={() => {
                setShowPopup(false);
                if (!matchWinner) nextRound();
              }}
              className="bg-blue-500 px-5 py-2 rounded"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* MATCH RESULT */}
      {matchWinner && (
        <div className="mt-6 bg-gray-900 p-6 rounded-xl text-center">
          <h2 className="text-xl mb-4">
            {matchWinner === "player" ? "🎉 You Won the Match!" : "🤖 AI Won the Match!"}
          </h2>

          <div className="flex gap-4 justify-center">
            <button onClick={resetGame} className="bg-green-500 px-4 py-2 rounded">
              Restart
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
      )}
    </div>
  );
}
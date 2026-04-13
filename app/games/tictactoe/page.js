"use client";
import { useState, useEffect } from "react";
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
      return board[a];
    }
  }

  if (!board.includes(null)) return "Draw";
  return null;
}

// MINIMAX
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

function randomMove(board) {
  const empty = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v) => v !== null);

  return empty[Math.floor(Math.random() * empty.length)];
}

function mediumMove(board) {
  return Math.random() < 0.5 ? randomMove(board) : bestMove(board);
}

export default function Home() {
  const router = useRouter();

  const [board, setBoard] = useState(emptyBoard);
  const [gameStarted, setGameStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [round, setRound] = useState(1);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [matchWinner, setMatchWinner] = useState(null);

  const getAIMove = (board) => {
    if (difficulty === "easy") return randomMove(board);
    if (difficulty === "medium") return mediumMove(board);
    return bestMove(board);
  };

  const handleClick = (index) => {
    if (board[index] || result || matchWinner) return;

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

    if (winner === "X") {
      const newScore = playerScore + 1;
      setPlayerScore(newScore);

      if (newScore === 3) {
        setMatchWinner("player");
      } else {
        setPopupMessage("🎉 You Win!");
        setShowPopup(true);
      }
    }

    if (winner === "O") {
      const newScore = aiScore + 1;
      setAiScore(newScore);

      if (newScore === 3) {
        setMatchWinner("ai");
      } else {
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
    setRound((r) => r + 1);
  };

  const resetGame = () => {
    setBoard(emptyBoard);
    setResult(null);
    setPlayerScore(0);
    setAiScore(0);
    setRound(1);
    setMatchWinner(null);
  };

  // START SCREEN
  if (!gameStarted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-5xl mb-6 font-bold">Tic Tac Toe AI</h1>

        <div className="mb-4 text-center">
          <p className="mb-2 text-lg font-semibold">
            {difficulty
              ? `Difficulty: ${difficulty.toUpperCase()}`
              : "Select Difficulty:"}
          </p>

          <div className="flex gap-4 justify-center">
            {["easy", "medium", "hard"].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-5 py-2 rounded transition ${difficulty === level
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
        </div>

        <button
          onClick={() => setGameStarted(true)}
          className="px-8 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition"
        >
          Start Game
        </button>
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

      <div className="mt-4 flex gap-4">
        <button onClick={nextRound} className="bg-yellow-500 px-4 py-2 rounded">
          Next
        </button>

        <button onClick={resetGame} className="bg-green-500 px-4 py-2 rounded">
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

      {/* ROUND POPUP */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <h2 className="text-2xl mb-4">{popupMessage}</h2>

            <button
              onClick={() => {
                setShowPopup(false);
                nextRound();
              }}
              className="bg-blue-500 px-6 py-2 rounded"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* MATCH RESULT */}
      {matchWinner && (
        <div className="mt-8 bg-gray-900 p-6 rounded-xl text-center shadow-lg">
          <h2 className="text-2xl mb-4">
            {matchWinner === "player"
              ? "🎉 You Won the Match!"
              : "🤖 AI Won the Match!"}
          </h2>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetGame}
              className="bg-green-500 px-5 py-2 rounded"
            >
              Restart
            </button>

            <button
              onClick={() => {
                resetGame();
                setGameStarted(false);
              }}
              className="bg-blue-500 px-5 py-2 rounded"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
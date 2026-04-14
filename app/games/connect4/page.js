"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ROWS = 6;
const COLS = 7;

const createBoard = () =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

export default function ConnectFour() {
    const router = useRouter();

    const [board, setBoard] = useState(createBoard());
    const [gameStarted, setGameStarted] = useState(false);
    const [difficulty, setDifficulty] = useState(null);

    const [winner, setWinner] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    // 🔊 Sounds
    const clickSound = typeof Audio !== "undefined" ? new Audio("/click.mp3") : null;
    const winSound = typeof Audio !== "undefined" ? new Audio("/win.mp3") : null;
    const loseSound = typeof Audio !== "undefined" ? new Audio("/lose.mp3") : null;

    const playSound = (sound) => {
        if (!sound) return;
        sound.currentTime = 0;
        sound.play();
    };

    // 🧠 Winner Check
    const checkWinner = (b) => {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const p = b[r][c];
                if (!p) continue;

                if (c + 3 < COLS &&
                    p === b[r][c + 1] &&
                    p === b[r][c + 2] &&
                    p === b[r][c + 3]) return p;

                if (r + 3 < ROWS &&
                    p === b[r + 1][c] &&
                    p === b[r + 2][c] &&
                    p === b[r + 3][c]) return p;

                if (r + 3 < ROWS && c + 3 < COLS &&
                    p === b[r + 1][c + 1] &&
                    p === b[r + 2][c + 2] &&
                    p === b[r + 3][c + 3]) return p;

                if (r + 3 < ROWS && c - 3 >= 0 &&
                    p === b[r + 1][c - 1] &&
                    p === b[r + 2][c - 2] &&
                    p === b[r + 3][c - 3]) return p;
            }
        }
        return null;
    };

    // 🤖 AI LOGIC
    const getAIMove = (b) => {
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
            if (!b[0][c]) validCols.push(c);
        }

        // EASY → random
        if (difficulty === "easy") {
            return validCols[Math.floor(Math.random() * validCols.length)];
        }

        // MEDIUM → sometimes smart
        if (difficulty === "medium") {
            if (Math.random() < 0.5) {
                return validCols[Math.floor(Math.random() * validCols.length)];
            }
        }

        // HARD → prefer center
        return validCols[Math.floor(validCols.length / 2)];
    };

    const dropPiece = (col, player) => {
        const newBoard = board.map(r => [...r]);

        for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][col]) {
                newBoard[r][col] = player;
                break;
            }
        }

        return newBoard;
    };

    const handleClick = (col) => {
        if (winner || !gameStarted) return;

        playSound(clickSound);

        let newBoard = dropPiece(col, "X");
        setBoard(newBoard);

        let win = checkWinner(newBoard);
        if (win) {
            playSound(winSound);
            setPopupMessage("🎉 You Win!");
            setShowPopup(true);
            setWinner("player");
            return;
        }

        setTimeout(() => {
            const aiCol = getAIMove(newBoard);

            let updatedBoard = newBoard.map(r => [...r]);

            for (let r = ROWS - 1; r >= 0; r--) {
                if (!updatedBoard[r][aiCol]) {
                    updatedBoard[r][aiCol] = "O";
                    break;
                }
            }

            setBoard(updatedBoard);

            const aiWin = checkWinner(updatedBoard);
            if (aiWin) {
                playSound(loseSound);
                setPopupMessage("🤖 AI Wins!");
                setShowPopup(true);
                setWinner("ai");
            }
        }, 500);
    };

    const resetGame = () => {
        setBoard(createBoard());
        setWinner(null);
        setShowPopup(false);
    };

    // 🎮 START SCREEN
    if (!gameStarted) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
                <h1 className="text-5xl mb-6 font-bold">Connect Four</h1>

                <p className="mb-3 text-lg">
                    {difficulty
                        ? `Difficulty: ${difficulty.toUpperCase()}`
                        : "Select Difficulty:"}
                </p>

                <div className="flex gap-4 mb-6">
                    {["easy", "medium", "hard"].map(level => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-5 py-2 rounded font-bold tracking-wide transition ${difficulty === level
                                ? "bg-blue-600 scale-105"
                                : level === "easy"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : level === "medium"
                                        ? "bg-yellow-500 hover:bg-yellow-600"
                                        : "bg-red-500 hover:bg-red-600"
                                }`}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
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

            <h1 className="text-3xl mb-4">Connect Four</h1>

            {/* Board */}
            <div className="grid grid-cols-7 gap-2 bg-blue-900 p-3 rounded-xl">
                {board.map((row, r) =>
                    row.map((cell, c) => (
                        <div
                            key={`${r}-${c}`}
                            onClick={() => handleClick(c)}
                            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer"
                        >
                            {cell === "X" && <div className="w-8 h-8 bg-red-500 rounded-full" />}
                            {cell === "O" && <div className="w-8 h-8 bg-yellow-400 rounded-full" />}
                        </div>
                    ))
                )}
            </div>

            {/* RESULT UI */}
            {winner && (
                <div className="mt-6 bg-gray-900 p-6 rounded-xl text-center">
                    <h2 className="text-xl mb-4">
                        {winner === "player"
                            ? "🎉 You Won the Match!"
                            : "🤖 AI Won the Match!"}
                    </h2>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={resetGame}
                            className="bg-green-500 px-4 py-2 rounded"
                        >
                            Restart
                        </button>

                        <button
                            onClick={() => router.push("/")}
                            className="bg-blue-500 px-4 py-2 rounded"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 flex gap-4">
                <button
                    onClick={resetGame}
                    className="bg-yellow-500 px-5 py-2 rounded hover:bg-yellow-600 transition font-bold"
                >
                    Reset
                </button>

                <button
                    onClick={() => {
                        resetGame();
                        setGameStarted(false);
                    }}
                    className="bg-red-500 px-5 py-2 rounded hover:bg-red-600 transition font-bold"
                >
                    Exit
                </button>
            </div>
        </div>
    );
}
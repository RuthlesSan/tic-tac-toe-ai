"use client";
import { useState } from "react";

const START_STICKS = 21;

export default function Nim() {
    const [aiMoveMsg, setAiMoveMsg] = useState("");
    const [sticks, setSticks] = useState(START_STICKS);
    const [gameStarted, setGameStarted] = useState(false);
    const [difficulty, setDifficulty] = useState(null);

    const [playerTurn, setPlayerTurn] = useState(true);
    const [winner, setWinner] = useState(null);

    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    // 🔊 Sounds (same as your other games)
    const clickSound = typeof Audio !== "undefined" ? new Audio("/click.mp3") : null;
    const winSound = typeof Audio !== "undefined" ? new Audio("/win.mp3") : null;
    const loseSound = typeof Audio !== "undefined" ? new Audio("/lose.mp3") : null;

    const play = (s) => {
        if (!s) return;
        s.currentTime = 0;
        s.play();
    };

    // 🎯 AI MOVE
    const getAIMove = (remaining) => {

        // EASY → random
        if (difficulty === "easy") {
            return Math.floor(Math.random() * 3) + 1;
        }

        // MEDIUM → mix
        if (difficulty === "medium" && Math.random() < 0.5) {
            return Math.floor(Math.random() * 3) + 1;
        }

        // HARD → optimal (leave multiple of 4)
        let move = remaining % 4;
        if (move === 0) return 1; // fallback
        return move;
    };

    const handlePlayerMove = (take) => {
        setAiMoveMsg("");
        if (!playerTurn || winner) return;
        if (take > sticks) return;

        play(clickSound);

        let newSticks = sticks - take;
        setSticks(newSticks);

        // PLAYER WIN
        if (newSticks === 0) {
            play(winSound);
            setWinner("player");
            setPopupMessage("🎉 You Win!");
            setShowPopup(true);
            return;
        }

        setPlayerTurn(false);

        // AI TURN
        setTimeout(() => {
            let aiTake = getAIMove(newSticks);
            if (aiTake > newSticks) aiTake = 1;

            // 🔥 SHOW AI MOVE
            setAiMoveMsg(`🤖 AI took ${aiTake} stick${aiTake > 1 ? "s" : ""}`);

            let afterAI = newSticks - aiTake;
            setSticks(afterAI);

            if (afterAI === 0) {
                play(loseSound);
                setWinner("ai");
                setPopupMessage("🤖 AI Wins!");
                setShowPopup(true);
                return;
            }

            setPlayerTurn(true);
        }, 500);

    };

    const resetGame = () => {
        setShowPopup(false);
        setAiMoveMsg("");
        setSticks(START_STICKS);
        setWinner(null);
        setPlayerTurn(true);
    };

    // 🎮 START SCREEN
    if (!gameStarted) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
                <h1 className="text-5xl mb-6 font-bold">NIM Game</h1>

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
                            {level.toUpperCase()}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => difficulty && setGameStarted(true)}
                    className={`px-8 py-3 rounded-xl font-bold ${difficulty ? "bg-blue-500" : "bg-gray-500"
                        }`}
                >
                    Start Game
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white">

            <h1 className="text-3xl mb-2">NIM Game</h1>
            <p className="mb-2">Remaining Sticks: {sticks}</p>
            <p className="mb-2">
                Turn: {playerTurn ? "You" : "AI"}
            </p>

            {!playerTurn && !winner && (
                <p className="mb-4 text-yellow-400 font-semibold">
                    {aiMoveMsg}
                </p>
            )}

            {/* 🔥 PYRAMID STICKS */}
            <div className="mb-6">
                {Array.from({ length: 6 }, (_, row) => {
                    const totalBefore = (row * (row + 1)) / 2;
                    const rowCount = row + 1;

                    return (
                        <div key={row} className="flex justify-center">
                            {Array.from({ length: rowCount }, (_, col) => {
                                const index = totalBefore + col;

                                // show stick only if still remaining
                                if (index >= sticks) return null;

                                return (
                                    <div
                                        key={col}
                                        className="w-2 h-10 bg-yellow-400 m-1 rounded transition-all duration-300"
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* 🎮 CONTROLS */}
            {!winner && (
                <div className="flex gap-4">
                    {[1, 2, 3].map(n => (
                        <button
                            key={n}
                            onClick={() => handlePlayerMove(n)}
                            className={`px-5 py-2 rounded font-bold ${n > sticks ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500"
                                }`}
                            disabled={n > sticks}
                        >
                            Take {n}
                        </button>
                    ))}
                </div>
            )}

            {/* BUTTONS */}
            {!winner && (
                <div className="mt-6 flex gap-4">
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

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setShowPopup(false);
                                    resetGame();
                                }}
                                className="bg-blue-500 px-5 py-2 rounded"
                            >
                                Play Again
                            </button>

                            <button
                                onClick={() => {
                                    resetGame();
                                    setGameStarted(false);
                                }}
                                className="bg-red-500 px-5 py-2 rounded"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
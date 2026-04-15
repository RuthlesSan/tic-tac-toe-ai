"use client";
import { useState } from "react";

const START_STICKS = 21;

export default function Nim() {

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
            <p className="mb-4">
                Turn: {playerTurn ? "You" : "AI"}
            </p>

            {/* 🔥 STICKS VISUAL */}
            <div className="flex flex-wrap justify-center max-w-md mb-6">
                {Array(sticks).fill(0).map((_, i) => (
                    <div key={i} className="w-2 h-10 bg-yellow-400 m-1 rounded"></div>
                ))}
            </div>

            {/* 🎮 CONTROLS */}
            {!winner && (
                <div className="flex gap-4">
                    {[1, 2, 3].map(n => (
                        <button
                            key={n}
                            onClick={() => handlePlayerMove(n)}
                            className="bg-blue-500 px-5 py-2 rounded font-bold"
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
                        <button
                            onClick={() => {
                                setShowPopup(false);
                                resetGame();
                            }}
                            className="bg-blue-500 px-5 py-2 rounded"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
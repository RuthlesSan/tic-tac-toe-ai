"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SIZE = 10; // you can change to 15 later

const createBoard = () =>
    Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));

const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1],
];

export default function Gomoku() {
    const router = useRouter();

    const [board, setBoard] = useState(createBoard());
    const [gameStarted, setGameStarted] = useState(false);
    const [difficulty, setDifficulty] = useState(null);
    const [playerTurn, setPlayerTurn] = useState(true);
    const [winner, setWinner] = useState(null);

    const clickSound = typeof Audio !== "undefined" ? new Audio("/click.mp3") : null;
    const winSound = typeof Audio !== "undefined" ? new Audio("/win.mp3") : null;
    const loseSound = typeof Audio !== "undefined" ? new Audio("/lose.mp3") : null;

    const play = (s) => { if (!s) return; s.currentTime = 0; s.play(); };

    // 🎯 CHECK WIN (5 IN ROW)
    const checkWin = (b, r, c, player) => {
        for (let [dr, dc] of directions) {
            let count = 1;

            for (let i = 1; i < 5; i++) {
                let nr = r + dr * i, nc = c + dc * i;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && b[nr][nc] === player)
                    count++;
                else break;
            }

            for (let i = 1; i < 5; i++) {
                let nr = r - dr * i, nc = c - dc * i;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && b[nr][nc] === player)
                    count++;
                else break;
            }

            if (count >= 5) return true;
        }
        return false;
    };

    // 🎯 RANDOM MOVE
    const randomMove = (b) => {
        const empty = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (!b[r][c]) empty.push([r, c]);
            }
        }
        return empty[Math.floor(Math.random() * empty.length)];
    };

    // 🎯 SIMPLE SMART MOVE
    const smartMove = (b) => {
        // try win
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (!b[r][c]) {
                    b[r][c] = "W";
                    if (checkWin(b, r, c, "W")) {
                        b[r][c] = null;
                        return [r, c];
                    }
                    b[r][c] = null;
                }
            }
        }

        // block player
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (!b[r][c]) {
                    b[r][c] = "B";
                    if (checkWin(b, r, c, "B")) {
                        b[r][c] = null;
                        return [r, c];
                    }
                    b[r][c] = null;
                }
            }
        }

        return randomMove(b);
    };

    const aiMove = (b) => {
        let move;

        if (difficulty === "easy") {
            move = randomMove(b);
        } else if (difficulty === "medium") {
            move = Math.random() < 0.5 ? randomMove(b) : smartMove(b);
        } else {
            move = smartMove(b);
        }

        if (!move) return;

        const newB = b.map(row => [...row]);
        newB[move[0]][move[1]] = "W";

        if (checkWin(newB, move[0], move[1], "W")) {
            play(loseSound);
            setWinner("ai");
        }

        setBoard(newB);
        setPlayerTurn(true);
    };

    const handleClick = (r, c) => {
        if (!playerTurn || board[r][c] || winner) return;

        play(clickSound);

        const newB = board.map(row => [...row]);
        newB[r][c] = "B";

        if (checkWin(newB, r, c, "B")) {
            play(winSound);
            setWinner("player");
        }

        setBoard(newB);
        setPlayerTurn(false);

        setTimeout(() => aiMove(newB), 300);
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
                <h1 className="text-5xl mb-6 font-bold">Gomoku</h1>

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

                <button
                    onClick={() => difficulty && setGameStarted(true)}
                    className={`px-8 py-3 rounded-xl font-bold ${difficulty ? "bg-blue-500" : "bg-gray-500 cursor-not-allowed"
                        }`}
                >
                    Start Game
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white">

            <h1 className="text-3xl mb-2">Gomoku</h1>
            <p className="mb-4">Difficulty: {difficulty.toUpperCase()}</p>

            <div className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${SIZE}, 32px)` }}
            >
                {board.map((row, r) =>
                    row.map((cell, c) => (
                        <div
                            key={r + "-" + c}
                            onClick={() => handleClick(r, c)}
                            className="w-8 h-8 bg-gray-700 flex items-center justify-center cursor-pointer"
                        >
                            {cell === "B" && <div className="w-5 h-5 bg-black rounded-full" />}
                            {cell === "W" && <div className="w-5 h-5 bg-white rounded-full" />}
                        </div>
                    ))
                )}
            </div>

            {!winner && (
                <div className="mt-6 flex gap-4">
                    <button onClick={resetGame} className="bg-yellow-500 px-4 py-2 rounded">
                        Reset
                    </button>
                    <button onClick={() => { resetGame(); setGameStarted(false); }}
                        className="bg-red-500 px-4 py-2 rounded">
                        Exit
                    </button>
                </div>
            )}

            {winner && (
                <div className="mt-6 bg-gray-900 p-6 rounded-xl text-center">
                    <h2 className="text-xl mb-4">
                        {winner === "player"
                            ? "🎉 You Won the Match!"
                            : "🤖 AI Won the Match!"}
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
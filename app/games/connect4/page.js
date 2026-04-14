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
    const [winningCells, setWinningCells] = useState([]);

    // 🔊 Sounds
    const clickSound = typeof Audio !== "undefined" ? new Audio("/click.mp3") : null;
    const winSound = typeof Audio !== "undefined" ? new Audio("/win.mp3") : null;
    const loseSound = typeof Audio !== "undefined" ? new Audio("/lose.mp3") : null;

    const playSound = (s) => {
        if (!s) return;
        s.currentTime = 0;
        s.play();
    };

    // ✅ PURE winner (for AI)
    const getWinner = (b) => {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const p = b[r][c];
                if (!p) continue;

                const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];

                for (let [dr, dc] of dirs) {
                    let count = 1;

                    for (let i = 1; i < 4; i++) {
                        let nr = r + dr * i;
                        let nc = c + dc * i;

                        if (
                            nr >= 0 && nr < ROWS &&
                            nc >= 0 && nc < COLS &&
                            b[nr][nc] === p
                        ) count++;
                    }

                    if (count === 4) return p;
                }
            }
        }
        return null;
    };

    // 🎯 UI winner (with highlight)
    const checkWinner = (b) => {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const p = b[r][c];
                if (!p) continue;

                const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];

                for (let [dr, dc] of dirs) {
                    let cells = [[r, c]];

                    for (let i = 1; i < 4; i++) {
                        let nr = r + dr * i;
                        let nc = c + dc * i;

                        if (
                            nr >= 0 && nr < ROWS &&
                            nc >= 0 && nc < COLS &&
                            b[nr][nc] === p
                        ) cells.push([nr, nc]);
                    }

                    if (cells.length === 4) {
                        setWinningCells(cells);
                        return p;
                    }
                }
            }
        }
        return null;
    };

    const evaluateBoard = (b) => {
        let score = 0;

        const checkLine = (a, b, c, d) => {
            const arr = [a, b, c, d];
            const ai = arr.filter(x => x === "O").length;
            const pl = arr.filter(x => x === "X").length;

            if (ai === 4) score += 100;
            else if (ai === 3 && pl === 0) score += 10;
            else if (ai === 2 && pl === 0) score += 5;

            if (pl === 3 && ai === 0) score -= 15;
            if (pl === 4) score -= 100;
        };

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (c + 3 < COLS) checkLine(b[r][c], b[r][c + 1], b[r][c + 2], b[r][c + 3]);
                if (r + 3 < ROWS) checkLine(b[r][c], b[r + 1][c], b[r + 2][c], b[r + 3][c]);
                if (r + 3 < ROWS && c + 3 < COLS) checkLine(b[r][c], b[r + 1][c + 1], b[r + 2][c + 2], b[r + 3][c + 3]);
                if (r + 3 < ROWS && c - 3 >= 0) checkLine(b[r][c], b[r + 1][c - 1], b[r + 2][c - 2], b[r + 3][c - 3]);
            }
        }

        return score;
    };

    const minimax = (b, depth, alpha, beta, isMax) => {
        const win = getWinner(b); // ✅ FIXED
        if (win === "O") return 100;
        if (win === "X") return -100;
        if (depth === 0) return evaluateBoard(b);

        let validCols = [];
        for (let c = 0; c < COLS; c++) if (!b[0][c]) validCols.push(c);

        if (isMax) {
            let maxEval = -Infinity;

            for (let col of validCols) {
                let newB = b.map(r => [...r]);

                for (let r = ROWS - 1; r >= 0; r--) {
                    if (!newB[r][col]) {
                        newB[r][col] = "O";
                        break;
                    }
                }

                let evalScore = minimax(newB, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }

            return maxEval;
        } else {
            let minEval = Infinity;

            for (let col of validCols) {
                let newB = b.map(r => [...r]);

                for (let r = ROWS - 1; r >= 0; r--) {
                    if (!newB[r][col]) {
                        newB[r][col] = "X";
                        break;
                    }
                }

                let evalScore = minimax(newB, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }

            return minEval;
        }
    };

    const getAIMove = (b) => {
        let validCols = [];
        for (let c = 0; c < COLS; c++) if (!b[0][c]) validCols.push(c);

        if (difficulty === "easy")
            return validCols[Math.floor(Math.random() * validCols.length)];

        if (difficulty === "medium" && Math.random() < 0.5)
            return validCols[Math.floor(Math.random() * validCols.length)];

        let depth = difficulty === "hard" ? 6 : 3;

        let bestScore = -Infinity;
        let bestMove = validCols[0];

        for (let col of validCols) {
            let newB = b.map(r => [...r]);

            for (let r = ROWS - 1; r >= 0; r--) {
                if (!newB[r][col]) {
                    newB[r][col] = "O";
                    break;
                }
            }

            let score = minimax(newB, depth, -Infinity, Infinity, false);

            if (score > bestScore) {
                bestScore = score;
                bestMove = col;
            }
        }

        return bestMove;
    };

    const dropPiece = (col, player, b) => {
        let newB = b.map(r => [...r]);

        for (let r = ROWS - 1; r >= 0; r--) {
            if (!newB[r][col]) {
                newB[r][col] = player;
                break;
            }
        }
        return newB;
    };

    const handleClick = (col) => {
        if (winner) return;

        playSound(clickSound);

        let newBoard = dropPiece(col, "X", board);
        setBoard(newBoard);

        let win = checkWinner(newBoard);
        if (win) {
            playSound(winSound);
            setWinner("player");
            return;
        }

        setTimeout(() => {
            let aiCol = getAIMove(newBoard);
            let updated = dropPiece(aiCol, "O", newBoard);
            setBoard(updated);

            let aiWin = checkWinner(updated);
            if (aiWin) {
                playSound(loseSound);
                setWinner("ai");
            }
        }, 400);
    };

    const resetGame = () => {
        setBoard(createBoard());
        setWinner(null);
        setWinningCells([]);
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

            <h1 className="text-3xl mb-2">Connect Four</h1>

            <p className="mb-4 text-lg">
                Difficulty: <span className="uppercase font-semibold">{difficulty}</span>
            </p>

            <div className="grid grid-cols-7 gap-2 bg-blue-900 p-3 rounded-xl">
                {board.map((row, r) =>
                    row.map((cell, c) => {
                        const isWinCell = winningCells.some(([wr, wc]) => wr === r && wc === c);

                        return (
                            <div key={`${r}-${c}`}
                                onClick={() => handleClick(c)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer
                ${isWinCell ? "bg-green-400 scale-110" : "bg-gray-800"}`}>

                                {cell === "X" && <div className="w-8 h-8 bg-red-500 rounded-full" />}
                                {cell === "O" && <div className="w-8 h-8 bg-yellow-400 rounded-full" />}
                            </div>
                        );
                    })
                )}
            </div>

            {!winner && (
                <div className="mt-6 flex gap-4">
                    <button onClick={resetGame} className="bg-yellow-500 px-5 py-2 rounded font-bold">
                        Reset
                    </button>

                    <button onClick={() => { resetGame(); setGameStarted(false); }}
                        className="bg-red-500 px-5 py-2 rounded font-bold">
                        Exit
                    </button>
                </div>
            )}

            {winner && (
                <div className="mt-6 bg-gray-900 p-6 rounded-xl text-center">
                    <h2 className="text-xl mb-4">
                        {winner === "player" ? "🎉 You Won!" : "🤖 AI Wins!"}
                    </h2>

                    <div className="flex gap-4 justify-center">
                        <button onClick={resetGame} className="bg-green-500 px-4 py-2 rounded">
                            Restart
                        </button>

                        <button onClick={() => { resetGame(); setGameStarted(false); }}
                            className="bg-red-500 px-4 py-2 rounded">
                            Exit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";
import { useState } from "react";

const ROWS = 6;
const COLS = 7;

const createBoard = () =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

export default function ConnectFour() {
    const [board, setBoard] = useState(createBoard());
    const [playerTurn, setPlayerTurn] = useState(true);
    const [winner, setWinner] = useState(null);

    // 🔻 Drop piece
    const dropPiece = (col) => {
        if (winner || !playerTurn) return;

        const newBoard = board.map(row => [...row]);

        for (let row = ROWS - 1; row >= 0; row--) {
            if (!newBoard[row][col]) {
                newBoard[row][col] = "X";
                break;
            }
        }

        setBoard(newBoard);

        const win = checkWinner(newBoard);
        if (win) {
            setWinner(win);
            return;
        }

        setPlayerTurn(false);

        setTimeout(() => aiMove(newBoard), 500);
    };

    // 🤖 AI move (random for now)
    const aiMove = (currentBoard) => {
        const validCols = [];

        for (let c = 0; c < COLS; c++) {
            if (!currentBoard[0][c]) validCols.push(c);
        }

        const col = validCols[Math.floor(Math.random() * validCols.length)];

        const newBoard = currentBoard.map(row => [...row]);

        for (let row = ROWS - 1; row >= 0; row--) {
            if (!newBoard[row][col]) {
                newBoard[row][col] = "O";
                break;
            }
        }

        setBoard(newBoard);

        const win = checkWinner(newBoard);
        if (win) {
            setWinner(win);
            return;
        }

        setPlayerTurn(true);
    };

    // 🧠 Check winner
    const checkWinner = (b) => {
        // horizontal, vertical, diagonal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const player = b[r][c];
                if (!player) continue;

                // →
                if (c + 3 < COLS &&
                    player === b[r][c + 1] &&
                    player === b[r][c + 2] &&
                    player === b[r][c + 3]) return player;

                // ↓
                if (r + 3 < ROWS &&
                    player === b[r + 1][c] &&
                    player === b[r + 2][c] &&
                    player === b[r + 3][c]) return player;

                // ↘
                if (r + 3 < ROWS && c + 3 < COLS &&
                    player === b[r + 1][c + 1] &&
                    player === b[r + 2][c + 2] &&
                    player === b[r + 3][c + 3]) return player;

                // ↙
                if (r + 3 < ROWS && c - 3 >= 0 &&
                    player === b[r + 1][c - 1] &&
                    player === b[r + 2][c - 2] &&
                    player === b[r + 3][c - 3]) return player;
            }
        }

        return null;
    };

    const resetGame = () => {
        setBoard(createBoard());
        setWinner(null);
        setPlayerTurn(true);
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white">

            <h1 className="text-4xl mb-4 font-bold">Connect Four</h1>

            {winner && (
                <h2 className="mb-4 text-xl">
                    {winner === "X" ? "🎉 You Win!" : "🤖 AI Wins!"}
                </h2>
            )}

            {/* 🎮 Board */}
            <div className="grid grid-cols-7 gap-2 bg-blue-900 p-3 rounded-xl">
                {board.map((row, r) =>
                    row.map((cell, c) => (
                        <div
                            key={`${r}-${c}`}
                            onClick={() => dropPiece(c)}
                            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer"
                        >
                            {cell === "X" && <div className="w-8 h-8 bg-red-500 rounded-full" />}
                            {cell === "O" && <div className="w-8 h-8 bg-yellow-400 rounded-full" />}
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={resetGame}
                className="mt-6 bg-green-500 px-5 py-2 rounded hover:bg-green-600"
            >
                Reset
            </button>
        </div>
    );
}
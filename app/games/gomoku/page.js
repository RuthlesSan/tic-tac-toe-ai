"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SIZE = 10;

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

    const [winningLine, setWinningLine] = useState([]);
    const [hoverCell, setHoverCell] = useState(null);

    const clickSound = typeof Audio !== "undefined" ? new Audio("/click.mp3") : null;
    const winSound = typeof Audio !== "undefined" ? new Audio("/win.mp3") : null;
    const loseSound = typeof Audio !== "undefined" ? new Audio("/lose.mp3") : null;

    const play = (s) => { if (!s) return; s.currentTime = 0; s.play(); };

    // 🔥 CHECK WIN
    const checkWin = (b, r, c, player) => {
        for (let [dr, dc] of directions) {
            let line = [[r, c]];

            for (let i = 1; i < 5; i++) {
                let nr = r + dr * i, nc = c + dc * i;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && b[nr][nc] === player)
                    line.push([nr, nc]);
                else break;
            }

            for (let i = 1; i < 5; i++) {
                let nr = r - dr * i, nc = c - dc * i;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && b[nr][nc] === player)
                    line.unshift([nr, nc]);
                else break;
            }

            if (line.length >= 5) {
                setWinningLine(line.slice(0, 5));
                return true;
            }
        }
        return false;
    };

    // 🔥 HEURISTIC EVALUATION
    const evaluate = (b) => {
        let score = 0;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (!b[r][c]) continue;

                const player = b[r][c];

                for (let [dr, dc] of directions) {
                    let count = 1;

                    for (let i = 1; i < 5; i++) {
                        let nr = r + dr * i, nc = c + dc * i;
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && b[nr][nc] === player)
                            count++;
                        else break;
                    }

                    if (player === "W") score += count * count;
                    else score -= count * count;
                }
            }
        }

        return score;
    };

    // 🔥 GET NEAR MOVES (optimization)
    const getMoves = (b) => {
        const moves = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (!b[r][c]) {
                    // only near existing stones
                    for (let [dr, dc] of directions) {
                        let nr = r + dr, nc = c + dc;
                        if (
                            nr >= 0 && nr < SIZE &&
                            nc >= 0 && nc < SIZE &&
                            b[nr][nc]
                        ) {
                            moves.push([r, c]);
                            break;
                        }
                    }
                }
            }
        }
        return moves.length ? moves : [[Math.floor(SIZE / 2), Math.floor(SIZE / 2)]];
    };

    // 🔥 MINIMAX
    const minimax = (b, depth, alpha, beta, isMax) => {
        if (depth === 0) return evaluate(b);

        const moves = getMoves(b);

        if (isMax) {
            let maxEval = -Infinity;

            for (let [r, c] of moves) {
                const newB = b.map(row => [...row]);
                newB[r][c] = "W";

                let evalScore = minimax(newB, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);

                if (beta <= alpha) break;
            }

            return maxEval;
        } else {
            let minEval = Infinity;

            for (let [r, c] of moves) {
                const newB = b.map(row => [...row]);
                newB[r][c] = "B";

                let evalScore = minimax(newB, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);

                if (beta <= alpha) break;
            }

            return minEval;
        }
    };

    // 🔥 AI MOVE
    const aiMove = (b) => {
        let move;

        const moves = getMoves(b);

        if (difficulty === "easy") {
            move = moves[Math.floor(Math.random() * moves.length)];
        }
        else if (difficulty === "medium") {
            move = Math.random() < 0.5
                ? moves[Math.floor(Math.random() * moves.length)]
                : bestMove(b, 2);
        }
        else {
            move = bestMove(b, 3);
        }

        const newB = b.map(row => [...row]);
        newB[move[0]][move[1]] = "W";

        if (checkWin(newB, move[0], move[1], "W")) {
            play(loseSound);
            setWinner("ai");
        }

        setBoard(newB);
        setPlayerTurn(true);
    };

    const bestMove = (b, depth) => {
        let bestScore = -Infinity;
        let move = null;

        const moves = getMoves(b);

        for (let [r, c] of moves) {
            const newB = b.map(row => [...row]);
            newB[r][c] = "W";

            let score = minimax(newB, depth, -Infinity, Infinity, false);

            if (score > bestScore) {
                bestScore = score;
                move = [r, c];
            }
        }

        return move;
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
        setWinningLine([]);
    };

    if (!gameStarted) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
                <h1 className="text-5xl mb-6 font-bold">Gomoku</h1>

                <p className="mb-3">
                    {difficulty ? `Difficulty: ${difficulty.toUpperCase()}` : "Select Difficulty:"}
                </p>

                <div className="flex gap-4 mb-6">
                    {["easy", "medium", "hard"].map(level => (
                        <button key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-5 py-2 rounded font-bold ${difficulty === level
                                    ? "bg-blue-600 scale-105"
                                    : level === "easy"
                                        ? "bg-green-500"
                                        : level === "medium"
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                }`}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => difficulty && setGameStarted(true)}
                    className={`px-8 py-3 rounded-xl font-bold ${difficulty ? "bg-blue-500" : "bg-gray-500"
                        }`}>
                    Start Game
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white">

            <h1 className="text-3xl mb-2">Gomoku</h1>
            <p className="mb-4">Difficulty: {difficulty.toUpperCase()}</p>

            <div
                className="grid gap-[2px] p-3 rounded-xl"
                style={{
                    gridTemplateColumns: `repeat(${SIZE}, 32px)`,
                    background: "#5C3A1E"
                }}
            >
                {board.map((row, r) =>
                    row.map((cell, c) => {
                        const isWinning = winningLine.some(([wr, wc]) => wr === r && wc === c);

                        return (
                            <div
                                key={r + "-" + c}
                                onClick={() => handleClick(r, c)}
                                onMouseEnter={() => setHoverCell([r, c])}
                                onMouseLeave={() => setHoverCell(null)}
                                className="w-8 h-8 bg-[#8B5A2B] flex items-center justify-center cursor-pointer relative"
                            >
                                {!cell && hoverCell?.[0] === r && hoverCell?.[1] === c && playerTurn && (
                                    <div className="w-5 h-5 bg-black/40 rounded-full" />
                                )}

                                {cell === "B" && (
                                    <div className={`w-5 h-5 bg-black rounded-full ${isWinning ? "shadow-[0_0_10px_gold]" : ""}`} />
                                )}

                                {cell === "W" && (
                                    <div className={`w-5 h-5 bg-white rounded-full ${isWinning ? "shadow-[0_0_10px_gold]" : ""}`} />
                                )}
                            </div>
                        );
                    })
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
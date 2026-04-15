
import { useState } from "react";
import { useRouter } from "next/navigation";

const SIZE = 8;

const createBoard = () => {
    const b = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
    b[3][3] = "W";
    b[3][4] = "B";
    b[4][3] = "B";
    b[4][4] = "W";
    return b;
};

const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
];

export default function Othello() {
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

    const isValidMove = (b, r, c, p) => {
        if (b[r][c]) return false;
        const opp = p === "B" ? "W" : "B";

        for (let [dr, dc] of directions) {
            let i = r + dr, j = c + dc, found = false;
            while (i >= 0 && i < SIZE && j >= 0 && j < SIZE) {
                if (b[i][j] === opp) found = true;
                else if (b[i][j] === p) return found;
                else break;
                i += dr; j += dc;
            }
        }
        return false;
    };

    const makeMove = (b, r, c, p) => {
        const newB = b.map(row => [...row]);
        const opp = p === "B" ? "W" : "B";

        newB[r][c] = p;

        for (let [dr, dc] of directions) {
            let i = r + dr, j = c + dc, flip = [];
            while (i >= 0 && i < SIZE && j >= 0 && j < SIZE) {
                if (newB[i][j] === opp) flip.push([i, j]);
                else if (newB[i][j] === p) {
                    flip.forEach(([x, y]) => newB[x][y] = p);
                    break;
                } else break;
                i += dr; j += dc;
            }
        }
        return newB;
    };

    const evaluateBoard = (b) => {
        const flat = b.flat();
        return flat.filter(x => x === "W").length - flat.filter(x => x === "B").length;
    };

    const minimax = (b, depth, alpha, beta, isMax) => {
        if (depth === 0) return evaluateBoard(b);

        let moves = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (isValidMove(b, r, c, isMax ? "W" : "B")) moves.push([r, c]);
            }
        }

        if (!moves.length) return evaluateBoard(b);

        if (isMax) {
            let maxEval = -Infinity;
            for (let m of moves) {
                let newB = makeMove(b, m[0], m[1], "W");
                let evalScore = minimax(newB, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let m of moves) {
                let newB = makeMove(b, m[0], m[1], "B");
                let evalScore = minimax(newB, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    };

    const aiMove = (b) => {
        let moves = [];

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (isValidMove(b, r, c, "W")) moves.push([r, c]);
            }
        }

        // ❌ No AI moves
        if (!moves.length) {
            const playerMoves = getValidMoves(b, "B");

            // 🔥 BOTH stuck → end
            if (playerMoves.length === 0) {
                checkGameEnd(b);
                return;
            }

            // 🔥 AI skips → give turn to player
            setPlayerTurn(true);

            // 🔥 FORCE UI UPDATE (important)
            setBoard([...b]);

            return;
        }

        let move;

        if (difficulty === "easy") {
            move = moves[Math.floor(Math.random() * moves.length)];
        }
        else if (difficulty === "medium" && Math.random() < 0.5) {
            move = moves[Math.floor(Math.random() * moves.length)];
        }
        else {
            let bestScore = -Infinity;
            move = moves[0];

            for (let m of moves) {
                let newB = makeMove(b, m[0], m[1], "W");
                let score = minimax(newB, 3, -Infinity, Infinity, false);

                if (score > bestScore) {
                    bestScore = score;
                    move = m;
                }
            }
        }

        const newBoard = makeMove(b, move[0], move[1], "W");
        setBoard(newBoard);

        const playerMoves = getValidMoves(newBoard, "B");
        const aiMoves = getValidMoves(newBoard, "W");

        // 🔥 BOTH stuck → end
        if (playerMoves.length === 0 && aiMoves.length === 0) {
            checkGameEnd(newBoard);
            return;
        }

        // 🔥 PLAYER cannot move → AI plays again
        if (playerMoves.length === 0) {
            setTimeout(() => aiMove(newBoard), 500);
            return;
        }

        // ✅ Normal turn
        setPlayerTurn(true);
    };

    const checkGameEnd = (b) => {
        const playerMoves = getValidMoves(b, "B");
        const aiMoves = getValidMoves(b, "W");

        const flat = b.flat();
        const isBoardFull = !flat.includes(null);

        // 🔥 END CONDITIONS
        if (isBoardFull || (playerMoves.length === 0 && aiMoves.length === 0)) {
            const B = flat.filter(x => x === "B").length;
            const W = flat.filter(x => x === "W").length;

            if (B > W) {
                play(winSound);
                setWinner("player");
            } else if (W > B) {
                play(loseSound);
                setWinner("ai");
            } else {
                setWinner("draw");
            }
        }
    };
    function getValidMoves(board, player) {
        const opponent = player === "B" ? "W" : "B";
        const moves = [];

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c]) continue;

                let valid = false;

                for (let [dr, dc] of directions) {
                    let i = r + dr;
                    let j = c + dc;
                    let hasOpponentBetween = false;

                    while (i >= 0 && i < SIZE && j >= 0 && j < SIZE) {
                        if (board[i][j] === opponent) {
                            hasOpponentBetween = true;
                        }
                        else if (board[i][j] === player) {
                            if (hasOpponentBetween) {
                                valid = true;
                            }
                            break;
                        }
                        else break;

                        i += dr;
                        j += dc;
                    }

                    if (valid) break;
                }

                if (valid) moves.push([r, c]);
            }
        }

        return moves;
    }
    const handleClick = (r, c) => {
        if (!playerTurn || winner) return;

        const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
        if (!isValid) return;

        play(clickSound);

        const newB = makeMove(board, r, c, "B");
        setBoard(newB);

        const aiMoves = getValidMoves(newB, "W");
        const playerMoves = getValidMoves(newB, "B");

        // 🔥 CASE 1: Both cannot move → END GAME
        if (aiMoves.length === 0 && playerMoves.length === 0) {
            checkGameEnd(newB);
            return;
        }

        // CASE 2: AI cannot move → skip
        if (aiMoves.length === 0) {
            setPlayerTurn(true);
            return;
        }

        // CASE 3: AI plays
        setPlayerTurn(false);
        setTimeout(() => aiMove(newB), 500);
    };

    const resetGame = () => {
        setBoard(createBoard());
        setWinner(null);
        setPlayerTurn(true);
    };

    // 🎮 START SCREEN
    const validMoves = getValidMoves(board, "B");

    const flat = board.flat();
    const blackCount = flat.filter(x => x === "B").length;
    const whiteCount = flat.filter(x => x === "W").length;
    if (!gameStarted) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
                <h1 className="text-5xl mb-6 font-bold">Othello</h1>

                <p className="mb-3">
                    {difficulty
                        ? `Difficulty: ${difficulty.toUpperCase()}`
                        : "Select Difficulty:"}
                </p>

                <div className="flex gap-4 mb-6">
                    {["easy", "medium", "hard"].map(level => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)} // ✅ FIXED
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
                    onClick={() => difficulty && setGameStarted(true)} // ✅ FIXED
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

            <h1 className="text-3xl mb-2">Othello</h1>
            <p className="mb-4">
                Difficulty: <span className="uppercase font-semibold">{difficulty}</span>
            </p>
            <p className="mb-2">
                ⚫ {blackCount} | ⚪ {whiteCount}
            </p>

            <div className="grid grid-cols-8 gap-1 bg-green-800 p-2 rounded-xl">
                {board.map((row, r) =>
                    row.map((cell, c) => {
                        const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);

                        return (
                            <div key={r + "-" + c}
                                onClick={() => handleClick(r, c)}
                                className="w-10 h-10 bg-green-700 flex items-center justify-center cursor-pointer relative"
                            >
                                {/* Coins */}
                                {cell === "B" && <div className="w-6 h-6 bg-black rounded-full" />}
                                {cell === "W" && <div className="w-6 h-6 bg-white rounded-full" />}

                                {/* 🔥 VALID MOVE DOT */}
                                {!cell && isValid && playerTurn && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full opacity-80"></div>
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
                    <h2 className="text-xl mb-2">
                        {winner === "draw"
                            ? "🤝 Draw!"
                            : winner === "player"
                                ? "🎉 You Won the Match!"
                                : "🤖 AI Won the Match!"}
                    </h2>

                    <p className="mb-4">
                        ⚫ {blackCount} vs ⚪ {whiteCount}
                    </p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={resetGame}
                            className="bg-green-500 px-4 py-2 rounded"
                        >
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
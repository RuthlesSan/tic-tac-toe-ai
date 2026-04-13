"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const games = [
    { name: "Tic Tac Toe", path: "/games/tictactoe" },
    { name: "Connect Four", path: "/games/connect4" },
    { name: "Othello", path: "/games/othello" },
    { name: "Gomoku", path: "/games/gomoku" },
    { name: "Nim", path: "/games/nim" },
  ];

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-5xl mb-10 font-bold">
        Minimax AI Games Hub
      </h1>

      <div className="grid grid-cols-2 gap-6">
        {games.map((game, i) => (
          <button
            key={i}
            onClick={() => router.push(game.path)}
            className="bg-gray-800 px-8 py-6 rounded-xl hover:bg-gray-700 transition text-xl"
          >
            {game.name}
          </button>
        ))}
      </div>
    </div>
  );
}
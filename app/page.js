"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const games = [
    { name: "Tic Tac Toe", path: "/games/tictactoe", img: "/tictactoe.png" },
    { name: "Connect Four", path: "/games/connect4", img: "/connect4.png" },
    { name: "Othello", path: "/games/othello", img: "/othello.png" },
    { name: "Gomoku", path: "/games/gomoku", img: "/gomoku.png" },
    { name: "Nim", path: "/games/nim", img: "/nim.png" },
  ];

  // 🎮 Reusable Card
  const GameCard = ({ game }) => (
    <div
      onClick={() => router.push(game.path)}
      className="cursor-pointer bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:scale-105 hover:shadow-blue-500/30 transition duration-300"
    >
      <img
        src={game.img}
        alt={game.name}
        className="w-full h-40 object-cover"
      />
      <div className="py-2 text-center font-bold text-white tracking-wide">
        {game.name}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">


      {/* 🎯 CONTENT */}
      <div className="flex flex-col items-center justify-center flex-1 px-6">

        {/* 🌈 Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Minimax AI Games Arena
        </h1>

        {/* 🎮 TOP ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {games.slice(0, 3).map((game, i) => (
            <GameCard key={i} game={game} />
          ))}
        </div>

        {/* 🎮 BOTTOM ROW */}
        <div className="flex justify-center gap-8">
          {games.slice(3, 5).map((game, i) => (
            <GameCard key={i} game={game} />
          ))}
        </div>

        {/* Footer */}
        <p className="mt-12 text-gray-400 text-sm">
          Built by Sanjay & Team
        </p>

      </div>
    </div>
  );
  }
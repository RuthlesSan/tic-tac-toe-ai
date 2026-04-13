"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const games = [
    {
      name: "Tic Tac Toe",
      path: "/games/tictactoe",
      img: "/tictactoe.png",
    },
    {
      name: "Connect Four",
      path: "/games/connect4",
      img: "/connect4.png",
    },
    {
      name: "Othello",
      path: "/games/othello",
      img: "/othello.png",
    },
    {
      name: "Gomoku",
      path: "/games/gomoku",
      img: "/gomoku.png",
    },
    {
      name: "Nim",
      path: "/games/nim",
      img: "/nim.png",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

      {/* 🔥 Title */}
      <h1 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-pulse">
        Minimax AI Games Arena
      </h1>

      {/* 🎮 Grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 transition-all duration-700 ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {games.map((game, i) => (
          <div
            key={i}
            onClick={() => router.push(game.path)}
            className="cursor-pointer bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl transition duration-300"
          >
            {/* Image */}
            <img
              src={game.img}
              alt={game.name}
              className="w-full h-40 object-cover"
            />

            {/* Name */}
            <div className="p-4 text-center text-lg font-semibold">
              {game.name}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-10 text-gray-400 text-sm">
        Built by Sanjay 🚀
      </p>
    </div>
  );
}
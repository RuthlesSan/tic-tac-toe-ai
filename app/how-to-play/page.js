import Navbar from "@/components/Navbar";

export default function HowToPlay() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="p-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">How to Play 🎮</h1>

        <ul className="space-y-4">
          <li>❌ Tic Tac Toe: Get 3 in a row before AI</li>
          <li>🔴 Connect 4: Drop discs and connect 4</li>
          <li>⚫ Othello: Capture more discs than AI</li>
          <li>⚪ Gomoku: Get 5 in a row</li>
          <li>🔥 Nim: Take 1–3 sticks, last move wins</li>
        </ul>
      </div>
    </div>
  );
}
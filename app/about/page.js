export default function About() {
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="p-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About</h1>

        <p>
          AI Game Hub is a collection of classic strategy games enhanced
          with intelligent AI opponents. The games use algorithms like
          <span className="font-semibold"> Minimax </span> and
          <span className="font-semibold"> heuristic search </span>
          to make smart decisions and provide a challenging experience.
        </p>

        <p className="mt-4">
          It includes games such as Tic Tac Toe, Connect 4, Othello,
          Gomoku, and Nim, helping users understand game strategy and AI concepts
          in an interactive way.
        </p>

        <p className="mt-4">
          Built using <span className="font-semibold">Next.js</span>,{" "}
          <span className="font-semibold">React</span>, and{" "}
          <span className="font-semibold">Tailwind CSS</span>, the app is
          fast, responsive, and easy to use.
        </p>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Team Members</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>V Sanjay Raj (RA2411003011200)</li>
            <li>Sivaguru Adaikkalam S (RA2411003011178)</li>
            <li>Hemanthu M K (RA2411003011215)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
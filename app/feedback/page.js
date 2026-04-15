import Navbar from "@/components/Navbar";

export default function Feedback() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center">
      <Navbar />

      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Feedback 📝</h1>

        <p className="mb-6">We'd love your feedback!</p>

        <a
          href="https://forms.gle/YOUR_GOOGLE_FORM_LINK"
          target="_blank"
          className="bg-blue-500 px-6 py-3 rounded-xl font-bold"
        >
          Give Feedback
        </a>
      </div>
    </div>
  );
}
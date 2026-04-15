import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        
        {/* ✅ GLOBAL NAVBAR */}
        <Navbar />

        {/* Pages */}
        <div className="pt-4">
          {children}
        </div>

      </body>
    </html>
  );
}
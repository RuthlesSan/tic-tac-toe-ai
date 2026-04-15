"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  const navItem = (href, label) => (
    <Link href={href}>
      <span
        className={`px-4 py-2 rounded-lg font-semibold cursor-pointer transition ${
          path === href
            ? "bg-blue-600"
            : "hover:bg-gray-700"
        }`}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <div className="w-full bg-black text-white flex justify-between items-center px-6 py-4 border-b border-gray-800">
      
      {/* Logo */}
      <h1 className="text-xl font-bold text-blue-400">
        AI Game Hub
      </h1>

      {/* Nav Links */}
      <div className="flex gap-4">
        {navItem("/", "Home")}
        {navItem("/how-to-play", "How to Play")}
        {navItem("/about", "About")}
        {navItem("/feedback", "Feedback")}
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-6">Oops! The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="px-6 py-3 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Go to Home
      </Link>
    </div>
  );
}

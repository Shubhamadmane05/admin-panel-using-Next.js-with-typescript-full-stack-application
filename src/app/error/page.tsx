"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

const ErrorPage = () => {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "An unexpected error occurred.";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-lg text-gray-800 mb-4">{message}</p>
        <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;

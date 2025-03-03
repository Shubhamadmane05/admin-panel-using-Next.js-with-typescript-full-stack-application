"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Get token from URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("/auth/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated! Redirecting...");
        setTimeout(() => router.push("/"), 2000);
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 border border-gray-300">
        <h2 className="text-2xl font-bold text-black mb-4 text-center">Reset Password</h2>
        {message && <p className="text-center text-red-600 mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-800 transition duration-200"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

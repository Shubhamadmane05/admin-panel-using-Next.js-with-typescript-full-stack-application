"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Both fields are required!");
      toast.error("Both fields are required!");
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setMessage(result.error);
      toast.error(result.error);
    } else {
      const session = await fetch("/api/auth/session").then((res) => res.json());

      if (!session || !session.user) {
        setMessage("Login failed, please try again.");
        toast.error("Login failed, please try again.");
        return;
      }

      const { role, status } = session.user;

      if (role === "user" && status !== "Active") {
        setMessage("Your account is inactive. Please contact admin.");
        toast.error("Your account is inactive. Please contact admin.");
        return;
      }

      toast.success("Login successful!");
      setTimeout(() => {
        router.push(role === "admin" ? "/dashboard/home" : "/dashboard/home");
      }, 0);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-serif text-center mb-4 text-black">Login</h2>
        {message && <p className="text-center text-red-500 mb-4">{message}</p>}

        {forgotPassword ? (
          <ChangePasswordForm setForgotPassword={setForgotPassword} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-black">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">Email</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">Password</label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="w-full bg-blue-200 text-black py-2 rounded-md hover:bg-blue-400 transition duration-200">
              Login
            </button>
          </form>
        )}
          <p className="text-center text-sm text-gray-600 mt-4">
          New User?{" "}
          <a href="/selectRole" className="text-blue-500 hover:underline">
            Register here
          </a>
        </p>
        {!forgotPassword && (
          <p className="text-center text-blue-600 mt-4 cursor-pointer" onClick={() => { setForgotPassword(true); setMessage(""); }}>
            Forgot Password?
          </p>
        )}
      </div>
    </div>
  );
};

const ChangePasswordForm = ({ setForgotPassword }: { setForgotPassword: (val: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Email is required!");
      toast.error("Email is required!");
      return;
    }

    try {
      const res = await fetch("/auth/api/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
      

      if (res.ok) {
        setIsSuccess(true);
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white  rounded-lg">
      <h2 className="text-xl font-serif text-black text-center mb-4">Reset Password</h2>
      {message && <p className={`text-center mb-4 ${isSuccess ? "text-green-500" : "text-red-500"}`}>{message}</p>}
      <form onSubmit={handlePasswordReset} className="space-y-4 text-black">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-black">Email</label>
          <input
            type="email"
            id="reset-email"
            className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-200 text-black py-2 rounded-md hover:bg-blue-400 transition duration-200">
          Send Reset Link
        </button>
      </form>
      <p className="text-center text-gray-600 mt-4 cursor-pointer" onClick={() => { setForgotPassword(false); setMessage(""); }}>
        Back to Login
      </p>
    </div>
  );
};

export default LoginForm;

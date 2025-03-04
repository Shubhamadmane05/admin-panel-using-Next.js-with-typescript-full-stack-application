"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

const UserRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [status, setStatus] = useState("Inactive");
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name || !email || !password || !confirmPassword || !profilePicture || !department) {
      setMessage("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    if (!validatePassword(password)) {
      setMessage("Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("department", department);
    formData.append("password", password);
    formData.append("profilePicture", profilePicture);
    formData.append("status", status);

    try {
      const response = await fetch("/users/api", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("User created successfully!");
        setTimeout(() => router.push("/"), 2000);

        setName("");
        setEmail("");
        setDepartment("");
        setPassword("");
        setConfirmPassword("");
        setProfilePicture(null);
        setPreview(null);
        setStatus("Inactive");

        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage(data.error || "Error creating user");
      }
    } catch (error) {
      setMessage("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-black"
          onClick={() => router.push("/")}
        >
          <AiOutlineClose size={24} />
        </button>
        <h2 className="text-2xl font-serif mb-4 text-black">Create User</h2>
        {message && <p className="text-center text-red-500 mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-2 border rounded text-black bg-white"
            required
          >
            <option value="" disabled hidden>Select Department</option>
            <option value="ALL">ALL</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
          </select>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
          <div className="flex flex-col items-center">
            <label className="cursor-pointer">
              {preview ? (
                <img src={preview} alt="Profile Preview" className="w-24 h-24 rounded-full shadow-lg" />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center border border-gray-300 rounded-full bg-gray-100 hover:bg-blue-200">
                  <span className="text-black text-center">Upload photo</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" required />
            </label>
          </div>
          <button type="submit" className="w-full bg-blue-200 text-black py-2 rounded hover:bg-blue-400">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserRegister;

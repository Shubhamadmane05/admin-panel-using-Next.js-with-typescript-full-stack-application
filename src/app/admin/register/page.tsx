"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [department, setDepartment] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
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

    // Clear previous messages
    setMessage("");

    if (!fullName || !email || !password || !confirmPassword || !photo || !department) {
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
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("photo", photo);
    formData.append("department", department);

    try {
      const response = await fetch("/admin/api", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Admin created successfully!");
        toast.success("profile Created successfully!");
        setTimeout(() => router.push("/"), 2000);

        // Clear all fields and reset the form
        setFullName("");
        setEmail("");
        setDepartment("");
        setPassword("");
        setConfirmPassword("");

        setPhoto(null);
        setPreview(null);
        setTimeout(() => {
          setMessage("");
        }, 0);
      } else {
        setMessage(data.error || "Error creating admin");
      }
    } catch (error) {
      setMessage("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <button
          className="absolute top-2 right-2 text-black"
          onClick={() => router.push("/")}
        >
          <AiOutlineClose size={24} />
        </button>
        <h2 className="text-2xl font-serif mb-4 text-gray-800">Create Admin</h2>

        {message && <p className="text-center text-red-500 mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              id="fullName"
              className="peer block w-full px-2.5 pt-5 pb-2.5 text-gray-900 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              placeholder=" "
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <label
              htmlFor="fullName"
              className="absolute text-sm text-gray-500 left-2 top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-blue-600 transition-all"
            >
              Full Name
            </label>
          </div>

          <div className="relative">
            <input
              type="email"
              id="email"
              className="peer block w-full px-2.5 pt-5 pb-2.5 text-gray-900 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label
              htmlFor="email"
              className="absolute text-sm text-gray-500 left-2 top-1.5 peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-blue-600 transition-all"
            >
              Email
            </label>
          </div>
          <div className="relative">
            <select
              id="department"
              className="peer block w-full px-2.5 pt-5 pb-2.5 text-gray-900 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent appearance-none"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="" disabled hidden></option>
              <option value="ALL">ALL</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
            </select>
            <label
              htmlFor="department"
              className="absolute text-sm text-gray-500 left-2 top-1.5 peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-blue-600 transition-all"
            >
              Department
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              className="peer block w-full px-2.5 pt-5 pb-2.5 text-gray-900 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label
              htmlFor="password"
              className="absolute text-sm text-gray-500 left-2 top-1.5 peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-blue-600 transition-all"
            >
              Password
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              className="peer block w-full px-2.5 pt-5 pb-2.5 text-gray-900 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              placeholder=" "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <label
              htmlFor="confirmPassword"
              className="absolute text-sm text-gray-500 left-2 top-1.5 peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-blue-600 transition-all"
            >
              Confirm Password
            </label>
          </div>
          <div className="flex flex-col items-center">
            <label className="relative cursor-pointer">
              {preview ? (
                <img src={preview} alt="Profile Preview" className="w-24 h-24 rounded-full shadow-lg" />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center text-gray-500 border border-gray-300 rounded-full bg-gray-100 hover:bg-blue-200">
                  <span>Upload</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" required />
            </label>
          </div>

          <button type="submit" className="w-full bg-blue-200 text-black py-2 rounded hover:bg-blue-400">
            Add Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminForm;
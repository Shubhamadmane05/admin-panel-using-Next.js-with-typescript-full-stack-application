"use client";

import { useRouter } from "next/navigation";

const RoleSelection = () => {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select Your Role</h2>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/user/register")}
            className="w-full bg-blue-200 text-black py-2 rounded hover:bg-blue-400 transition duration-200"
          >
            Register as User
          </button>

          <button
            onClick={() => router.push("/admin/register")}
            className="w-full bg-blue-200 text-black py-2 rounded hover:bg-blue-400 transition duration-200"
          >
            Go to Admin Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

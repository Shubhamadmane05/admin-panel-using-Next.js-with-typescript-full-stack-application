"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";

const Logout = () => {
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents default link behavior

    toast.success("Logging out...");

    await signOut({ redirect: false }); // Clears session

    // Redirect and reload to ensure session is fully cleared
    router.replace("/");
    window.location.reload();
  };

  return (
    <Link href="/" onClick={handleLogout} className="text-red-600 hover:underline">
      Logout
    </Link>
  );
};

export default Logout;

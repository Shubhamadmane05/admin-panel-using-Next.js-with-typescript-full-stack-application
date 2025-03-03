"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HomeIcon, UserIcon } from "@heroicons/react/24/solid";
import { FaReact } from "react-icons/fa";
import { useSession } from "next-auth/react";
import Profile from "../profile/page"; 

const Sidebar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileApiUrl, setProfileApiUrl] = useState<string>("");
  const [showProfile, setShowProfile] = useState(false); 

  useEffect(() => {
    if (status === "loading") return;

    const userId = session?.user?.id || "";
    const userRole = session?.user?.role || "";

    if (!userId) {
      console.warn("User ID is undefined");
      return;
    }

    const isAdmin = userRole === "admin";
    const apiUrl = isAdmin ? `/admin/photo/${userId}` : `/admin/user/${userId}`;
    setProfileApiUrl(apiUrl);
  }, [session, status]);

  // ✅ Fetch new profile image after editing
  const fetchPhoto = async () => {
    if (!profileApiUrl) return;

    try {
      console.log("Fetching from:", profileApiUrl);
      const res = await fetch(profileApiUrl);
      console.log("Response Status:", res.status);

      if (!res.ok) throw new Error("Failed to fetch image");

      const data = await res.json();
      setProfileImage(data.photo ? `data:image/jpeg;base64,${data.photo}` : null);
    } catch (error) {
      console.error("Error fetching photo:", error);
      setProfileImage(null);
    }
  };

  // ✅ Auto-fetch image when profile modal closes
  useEffect(() => {
    if (!profileApiUrl) return;
    fetchPhoto();
  }, [profileApiUrl, showProfile]);

  return (
    <>
      {/* Sidebar */}
      <div className="w-64 h-screen fixed text-black shadow-2xl p-5 flex flex-col bg-gray-100">
        <div className="flex flex-col items-center mb-5">
          <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 shadow-lg border-4 border-gray-600">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <span className="text-gray-400 text-sm">No Image</span>
            )}
          </div>
        </div>

        <h2 className="text-2xl text-black font-serif mb-6 text-center font-semibold">Dashboard</h2>

        <ul className="space-y-4 text-black flex-grow">
          <li
            className="flex items-center gap-3 cursor-pointer hover:text-gray-500 transition-all p-2 rounded-lg hover:bg-gray-200"
            onClick={() => router.push("/dashboard/home")}
          >
            <HomeIcon className="w-5 h-5 text-black" />
            <span className="text-lg font-medium font-serif">Home</span>
          </li>

          {session?.user?.role === "admin" && (
            <li
              className="flex items-center gap-3 cursor-pointer hover:text-gray-500 transition-all p-2 rounded-lg hover:bg-gray-200"
              onClick={() => router.push("/dashboard/user")}
            >
              <UserIcon className="w-5 h-5 text-black" />
              <span className="text-lg font-medium font-serif">Users</span>
            </li>
          )}

          <li
            className="flex items-center gap-3 cursor-pointer hover:text-gray-500 transition-all p-2 rounded-lg hover:bg-gray-200"
            onClick={() => router.push("/dashboard/projects")}
          >
            <FaReact className="w-5 h-5 text-black" />
            <span className="text-lg font-medium font-serif">Projects</span>
          </li>

          {/* View Profile Button */}
          <li
            className="flex items-center gap-3 cursor-pointer hover:text-gray-500 transition-all p-2 rounded-lg hover:bg-gray-200"
            onClick={() => setShowProfile(true)}
          >
            <span className="text-blue underline font-serif">View Profile</span>
          </li>
        </ul>
      </div>

      {/* Remove the `relative overflow-hidden` div */}
      {showProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Profile setShowProfile={setShowProfile} />
        </div>
      )}

    </>
  );
};

export default Sidebar;

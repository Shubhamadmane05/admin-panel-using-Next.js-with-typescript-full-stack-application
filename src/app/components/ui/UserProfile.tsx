"use client"
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

const UserProfile = () => {
  const router = useRouter();
  const { id } = router.query; 
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/users/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!user) return <p className="text-center text-red-500">User not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-black">User Profile</h1>
      <div className="flex items-center space-x-4">
        {user.profilePicture ? (
          <Image
            src={`data:image/png;base64,${user.profilePicture}`} // BLOB to Base64
            alt="Profile Picture"
            width={80}
            height={80}
            className="rounded-full"
            unoptimized // Prevent Next.js from optimizing base64 images
          />
        ) : (
          <Image
            src="/default-avatar.png" // Fallback image
            alt="Default Profile"
            width={80}
            height={80}
            className="rounded-full"
          />
        )}
        <div className="text-black">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {user.status}</p>
        </div>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => router.push("/users")}
      >
        Back to Users List
      </button>
    </div>
  );
};

export default UserProfile;

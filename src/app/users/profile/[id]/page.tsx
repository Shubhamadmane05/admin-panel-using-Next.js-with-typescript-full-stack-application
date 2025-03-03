"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

const UserProfile = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const response = await axios.get(`/users/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleImageUpload = async (event: { target: { files: string | any[]; }; }) => {
    if (!event.target.files || event.target.files.length === 0) return;
  
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("profilePicture", file);
  
    setImageUploading(true);
    try {
      const response = await axios.post(`/users/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        
        const userResponse = await axios.get(`/users/${id}`);
        setUser(userResponse.data);
      }
    } catch (error: any) {
      console.error("Error uploading image:", error.response?.data || error.message);
    } finally {
      setImageUploading(false);
    }
  };
  
  
  
  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-lg border border-gray-200">
      <h1 className="text-3xl font-serif text-black mb-4 text-gray-800 text-center">User Profile</h1>
      <div className="flex flex-col items-center">
        {user.profilePicture ? (
          <Image
          src={user.profilePicture}
          alt="Profile Picture"
          width={120}
          height={120}
          className="rounded-full border-4 border-gray-300 shadow-md object-cover"
          style={{ aspectRatio: "1 / 1" }}
        />
        
        ) : 
        (
          <Image
            src="/default-avatar.png"
            alt="Default Profile"
            width={120}
            height={120}
            className="rounded-full border-4 border-gray-300 shadow-md"
          />
        )
        }
        <div className="text-gray-700 text-center mt-4">
          <p className="text-lg font-medium"><strong>Name:</strong> {user.name}</p>
          <p className="text-lg"><strong>Email:</strong> {user.email}</p>
          <p className="text-lg"><strong>Status:</strong> <span className="text-blue-600">{user.status}</span></p>
        </div>
        {/* <label className="mt-4 cursor-pointer text-blue-500 hover:underline">
          {imageUploading ? "Uploading..." : "Update Image"}
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        </label> */}
      </div>
      <button
        className="mt-6 w-full px-4 py-2 bg-blue-200 text-black rounded-lg hover:bg-blue-200 transition"
        onClick={() => router.push("/dashboard/user")}
      >
        ⬅ Back to Users List
      </button>
    </div>
  );
};

export default UserProfile;
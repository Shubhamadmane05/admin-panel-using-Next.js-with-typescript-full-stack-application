"use client";
import { useEffect, useState } from "react";
import { useSession, update } from "next-auth/react";
import Logout from "../logout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Profile = ({ setShowProfile }: { setShowProfile: (value: boolean) => void }) => {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<{ name: string; email: string; profilePicture?: string; status?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({ name: "", email: "", profilePicture: "" });
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);


  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    if (!session?.user?.id || !session?.user?.role) {
      console.error("User session missing ID or role:", session);
      setError("Invalid session data.");
      setLoading(false);
      return;
    }

    const userId = session.user.id;
    const isAdmin = session.user.role === "admin";
    const apiUrl = isAdmin ? `/admin/photo/${userId}` : `/admin/user/${userId}`;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
          throw new Error(`Failed to fetch profile: ${res.statusText}`);
        }
        const data = await res.json();
        setProfile({
          name: data.name,
          email: data.email,
          profilePicture: data.photo ? `data:image/jpeg;base64,${data.photo}` : "/default-avatar.png",
          status: data.status || "Active",
        });

        setError(null);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status]);

  const handleEditProfile = () => {
    if (!profile) {
      console.error("Profile is empty, cannot edit.");
      return;
    }

    setEditProfile({
      name: profile.name || "",
      email: profile.email || "",
      profilePicture: profile.profilePicture || "/default-avatar.png",
    });

    setNewProfilePicture(null);
    setIsEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfilePicture(file);

      const reader = new FileReader();
      reader.onload = () => {
        setEditProfile((prev) => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    if (!session?.user?.id || !session?.user?.role) {
      toast.error("Invalid session data.");
      return;
    }

    const userId = session.user.id;
    const isAdmin = session.user.role === "admin";
    const updateUrl = isAdmin ? `/profile/update/admin/${userId}` : `/profile/update/user/${userId}`;

    let base64Image = editProfile.profilePicture;

    if (newProfilePicture) {
      const reader = new FileReader();
      reader.readAsDataURL(newProfilePicture);
      await new Promise((resolve) => {
        reader.onloadend = () => {
          base64Image = reader.result as string;
          resolve(null);
        };
      });
    }

    // Optimistically update UI
    setProfile((prev) => ({
      ...prev!,
      name: editProfile.name,
      email: editProfile.email,
      profilePicture: base64Image,
    }));

    setIsEditing(false); 

    try {
      const res = await fetch(updateUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editProfile.name,
          email: editProfile.email,
          profilePicture: base64Image,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await res.json();

      // Update local state immediately
      setProfile({
        ...profile!,
        name: updatedData.admin?.fullName || updatedData.user?.name,
        email: updatedData.admin?.email || updatedData.user?.email,
        profilePicture: updatedData.admin?.photo
          ? `data:image/jpeg;base64,${updatedData.admin.photo}`
          : updatedData.user?.profilePicture || base64Image,
      });

      toast.success("Profile updated successfully!");


      await update({
        name: updatedData.admin?.fullName || updatedData.user?.name,
        email: updatedData.admin?.email || updatedData.user?.email,
        profilePicture: updatedData.admin?.photo
          ? `data:image/jpeg;base64,${updatedData.admin.photo}`
          : updatedData.user?.profilePicture || base64Image,
      });


    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-100 text-red-600 rounded-lg text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <ToastContainer />
      <div className="bg-white w-96 p-6 rounded-xl shadow-lg text-center relative">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-black" onClick={() => setShowProfile(false)}>
          ✕
        </button>

        <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-gray-300 shadow-md group">
          <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
        </div>

        <h2 className="mt-3 text-xl font-semibold text-gray-800">Hi, {profile.name}!</h2>
        <p className="text-gray-600 text-sm">{profile.email}</p>

        <button className="mt-3 w-full bg-blue-200 hover:bg-blue-400 text-black py-2 rounded-md text-sm font-serif" onClick={handleEditProfile}>
          Edit Profile
        </button>

        <div className="mt-2 w-full bg-gray-100 hover:bg-red-200 text-black py-2 rounded-md text-sm font-medium">
          <Logout />
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          {/* Modal Container */}
          <div className="bg-white w-96 p-6 rounded-xl shadow-lg text-center relative">

            {/* Close Button (Properly Inside Modal) */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
              onClick={() => setIsEditing(false)}
            >
              ✕
            </button>

            <h2 className="text-xl mb-4 text-black font-serif">Edit Profile</h2>

            <input
              type="text"
              className="w-full p-2 border rounded mb-2 text-black font-serif"
              value={editProfile.name}
              onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
              placeholder="Name"
            />

            <input
              type="email"
              className="w-full p-2 border rounded mb-2 text-black font-serif"
              value={editProfile.email}
              onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
              placeholder="Email"
            />

            {/* Profile Picture Upload */}
            <label className="relative mx-auto w-24 h-24 rounded-full border-4 border-gray-300 shadow-md cursor-pointer overflow-hidden flex items-center justify-center">
              <img
                src={editProfile.profilePicture}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            <button className="bg-green-500 text-white px-4 py-2 rounded-md mt-4" onClick={handleSaveChanges}>
              Save
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;












// "use client";
// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import Logout from "../logout";

// const Profile = ({ setShowProfile }: { setShowProfile: (value: boolean) => void }) => {
//   const { data: session, status } = useSession();
//   const [profile, setProfile] = useState<{
//     name: string;
//     email: string;
//     profilePicture?: string;
//     status?: string;
//   } | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState(false); // Controls Edit Profile Modal
//   const [editProfile, setEditProfile] = useState({ name: "", email: "", profilePicture: "", status: "" });

//   useEffect(() => {
//     if (status !== "authenticated") {
//       setLoading(false);
//       return;
//     }

//     if (!session?.user?.id || !session?.user?.role) {
//       console.error("User session missing ID or role:", session);
//       setError("Invalid session data.");
//       setLoading(false);
//       return;
//     }

//     const userId = session.user.id;
//     const isAdmin = session.user.role === "admin";
//     const apiUrl = isAdmin ? `/admin/photo/${userId}` : `/admin/user/${userId}`;

//     const fetchProfile = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(apiUrl);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch profile: ${res.statusText}`);
//         }

//         const data = await res.json();
//         setProfile({
//           name: data.name,
//           email: data.email,
//           profilePicture: data.photo ? `data:image/jpeg;base64,${data.photo}` : "/default-avatar.png",
//           status: data.status || "Active", // Default status
//         });

//         setError(null);
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//         setError("Failed to load profile.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [session, status]);

//   const handleEditProfile = () => {
//     if (!profile) return;
//     setEditProfile({
//       name: profile.name,
//       email: profile.email,
//       profilePicture: profile.profilePicture || "/default-avatar.png",
//       status: profile.status || "Active",
//     });
//     setIsEditing(true);
//   };

//   const handleSaveChanges = async () => {
//     try {
//       const res = await fetch(``, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: editProfile.name,
//           email: editProfile.email,
//           profilePicture: editProfile.profilePicture,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to update profile");

//       const updatedData = await res.json();

//       // Update profile state immediately after successful update
//       setProfile({
//         ...profile!,
//         name: updatedData.name,
//         email: updatedData.email,
//         profilePicture: updatedData.profilePicture || profile?.profilePicture,
//       });

//       setIsEditing(false);
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       setError("Failed to update profile.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-lg text-gray-700">Loading profile...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-md mx-auto p-6 bg-red-100 text-red-600 rounded-lg text-center">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   if (!profile) {
//     return <p className="text-center text-gray-700">Error loading profile.</p>;
//   }

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//       <div className="bg-white w-96 p-6 rounded-xl shadow-lg text-center relative">
//         {/* Close Button */}
//         <button
//           className="absolute top-3 right-3 text-gray-500 hover:text-black"
//           onClick={() => setShowProfile(false)}
//         >
//           ✕
//         </button>

//         {/* Profile Picture with Change Option */}
//         <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-gray-300 shadow-md group">
//           <img
//             src={profile.profilePicture}
//             alt="Profile"
//             className="w-full h-full object-cover"
//             onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
//           />
//           <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//             <button
//               className="text-white text-xs font-semibold"
//               onClick={handleEditProfile}
//             >
//               Change
//             </button>
//           </div>
//         </div>

//         {/* Name & Email */}
//         <h2 className="mt-3 text-xl font-semibold text-gray-800">Hi, {profile.name}!</h2>
//         <p className="text-gray-600 text-sm">{profile.email}</p>

//         {/* Edit Profile Button */}
//         <button
//           className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm font-medium"
//           onClick={handleEditProfile}
//         >
//           Edit Profile
//         </button>

//         {/* Sign Out Button */}
//         <div className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-black py-2 rounded-md text-sm font-medium">
//           <Logout />
//         </div>

//         {/* Footer */}
//         <div className="mt-4 text-xs text-gray-500 flex justify-center space-x-4">
//           <a href="#" className="hover:underline">Privacy policy</a>
//           <a href="#" className="hover:underline">Terms of service</a>
//         </div>
//       </div>

//       {/* Edit Profile Modal */}
//       {isEditing && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white w-96 p-6 rounded-xl shadow-lg text-center">
//             <h2 className="text-xl mb-4 text-black font-serif">Edit Profile</h2>

//             <input
//               type="text"
//               className="w-full p-2 border rounded mb-2 text-black font-serif"
//               value={editProfile.name}
//               onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
//               placeholder="Name"
//             />

//             <input
//               type="email"
//               className="w-full p-2 border rounded mb-2 text-black font-serif"
//               value={editProfile.email}
//               onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
//               placeholder="Email"
//             />

//             <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-gray-300 shadow-md cursor-pointer">
//               <img
//                 src={editProfile.profilePicture || "/default-avatar.png"}
//                 alt="Profile"
//                 className="w-full h-full object-cover"
//                 onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
//               />
//               <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={(e) => {
//                     if (e.target.files && e.target.files[0]) {
//                       const reader = new FileReader();
//                       reader.onload = (event) => {
//                         setEditProfile({ ...editProfile, profilePicture: event.target?.result as string });
//                       };
//                       reader.readAsDataURL(e.target.files[0]);
//                     }
//                   }}
//                 />
//                 Change
//               </label>
//             </div>
//             <div className="flex justify-between mt-3">
//               <button className="bg-green-500 hover:bg-green-600 text-black font-serif py-2 px-4 rounded-md" onClick={handleSaveChanges}>
//                 Save
//               </button>
//               <button className="bg-red-500 hover:bg-red-600 text-black font-serif py-2 px-4 rounded-md" onClick={() => setIsEditing(false)}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Profile;

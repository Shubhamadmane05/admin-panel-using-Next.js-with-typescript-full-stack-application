"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bell, Settings, X, Trash2, UserCircle } from "lucide-react";

interface User {
  userId: number;
  userName: string;
  userEmail: string;
  userDepartment: string;
}

export default function Notification() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<User[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user || session.user.role !== "admin") return;

    // Fetch missed notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/notifications/api?department=${session.user.department}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [status, session]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user || session.user.role !== "admin") return;
    
    let socket = new WebSocket("ws://localhost:8080");
  
    socket.onopen = () => {
      console.log("Connected to WebSocket server");
  
      // Send admin department 
      const adminDepartment = session.user.department;
      socket.send(JSON.stringify({ event: "register_admin", department: adminDepartment }));
    };
  
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
  
      if (data.event === "new_user") {
        const newUser = data.user;
  
        // Ensure new notifications
        if (newUser.userDepartment === "All" || newUser.userDepartment === session.user.department) {
          setNotifications((prev) => {
            // Prevent duplicates 
            if (prev.some((n) => n.userId === newUser.userId)) return [...prev];
            return [newUser, ...prev]; 
          });
  
          setUnreadCount((prev) => prev + 1);
        }
      }
    };
  
    socket.onclose = () => {
      console.log("WebSocket disconnected. Reconnecting in 5s...");
      setTimeout(() => {
        setWs(null); // Force reinitialization
      }, 5000);
    };
  
    setWs(socket);
  
    return () => socket.close();
  }, [status, session]);

  const clearNotifications = async () => {
    setNotifications([]);
    setUnreadCount(0);
    await fetch("/notifications/api/", { method: "DELETE" });
  };

  return (
    <div className="relative flex justify-end items-center w-full pr-4">
      <div
        className="relative cursor-pointer flex items-center"
        onClick={() => {
          if (!showNotificationPanel) {
            setUnreadCount(notifications.length);
          }
          setShowNotificationPanel(!showNotificationPanel);
        }}
      >
        <Bell className="w-7 h-7 text-gray-700 hover:text-blue-500 transition duration-200" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
            {unreadCount}
          </span>
        )}
      </div>

      {showNotificationPanel && (
        <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-80 max-h-96 overflow-y-auto p-4 border border-gray-300 z-50">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Notifications (please refresh page)</h3>
            <div className="flex items-center gap-3">
              {notifications.length > 0 && (
                <Trash2
                  className="w-5 h-5 cursor-pointer text-gray-600 hover:text-red-500"
                  onClick={clearNotifications}
                />
              )}
              <Settings className="w-5 h-5 cursor-pointer text-gray-600 hover:text-blue-500" />
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="p-4 text-gray-600 text-center">No new notifications</p>
          ) : (
            notifications.map((user) => (
              <div key={user.userId} className="flex items-center p-3 border-b last:border-none bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200">
                <UserCircle className="w-8 h-8 text-blue-500 mr-3" />
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-gray-500">User ID: {user.userId}</p>
                  <p className="text-sm font-semibold text-gray-800">{user.userName}</p>
                  <p className="text-xs text-gray-600">{user.userEmail}</p>
                  <p className="text-xs text-gray-600 font-medium">{user.userDepartment}</p>
                </div>
                <X
                  className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500"
                  onClick={() =>
                    setNotifications((prev) => {
                      const updated = prev.filter((n) => n.userId !== user.userId);
                      localStorage.setItem("notifications", JSON.stringify(updated));
                      return updated;
                    })
                  }
                />
              </div>
            ))
          )}
          <div className="text-center pt-2">
            <a href="/dashboard/user" className="text-blue-500 text-sm font-semibold hover:underline">
              See all new users
            </a>
          </div>
        </div>
      )}
    </div>
  );
}











// "use client";

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { Bell, Settings, X, Trash2, UserCircle } from "lucide-react";

// interface User {
//   userId: number; // ✅ Use userId instead of id
//   userName: string;
//   userEmail: string;
//   userDepartment: string;
// }

// export default function Notification() {
//   const { data: session, status } = useSession();
//   const [notifications, setNotifications] = useState<User[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showNotificationPanel, setShowNotificationPanel] = useState(false);
//   const [ws, setWs] = useState<WebSocket | null>(null);

//   useEffect(() => {
//     if (status !== "authenticated" || !session?.user || session.user.role !== "admin") return;

//     // Fetch missed notifications from DB
//     const fetchNotifications = async () => {
//       try {
//         const res = await fetch("/notifications/api");
//         if (!res.ok) throw new Error("Failed to fetch notifications");
//         const data = await res.json();
//         setNotifications(data.notifications);
//         setUnreadCount(data.notifications.length);
//       } catch (error) {
//         console.error("Error fetching notifications:", error);
//       }
//     };

//     fetchNotifications();
//   }, [status, session]);

//   useEffect(() => {
//     if (status !== "authenticated" || !session?.user || session.user.role !== "admin") return;
//     if (ws) return;

//     const socket = new WebSocket("ws://localhost:8080");
//     setWs(socket);

//     socket.onopen = () => console.log("Connected to WebSocket server");

//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.event === "new_user") {
//         setNotifications((prev) => {
//           if (prev.some((n) => n.userId === data.user.userId)) return prev;
//           return [data.user, ...prev];
//         });
//         setUnreadCount((prev) => prev + 1);
//       }
//     };

//     socket.onclose = () => {
//       console.log("WebSocket disconnected. Attempting to reconnect...");
//       setTimeout(() => setWs(null), 5000);
//     };

//     return () => socket.close();
//   }, [status, session, ws]);

//   const clearNotifications = async () => {
//     setNotifications([]);
//     setUnreadCount(0);
//     await fetch("/notifications/api/delete", { method: "DELETE" });
//   };

//   return (
//     <div className="relative flex justify-end items-center w-full pr-4">
//       <div
//         className="relative cursor-pointer flex items-center"
//         onClick={() => {
//           if (!showNotificationPanel) {
//             setUnreadCount(notifications.length);
//           }
//           setShowNotificationPanel(!showNotificationPanel);
//         }}
//       >
//         <Bell className="w-7 h-7 text-gray-700 hover:text-blue-500 transition duration-200" />
//         {unreadCount > 0 && (
//           <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
//             {unreadCount}
//           </span>
//         )}
//       </div>

//       {showNotificationPanel && (
//         <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-80 max-h-96 overflow-y-auto p-4 border border-gray-300">
//           <div className="flex justify-between items-center border-b pb-2">
//             <h3 className="text-lg font-semibold text-gray-900">Notifications (please refresh page)</h3>
//             <div className="flex items-center gap-3">
//               {notifications.length > 0 && (
//                 <Trash2
//                   className="w-5 h-5 cursor-pointer text-gray-600 hover:text-red-500"
//                   onClick={clearNotifications}
//                 />
//               )}
//               <Settings className="w-5 h-5 cursor-pointer text-gray-600 hover:text-blue-500" />
//             </div>
//           </div>

//           {notifications.length === 0 ? (
//             <p className="p-4 text-gray-600 text-center">No new notifications</p>
//           ) : (
//             notifications.map((user) => (
//               <div key={user.userId} className="flex items-center p-3 border-b last:border-none bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200">
//                 <UserCircle className="w-8 h-8 text-blue-500 mr-3" />
//                 <div className="flex-grow">
//                   <p className="text-sm font-semibold text-gray-500">User ID: {user.userId}</p>
//                   <p className="text-sm font-semibold text-gray-800">{user.userName}</p>
//                   <p className="text-xs text-gray-600">{user.userEmail}</p>
//                   <p className="text-xs text-gray-600 font-medium">{user.userDepartment}</p>
//                 </div>
//                 <X
//                   className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500"
//                   onClick={() =>
//                     setNotifications((prev) => {
//                       const updated = prev.filter((n) => n.userId !== user.userId);
//                       localStorage.setItem("notifications", JSON.stringify(updated));
//                       return updated;
//                     })
//                   }
//                 />
//               </div>
//             ))
//           )}
//           <div className="text-center pt-2">
//             <a href="/dashboard/user" className="text-blue-500 text-sm font-semibold hover:underline">
//               See all new users
//             </a>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }















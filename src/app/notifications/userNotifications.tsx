"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bell, Settings, X, Trash2, UserCircle } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Notification() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<User[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications);
      console.log("Loaded from localStorage:", parsedNotifications);  
  
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.length); 
    }
  }, []);
  

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user || session.user.role !== "admin") return;
  
    // Prevent multiple WebSocket connections
    if (ws) return;
  
    const socket = new WebSocket("ws://localhost:8080");
    setWs(socket);
  
    socket.onopen = () => console.log("Connected to WebSocket server");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);
  
      if (data.event === "new_user") {
        setNotifications((prev) => {
          if (prev.some((user) => user.id === data.user.id)) return prev;
          const updatedNotifications = [data.user, ...prev];
          localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });
  
        setUnreadCount((prev) => prev + 1);
      }
    };
  
    socket.onerror = (error) => {
    };
  
    socket.onclose = () => {
      console.log("WebSocket disconnected. Reconnecting...");
      setTimeout(() => {
        setWs(null); // Reset WebSocket 
      }, 5000);
    };
  
    return () => {
      console.log("Cleaning up WebSocket...");
      socket.close();
    };
  }, [status, session]);
  
  

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("notifications");
  };


  return (
    <div className="relative flex justify-end items-center w-full pr-4">
      {/* Notification Bell with Badge */}
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

      {/* Notification Panel */}
      {showNotificationPanel && (
        <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-80 max-h-96 overflow-y-auto p-4 border border-gray-300">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Notifications(plz refresh page ) </h3>
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
              <div key={user.id} className="flex items-center p-3 border-b last:border-none bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200">
                <UserCircle className="w-8 h-8 text-blue-500 mr-3" />
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-gray-500">User ID: {user.id}</p>
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <X
                  className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500"
                  onClick={() =>
                    setNotifications((prev) => {
                      const updated = prev.filter((n) => n.id !== user.id);
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
              See all new user
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
//   id: number;
//   name: string;
//   email: string;
// }

// export default function Notification() {
//   const { data: session, status } = useSession();
//   const [notifications, setNotifications] = useState<User[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showNotificationPanel, setShowNotificationPanel] = useState(false);
//   const [fetchedUserIds, setFetchedUserIds] = useState(new Set<number>()); 
//   const [isListening, setIsListening] = useState(true); 

//   useEffect(() => {
//     const storedNotifications = localStorage.getItem("notifications");
//     if (storedNotifications) {
//       const parsedNotifications = JSON.parse(storedNotifications);
//       setNotifications(parsedNotifications);
//       setUnreadCount(parsedNotifications.length); 
//     }
//   }, []);

//   // Save notifications to localStorage 
//   useEffect(() => {
//     if (notifications.length > 0) {
//       localStorage.setItem("notifications", JSON.stringify(notifications));
//     }
//   }, [notifications]);

//   useEffect(() => {
//     if (status !== "authenticated" || !session?.user || session.user.role !== "admin") return;

//     let isActive = true; 

//     const fetchNewUsers = async () => {
//       while (isActive) {
//         try {
//           const response = await fetch("/polling/api", { method: "GET", cache: "no-store" });

//           if (!response.ok) throw new Error("Failed to fetch new users");

//           const data = await response.json();

//           if (data.event === "new_user") {
//             const userId = data.user.id;

//             setNotifications((prev) => {
//               if (prev.some((user) => user.id === userId)) {
//                 return prev; // Prevent duplicates
//               }
//               const updatedNotifications = [{ ...data.user }, ...prev];
              
//               // Save  new notification
//               localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

//               return updatedNotifications;
//             });

//             setFetchedUserIds((prev) => {
//               const newSet = new Set(prev);
//               newSet.add(userId);
//               return newSet;
//             });

//             setUnreadCount((prev) => prev + 1);
//           }
//         } catch (error) {
//           // console.error("Error fetching new user:", error);
//         }

//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }
//     };

//     if (isListening) {
//       fetchNewUsers();
//     }

//     return () => {
//       isActive = false; 
//     };
//   }, [status, session, isListening]);

//   const clearNotifications = () => {
//     setNotifications([]);
//     setUnreadCount(0);
//     localStorage.removeItem("notifications");
//   };


//   return (
//     <div className="relative flex justify-end items-center w-full pr-4">
//       {/* Notification Bell with Badge */}
//       <div
//         className="relative cursor-pointer flex items-center"
//         onClick={() => {
//           setUnreadCount(0);
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

//       {/* Notification Panel */}
//       {showNotificationPanel && (
//         <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-80 max-h-96 overflow-y-auto p-4 border border-gray-300">
//           <div className="flex justify-between items-center border-b pb-2">
//             <h3 className="text-lg font-semibold text-gray-900">Notifications(plz refresh page ) </h3>
//             <div className="flex items-center gap-3">
//               {notifications.length > 0 && (
//                 <Trash2
//                 className="w-5 h-5 cursor-pointer text-gray-600 hover:text-red-500"
//                 onClick={clearNotifications}
//               />
              
//               )}
//               <Settings className="w-5 h-5 cursor-pointer text-gray-600 hover:text-blue-500" />
//             </div>
//           </div>

//           {notifications.length === 0 ? (
//             <p className="p-4 text-gray-600 text-center">No new notifications</p>
//           ) : (
//             notifications.map((user) => (
//               <div key={user.id} className="flex items-center p-3 border-b last:border-none bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200">
//                 <UserCircle className="w-8 h-8 text-blue-500 mr-3" />
//                 <div className="flex-grow">
//                   <p className="text-sm font-semibold text-gray-500">User ID: {user.id}</p>
//                   <p className="text-sm font-semibold text-gray-800">{user.name}</p>
//                   <p className="text-xs text-gray-600">{user.email}</p>
//                 </div>
//                 <X
//                   className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500"
//                   onClick={() =>
//                     setNotifications((prev) => {
//                       const updated = prev.filter((n) => n.id !== user.id);
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
//               See all new user
//             </a>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }












"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bell, X } from "lucide-react";

interface Notification {
  updatedBy: string;
  changes: Record<string, any>;
}

export default function UserNotification() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user || ws) return; // Prevent unnecessary reconnections

    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(
        JSON.stringify({ event: "register_user", userId: session.user.id })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (
        data.event === "user_updated" &&
        data.data.userId === session.user.id
      ) {
        setNotifications((prev) => [data.data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket closed. Attempting to reconnect...");
      setTimeout(() => setWs(null), 5000);
    };

    setWs(socket);

    return () => {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onclose = null;
      socket.close();
    };
  }, [status, session, ws]);

  return (
    <div className="relative">
      <div
        className="relative cursor-pointer"
        onClick={() => {
          setShowPanel(!showPanel);
          setUnreadCount(0);
        }}
      >
        <Bell className="w-7 h-7 text-gray-700 hover:text-blue-500 transition duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {showPanel && (
        <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-80 p-4 border">
          <div className="flex justify-between items-center pb-2">
            <h3 className="text-lg font-semibold">Profile Updates</h3>
          </div>

          {notifications.length === 0 ? (
            <p className="text-center text-gray-600">No recent updates</p>
          ) : (
            notifications.map((notif, index) => (
              <div key={index} className="p-3 border-b last:border-none flex items-start">
                <div className="flex-1">
                  <p className="text-sm">
                    Admin <strong>{notif.updatedBy}</strong> updated your profile:
                  </p>
                  <ul className="text-sm list-disc pl-5">
                    {Object.entries(notif.changes).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
                <X
                  className="cursor-pointer text-gray-500 hover:text-red-500 ml-auto"
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

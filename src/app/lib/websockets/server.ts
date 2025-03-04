import { WebSocketServer, WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = 8080;

if (!globalThis.wss) {
  const wss = new WebSocketServer({ port: PORT });
  globalThis.wss = wss;

  // Store clients with their respective department
  const clients = new Map<WebSocket, string>();

  wss.on("connection", (ws) => {
    console.log("Admin connected to WebSocket. Awaiting department registration...");

    // Temporarily store without department
    clients.set(ws, "");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.event === "register_admin") {
          const adminDepartment = message.department;
          clients.set(ws, adminDepartment);
          console.log(`Admin registered for department: ${adminDepartment}`);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });

    ws.on("close", () => {
      console.log("Admin disconnected");
      clients.delete(ws);
    });
  });

  //  Send notification 
  globalThis.notifyAdmin = async (newUser: { id: number; name: string; email: string; department: string }) => {
    const message = JSON.stringify({ event: "new_user", user: newUser });

    // Find admins
    clients.forEach((adminDepartment, client) => {
      if (client.readyState === WebSocket.OPEN && newUser.department === adminDepartment) {
        client.send(message);
        console.log(`Notification sent to ${adminDepartment} admin for user ${newUser.name}`);
      }
    });

    // Ensure notification stored
    try {
      await prisma.notification.create({
        data: {
          userId: newUser.id,
          userName: newUser.name,
          userEmail: newUser.email,
          userDepartment: newUser.department,
          isRead: false, // Mark as unread
        },
      });

      console.log(`Notification stored for user ${newUser.name} (Department: ${newUser.department})`);
    } catch (error) {
      console.error("Error storing notification in DB:", error);
    }
  };

  globalThis.notifyUser = async (updateData) => {
    const message = JSON.stringify({
      event: "user_updated",
      data: {
        userId: updateData.userId,
        updatedBy: updateData.updatedBy,
        changes: updateData.changes,
      },
    });

    // Send notification only to the affected user
    clients.forEach((departmentOrUserId, client) => {
      if (client.readyState === WebSocket.OPEN && departmentOrUserId === updateData.userId.toString()) {
        client.send(message);
        console.log(`Notification sent to user ID ${updateData.userId}`);
      }
    });
    

    // Fetch user details if not provided
    let user = {
      userName: updateData.userName || "",
      userEmail: updateData.userEmail || "",
      userDepartment: updateData.userDepartment || "",
    };

    if (!user.userName || !user.userEmail || !user.userDepartment) {
      try {
        const fetchedUser = await prisma.user.findUnique({
          where: { id: updateData.userId },
          select: { name: true, email: true, department: true },
        });
        if (fetchedUser) {
          user = {
            userName: fetchedUser.name,
            userEmail: fetchedUser.email,
            userDepartment: fetchedUser.department,
          };
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        return;
      }
    }

    // Store notification in DB
    try {
      await prisma.userNotification.create({
        data: {
          userId: updateData.userId,
          updatedBy: updateData.updatedBy,
          changes: updateData.changes,
          isRead: false,
        },
      });

      console.log(`Notification stored for user ${updateData.userId}`);
    } catch (error) {
      console.error("Error storing notification in DB:", error);
    }
  };

  

  console.log(`WebSocket server started on ws://localhost:${PORT}`);
}

export const notifyAdmin = globalThis.notifyAdmin;
export const notifyUser = globalThis.notifyUser;
export default globalThis.wss;












// import { WebSocketServer, WebSocket } from "ws";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// const PORT = 8080;

// if (!globalThis.wss) {
//   const wss = new WebSocketServer({ port: PORT });
//   globalThis.wss = wss;
//   const clients = new Set<WebSocket>();

//   wss.on("connection", (ws) => {
//     console.log("Admin connected to WebSocket");
//     clients.add(ws);

//     ws.on("close", () => {
//       console.log("Admin disconnected");
//       clients.delete(ws);
//     });
//   });

//   // Send notification to WebSocket clients & store in DB
//   globalThis.notifyClients = async (newUser: { id: number; name: string; email: string , department: string}) => {
//     const message = JSON.stringify({ event: "new_user", user: newUser });

//     clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     });

//     // Store notification in the database
//     await prisma.notification.create({
//       data: {
//         userId: newUser.id,
//         userName: newUser.name,
//         userEmail: newUser.email,
//         userDepartment:newUser.department,
//         isRead: false, // Mark as unread
//       },
//     });
//   };

//   console.log(`WebSocket server started on ws://localhost:${PORT}`);
// }

// export const notifyClients = globalThis.notifyClients;
// export default globalThis.wss;






// import { WebSocketServer, WebSocket } from "ws";

// const PORT = 8080;

// // Prevent multiple WebSocket  
// if (!globalThis.wss) {
  
//   const wss = new WebSocketServer({ port: PORT });
//   globalThis.wss = wss; // Store WebSocket server globally

//   const clients = new Set<WebSocket>();

//   wss.on("connection", (ws) => {
//     console.log("New client connected");
//     clients.add(ws);

//     ws.on("close", () => {
//       console.log(" Client disconnected");
//       clients.delete(ws);
//     });
//   });

//   globalThis.notifyClients = (newUser: { id: number; name: string; email: string }) => {
//     const message = JSON.stringify({ event: "new_user", user: newUser });

//     clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     });
//   };

//   console.log(` WebSocket server started on ws://localhost:${PORT}`);
// }

// export const notifyClients = globalThis.notifyClients;
// export default globalThis.wss;

import { NextResponse } from "next/server";


// Store waiting clients
const waitingClients: { resolve: (value: any) => void }[] = [];

export async function GET() {
  return new Promise((resolve) => {
    // Store request
    const client = { resolve };
    waitingClients.push(client);

    // Remove stale requests 
    setTimeout(() => {
      const index = waitingClients.indexOf(client);
      if (index !== -1) {
        waitingClients.splice(index, 1);
        resolve(NextResponse.json({ message: "No new users", event: null }));
      }
    }, 30000);
  });
}

        
export async function notifyClients(newUser: { id: number; name: string; email: string, department: string }) {
  while (waitingClients.length > 0) {
    const client = waitingClients.shift();
    if (client) {
      client.resolve(NextResponse.json({ event: "new_user", user: newUser }));
    }
  }
}



















// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();


// // Store waiting clients for long polling
// const waitingClients: { resolve: (value: any) => void }[] = [];

// export async function GET() {
//   return new Promise(async (resolve) => {
//     //  First, check for unread notifications in the database
//     const unreadNotifications = await prisma.notification.findMany({
//       where: { isRead: false },
//       orderBy: { createdAt: "desc" },
//     });

//     if (unreadNotifications.length > 0) {
//       // If there are unread notifications, send them immediately
//       resolve(NextResponse.json({ event: "unread_notifications", notifications: unreadNotifications }));
//     } else {
//       //  Wait indefinitely until a new notification is available
//       const client = { resolve };
//       waitingClients.push(client);
//     }
//   });
// }

// //  Function to notify clients when a new user registers
// export async function notifyClients(newUser: { id: number; name: string; email: string }) {
//   // Store notification in the database
//   await prisma.notification.create({
//     data: {
//       userId: newUser.id,
//       message: `New user registered: ${newUser.name} (${newUser.email})`,
//       isRead: false,
//     },
//   });

//   // Notify all waiting clients
//   while (waitingClients.length > 0) {
//     const client = waitingClients.shift();
//     if (client) {
//       client.resolve(NextResponse.json({ event: "new_user", user: newUser }));
//     }
//   }
// }



















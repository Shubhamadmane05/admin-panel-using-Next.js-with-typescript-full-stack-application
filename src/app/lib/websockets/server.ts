import { WebSocketServer, WebSocket } from "ws";

const PORT = 8080;

// Prevent multiple WebSocket  
if (!globalThis.wss) {
  
  const wss = new WebSocketServer({ port: PORT });
  globalThis.wss = wss; // Store WebSocket server globally

  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    console.log("New client connected");
    clients.add(ws);

    ws.on("close", () => {
      console.log(" Client disconnected");
      clients.delete(ws);
    });
  });

  globalThis.notifyClients = (newUser: { id: number; name: string; email: string }) => {
    const message = JSON.stringify({ event: "new_user", user: newUser });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  console.log(` WebSocket server started on ws://localhost:${PORT}`);
}

export const notifyClients = globalThis.notifyClients;
export default globalThis.wss;

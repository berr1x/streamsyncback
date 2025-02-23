const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
const server = app.listen(3000, () => console.log("Server запущен на порту 5000"));
const wss = new WebSocketServer({ server });

const rooms = new Map();

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      if (!rooms.has(data.roomId)) {
        rooms.set(data.roomId, []);
      }
      rooms.get(data.roomId).push(ws);
    }

    rooms.get(data.roomId).forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  ws.on("close", () => {
    rooms.forEach((clients, roomId) => {
      rooms.set(roomId, clients.filter((client) => client !== ws));
      if (rooms.get(roomId).length === 0) {
        rooms.delete(roomId);
      }
    });
  });
});

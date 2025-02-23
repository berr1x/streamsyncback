const express = require("express");
const { WebSocketServer, WebSocket } = require("ws");

const app = express();
const server = app.listen(3000, () => console.log("✅ Server запущен на порту 3000"));
const wss = new WebSocketServer({ server });

const rooms = new Map();

wss.on("connection", (ws) => {
  console.log("🔗 Клиент подключен");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log("📩 Получено сообщение:", data);

    if (data.type === "join") {
      if (!rooms.has(data.roomId)) {
        rooms.set(data.roomId, []);
      }
      rooms.get(data.roomId).push(ws);
      console.log(`✅ Клиент присоединился к комнате ${data.roomId}`);
    }

    if (data.type === "offer") {
      console.log(`📡 Получен offer для комнаты ${data.roomId}`);

      if (!rooms.has(data.roomId)) {
        console.error(`❌ Комната ${data.roomId} не существует!`);
        return;
      }

      rooms.get(data.roomId).forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(JSON.stringify(data));
          console.log(`📤 Отправлен offer в комнату ${data.roomId}`);
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("❌ Клиент отключился");
    rooms.forEach((clients, roomId) => {
      rooms.set(roomId, clients.filter((client) => client !== ws));
      if (rooms.get(roomId).length === 0) {
        rooms.delete(roomId);
      }
    });
  });
});

import express from "express";
import { createServer } from "http";
import { EVENTS } from "./constants/events";
import WebSocket from "ws";

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 7001;

app.get("/", (req, res) => {
  res.json({ message: "Hello World", status: 200 });
});

app.get("/light/on", (req, res) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(EVENTS.SERVER.LIGHT_ON);
    }
  });
  res.json({ message: "Light is ON", status: 200 });
});

app.get("/light/off", (req, res) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(EVENTS.SERVER.LIGHT_OFF);
    }
  });
  res.json({ message: "Light is OFF", status: 200 });
});

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.send("Welcome to the WebSocket server!");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);

    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Server received: ${message}`);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

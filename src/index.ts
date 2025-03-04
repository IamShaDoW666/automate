import express from "express";
import { createServer } from "http";
import { EVENTS } from "./constants/events";
import WebSocket from "ws";
import { decodeWebSocketMessage, stringToJson } from "./utils/common";

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 7001;

let status = {
  light: false
};

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

app.get("/light/toggle", (req, res) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(EVENTS.SERVER.LIGHT_TOGGLE);
    }
  });
  res.json({ message: "Light is OFF", status: 200 });
});

app.get("/light", (req, res) => {
  wss.clients.forEach(async (client) => {
    if (client.readyState === WebSocket.OPEN) {
      res.json({ success: true, status: status });
    }
  });
});

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.send("Welcome to the WebSocket server!");

  ws.on("message", (message) => {
    console.log(`<<<<<< ${message}`);
    status = stringToJson(decodeWebSocketMessage(message));
    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Server received: ${message}`);
        console.log(">>>>> " + message);
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

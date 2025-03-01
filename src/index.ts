import express from "express";
import { createServer } from "http";
import { EVENTS } from "./constants/events";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";

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

app.get("/light", (req, res) => {
  wss.clients.forEach(async (client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        // Generate a unique ID for the request
        const requestId = uuidv4();

        // Send event to client and wait for a response
        const response = await sendEventToClient(
          client,
          EVENTS.SERVER.LIGHT,
          requestId
        );
        res.json({ success: true, clientResponse: response });
      } catch (error) {
        res.status(500).json({ error: "No response from client" });
      }
    }
  });
});

// Function to send event to client and wait for acknowledgment
function sendEventToClient(client: WebSocket, data: string, requestId: string) {
  return new Promise((resolve, reject) => {
    const onMessage = (message: any) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log(message);
        // Check if the response has the same requestId
        if (parsedMessage.requestId === requestId) {
          client.removeListener(EVENTS.CLIENT.LIGHT, onMessage); // Stop listening once the correct response is received
          resolve(parsedMessage);
        }
      } catch (err) {
        console.error("Error parsing client response:", err);
      }
    };

    // Listen for messages from client
    client.on(EVENTS.CLIENT.LIGHT, onMessage);

    // Send message to client
    client.send(EVENTS.SERVER.LIGHT);

    // Timeout if no response received
    setTimeout(() => {
      client.removeListener(EVENTS.CLIENT.LIGHT, onMessage);
      reject(new Error("Timeout waiting for client response"));
    }, 5000); // 5-second timeout
  });
}

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

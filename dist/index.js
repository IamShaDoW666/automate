"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const events_1 = require("./constants/events");
const ws_1 = __importDefault(require("ws"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.default.Server({ server });
const PORT = 7001;
app.get("/", (req, res) => {
    res.json({ message: "Hello World", status: 200 });
});
app.get("/light/on", (req, res) => {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(events_1.EVENTS.SERVER.LIGHT_ON);
        }
    });
    res.json({ message: "Light is ON", status: 200 });
});
app.get("/light/off", (req, res) => {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(events_1.EVENTS.SERVER.LIGHT_OFF);
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
            if (client.readyState === ws_1.default.OPEN) {
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

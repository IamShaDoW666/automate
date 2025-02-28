"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const events_1 = require("./constants/events");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // Adjust based on frontend origin
    },
});
const PORT = 7001;
app.get("/", (req, res) => {
    res.json({ message: "Hello World", status: 200 });
});
io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on(events_1.EVENTS.CLIENT.LIGHT_ON, (data) => {
        console.log(`Turning ON: ${data}`);
        io.emit(events_1.EVENTS.SERVER.LIGHT_ON, data); // Broadcast to all clients
    });
    socket.on(events_1.EVENTS.CLIENT.LIGHT_OFF, (data) => {
        console.log(`Turning OFF: ${data}`);
        io.emit(events_1.EVENTS.SERVER.LIGHT_OFF, data); // Broadcast to all clients
    });
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

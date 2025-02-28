import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { EVENTS } from "./constants/events";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust based on frontend origin
  },
});
const PORT = 7001;

app.get("/", (req, res) => {
  res.json({ message: "Hello World", status: 200 });
});

io.on("connection", (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on(EVENTS.CLIENT.LIGHT_ON, (data) => {
    console.log(`Turning ON: ${data}`);
    io.emit(EVENTS.SERVER.LIGHT_ON, data); // Broadcast to all clients
  });

  socket.on(EVENTS.CLIENT.LIGHT_OFF, (data) => {
    console.log(`Turning OFF: ${data}`);
    io.emit(EVENTS.SERVER.LIGHT_OFF, data); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

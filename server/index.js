import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import { createServer } from "http";
import { Server } from "socket.io";
const onlineUsers = {};

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

// HTTP server create
const server = createServer(app);

// SOCKET SERVER
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // JOIN ROOM
  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });
   socket.on("user_online", (userId) => {

  onlineUsers[userId] = socket.id;

  io.emit(
    "online_users",
    Object.keys(onlineUsers)
  );

});

  // SEND MESSAGE
  socket.on("send_message", (data) => {
    const { receiverId } = data;

    io.to(receiverId).emit("receive_message", data);
  });

  // DISCONNECT
 socket.on("disconnect", () => {

  console.log("User Disconnected:", socket.id);

  for (const userId in onlineUsers) {

    if (onlineUsers[userId] === socket.id) {

      delete onlineUsers[userId];

      break;

    }
  }

  io.emit(
    "online_users",
    Object.keys(onlineUsers)
  );

});
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
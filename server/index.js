import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";


dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
// middleware
app.use(cors());

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
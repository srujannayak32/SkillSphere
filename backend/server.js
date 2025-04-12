// 📁 backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

// 🔥 Middleware: CORS must come BEFORE routes
app.use(cors({
  origin: "http://localhost:5173", // Your frontend port
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'skillsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true only in production with HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

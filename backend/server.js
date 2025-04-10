// 📁 backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "./models/User.js";
import Otp from './models/Otp.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true, // Allow credentials
}));
app.use(express.json());

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'skillsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 60 * 1000 }, // Session expires in 10 minutes
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Utility function to send OTP
const sendOtp = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "SkillSphere Password Reset OTP",
    text: `Hi there,\n\nYour OTP for resetting your password is: ${otp}. It will expire in 5 minutes.\n\nBest regards,\nSkillSphere Team`,
  });
};

// Forgot Password - Generate and send OTP
app.post("/api/forgot-password", async (req, res) => {
  const { username, email } = req.body;
  
  // Check if user exists
  const user = await User.findOne({ username, email });
  if (!user) return res.status(404).json({ message: "User not found with the provided credentials" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({ email, otp });

  req.session.email = email;  // Store email in session for later use

  try {
    await sendOtp(email, otp);
    res.json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP. Please try again later." });
  }
});

// Reset Password - Verify OTP and reset password
app.post("/api/reset-password", async (req, res) => {
  const { otp, newPassword } = req.body;
  const email = req.session.email;  // Retrieve email from session

  // Ensure session is valid (email should exist in session)
  if (!email) return res.status(400).json({ message: "Session expired or no email found. Please initiate the 'Forgot Password' process again." });

  // Check if OTP is valid
  const validOtp = await Otp.findOne({ email, otp });
  if (!validOtp) return res.status(400).json({ message: "Invalid OTP" });

  // Hash the new password and update the user's password in the database
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ email }, { password: hashedPassword });

  // Clean up OTP after password reset
  await Otp.deleteMany({ email });

  res.json({ message: "Password reset successful" });
});

// Start the server
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server is running on http://localhost:${process.env.PORT || 5000}`);
});

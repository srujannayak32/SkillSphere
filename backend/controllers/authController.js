// 📁 backend/controllers/authController.js

import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import nodemailer from 'nodemailer';

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Utility function to send OTP email
const sendOtp = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your SkillSphere OTP Code',
    text: `Hello! Your OTP is ${otp}. It is valid for 10 minutes. Welcome to SkillSphere.`,
  });
};

// --------------------- AUTH CONTROLLERS --------------------- //

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      verified: false,
    });

    await newUser.save();

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp: otpCode });

    await sendOtp(email, otpCode);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const validOtp = await Otp.findOne({ email, otp });

    if (!validOtp)
      return res.status(400).json({ message: 'Invalid or expired OTP' });

    await User.updateOne({ email }, { verified: true });
    await Otp.deleteMany({ email });

    res.status(200).json({ message: 'OTP verified. Account activated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findOne({ username, email });

    if (!user)
      return res.status(404).json({ msg: 'User not found with given credentials' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp });
    await sendOtp(email, otp);

    req.session.email = email;
    res.json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to send OTP' });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const email = req.session.email;

    if (!email)
      return res.status(400).json({ msg: 'Email not found in session' });

    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord)
      return res.status(400).json({ msg: 'Invalid or expired OTP' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    await Otp.deleteMany({ email });

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to reset password' });
  }
};

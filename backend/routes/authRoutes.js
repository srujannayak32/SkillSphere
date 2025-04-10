// 📁 backend/routes/authRoutes.js

import express from 'express';
import session from 'express-session';
import {
  signup,
  verifyOtp,
  forgotPasswordController,
  resetPasswordController,
} from '../controllers/authController.js';

const router = express.Router();

// Use session middleware (optional if already in `server.js`)
router.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true in production with HTTPS
  })
);

// Routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

export default router;

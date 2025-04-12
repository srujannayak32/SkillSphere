//routes/authRoutes.js
import express from 'express';

import {
  signup,
  verifyOtp,
  forgotPasswordController,
  resetPasswordController,
  loginUser,
  getDashboardData,
  logout // Import logout function here
} from '../controllers/authController.js';

const router = express.Router();

// Routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser); // 👈 Add this route
router.get("/dashboard", getDashboardData);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.post('/logout', logout); // Add the logout route

export default router;

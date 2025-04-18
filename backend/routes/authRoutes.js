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

import { protect } from '../middleware/authMiddleware.js'; // Import protect middleware

const router = express.Router();

// Routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser); // 👈 Add this route
router.get("/dashboard", getDashboardData);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.post('/logout', logout); // Add the logout route

// Add route to get authenticated user details
router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user);
});

export default router;

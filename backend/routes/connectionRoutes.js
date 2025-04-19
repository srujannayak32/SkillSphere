import express from 'express';
import {
  sendConnectionRequest,
  respondToConnection,
  getUserConnections,
  getPendingConnections,
  searchUsers
} from '../controllers/connectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/connect/:targetUserId', protect, sendConnectionRequest);
router.post('/respond/:targetUserId', protect, respondToConnection);
router.get('/all', protect, getUserConnections); // Ensure this route exists
router.get('/pending', protect, getPendingConnections);
router.get('/search', protect, searchUsers);

export default router;
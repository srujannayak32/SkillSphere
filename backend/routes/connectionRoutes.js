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

router.put('/messages/mark-seen/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    // Logic to mark messages as seen
    res.status(200).json({ message: "Messages marked as seen" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark messages as seen" });
  }
});

export default router;
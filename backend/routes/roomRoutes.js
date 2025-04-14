import express from 'express';
import { 
  createRoom,
  joinRoom,
  getRoom,
  updateParticipant,
  leaveRoom
} from '../controllers/roomController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new room
router.post('/', authMiddleware, createRoom);

// Join an existing room
router.post('/join', authMiddleware, joinRoom);

// Get room details
router.get('/:id', authMiddleware, getRoom);

// Update participant status
router.put('/participant', authMiddleware, updateParticipant);

// Leave room
router.post('/leave', authMiddleware, leaveRoom);

export default router;

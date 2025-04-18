import express from 'express';
import { createRoom, joinRoom, getRoom } from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createRoom); // Ensure this route exists
router.post('/join', protect, joinRoom);
router.get('/:id', protect, getRoom);

export default router;
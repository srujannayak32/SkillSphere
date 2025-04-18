import express from 'express';
import {
  sendConnectionRequest,
  respondToConnection,
  getUserConnections,
  getPendingConnections,
  searchUsers
} from '../controllers/connectionController.js';

const router = express.Router();

router.post('/connect/:targetUserId', sendConnectionRequest);
router.post('/respond/:targetUserId', respondToConnection);
router.get('/connections', getUserConnections);
router.get('/pending', getPendingConnections);
router.get('/search', searchUsers);

export default router;
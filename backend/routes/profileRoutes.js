import express from 'express';
import { 
  upsertProfile, 
  uploadAssets, 
  getProfile, 
  endorseSkill,
  getMatches,
  getMentorsBySkill,
  getUserStats // Import the new function
} from '../controllers/profileController.js';

const router = express.Router();

// Profile routes
router.post('/:userId/photo', uploadAssets, upsertProfile);
router.put('/:userId', upsertProfile);
router.get('/:userId', getProfile);
router.post('/endorse', endorseSkill);
router.get('/matches', getMatches);
router.get('/mentors/:skill', getMentorsBySkill);
router.get('/stats/user/:userId', getUserStats); // New route for user statistics

export default router;

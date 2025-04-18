// backend/routes/statsRoutes.js
import express from 'express';
import { getUserStats } from '../controllers/statsController.js';

const router = express.Router();

router.get('/', getUserStats);

export default router;
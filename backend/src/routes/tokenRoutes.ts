import express from 'express';
import {
  mintTokensForPoll,
  getVoterTokenStatus,
  getPollTokens,
  getMyTokens,
} from '../controllers/tokenController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Admin routes
router.post('/mint/:pollId', authenticate, mintTokensForPoll);
router.get('/poll/:pollId', authenticate, getPollTokens);

// Voter routes
router.get('/my-tokens', authenticate, getMyTokens);
router.get('/status/:pollId', authenticate, getVoterTokenStatus);

export default router;

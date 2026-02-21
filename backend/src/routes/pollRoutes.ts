import express from 'express';
import {
  createPoll,
  getAllPolls,
  getPollById,
  castVote,
  getPollResults,
  checkUserVote,
  verifyVoteOnBlockchain,
  getPollHistory,
  deletePoll,
  deleteClosedPoll,
} from '../controllers/pollController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createPoll);
router.get('/', getAllPolls);
router.get('/history/closed', getPollHistory);
router.get('/:id', getPollById);
router.get('/:id/vote-status', authenticate, checkUserVote);
router.post('/vote', authenticate, castVote);
router.get('/:id/results', getPollResults);
router.get('/verify/:signature', verifyVoteOnBlockchain);
router.delete('/:id', authenticate, deletePoll);
router.delete('/history/:id', authenticate, deleteClosedPoll);

export default router;

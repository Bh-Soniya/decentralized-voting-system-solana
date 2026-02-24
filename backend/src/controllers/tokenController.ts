import { Request, Response } from 'express';
import VotingToken from '../models/VotingToken';
import Voter from '../models/Voter';
import Poll from '../models/Poll';
import User from '../models/User';

// Mint tokens for a poll (Admin only)
export const mintTokensForPoll = async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;
    const adminId = (req as any).user.id;
    const adminRole = (req as any).user.role;

    // Check if user is admin
    if (adminRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can mint tokens' });
    }

    // Check if poll exists
    const poll = await Poll.findByPk(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Get all eligible voters
    const voters = await Voter.findAll({
      where: { isEligible: true },
    });

    if (voters.length === 0) {
      return res.status(400).json({ message: 'No eligible voters found' });
    }

    const mintedTokens = [];
    const errors = [];

    for (const voter of voters) {
      try {
        // Check if token already minted for this voter and poll
        const existingToken = await VotingToken.findOne({
          where: {
            voterId: voter.id,
            pollId: parseInt(pollId),
          },
        });

        if (existingToken) {
          errors.push({
            voterId: voter.voterId,
            message: 'Token already minted for this poll',
          });
          continue;
        }

        // Generate unique token ID
        const tokenId = `VT-${poll.pollId}-${voter.voterId}-${Date.now()}`;
        
        // Simulate blockchain transaction (in production, this would be actual Solana transaction)
        const mockTransactionSignature = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

        // Create token
        const token = await VotingToken.create({
          tokenId,
          voterId: voter.id,
          voterWalletAddress: voter.walletAddress,
          pollId: parseInt(pollId),
          status: 'minted',
          mintedBy: adminId,
          mintTransactionSignature: mockTransactionSignature,
          mintedAt: new Date(),
        });

        mintedTokens.push({
          tokenId: token.tokenId,
          voterId: voter.voterId,
          voterWallet: voter.walletAddress,
          transactionSignature: mockTransactionSignature,
        });
      } catch (error: any) {
        errors.push({
          voterId: voter.voterId,
          message: error.message,
        });
      }
    }

    res.status(200).json({
      message: 'Token minting completed',
      totalVoters: voters.length,
      successfulMints: mintedTokens.length,
      failedMints: errors.length,
      mintedTokens,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error minting tokens:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get token status for a voter and poll
export const getVoterTokenStatus = async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;
    const voterId = (req as any).user.id;
    const userRole = (req as any).user.role;

    if (userRole !== 'voter') {
      return res.status(403).json({ message: 'Only voters can check token status' });
    }

    const token = await VotingToken.findOne({
      where: {
        voterId,
        pollId: parseInt(pollId),
      },
      include: [
        {
          model: Poll,
          as: 'poll',
          attributes: ['title', 'pollId'],
        },
      ],
    });

    if (!token) {
      return res.status(404).json({ 
        message: 'No token found for this poll',
        hasToken: false,
      });
    }

    res.status(200).json({
      hasToken: true,
      tokenId: token.tokenId,
      status: token.status,
      canVote: token.status === 'minted',
      mintedAt: token.mintedAt,
      usedAt: token.usedAt,
      transactionSignature: token.mintTransactionSignature,
    });
  } catch (error: any) {
    console.error('Error checking token status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all tokens for a poll (Admin only)
export const getPollTokens = async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;
    const adminRole = (req as any).user.role;

    if (adminRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view poll tokens' });
    }

    const tokens = await VotingToken.findAll({
      where: { pollId: parseInt(pollId) },
      include: [
        {
          model: Voter,
          as: 'voter',
          attributes: ['voterId', 'username', 'email', 'walletAddress'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const summary = {
      total: tokens.length,
      minted: tokens.filter(t => t.status === 'minted').length,
      used: tokens.filter(t => t.status === 'used').length,
      collected: tokens.filter(t => t.status === 'collected').length,
    };

    res.status(200).json({
      summary,
      tokens,
    });
  } catch (error: any) {
    console.error('Error fetching poll tokens:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Collect token after voting (called internally after vote is cast)
export const collectToken = async (
  voterId: number,
  pollId: number,
  transactionSignature: string
): Promise<boolean> => {
  try {
    const token = await VotingToken.findOne({
      where: {
        voterId,
        pollId,
        status: 'minted',
      },
    });

    if (!token) {
      throw new Error('No valid token found for this voter and poll');
    }

    // Update token status
    token.status = 'collected';
    token.usedAt = new Date();
    token.transferTransactionSignature = transactionSignature;
    await token.save();

    return true;
  } catch (error) {
    console.error('Error collecting token:', error);
    return false;
  }
};

// Get voter's all tokens
export const getMyTokens = async (req: Request, res: Response) => {
  try {
    const voterId = (req as any).user.id;
    const userRole = (req as any).user.role;

    if (userRole !== 'voter') {
      return res.status(403).json({ message: 'Only voters can view their tokens' });
    }

    const tokens = await VotingToken.findAll({
      where: { voterId },
      include: [
        {
          model: Poll,
          as: 'poll',
          attributes: ['title', 'pollId', 'status', 'startTime', 'endTime'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      total: tokens.length,
      available: tokens.filter(t => t.status === 'minted').length,
      used: tokens.filter(t => t.status === 'collected').length,
      tokens,
    });
  } catch (error: any) {
    console.error('Error fetching voter tokens:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

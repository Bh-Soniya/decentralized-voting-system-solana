import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Voter from '../models/Voter';

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

export const register = async (req: Request, res: Response) => {
  try {
    const { role, username, email, password, walletAddress, citizenshipNumber, issueDate } = req.body;

    // Validate role
    if (!['admin', 'voter'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or voter.' });
    }

    // Validate password
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&#)' 
      });
    }

    // Validate wallet address
    if (!walletAddress || walletAddress.trim() === '') {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Check if wallet is already registered (in both tables)
    const existingUserWallet = await User.findOne({ where: { walletAddress } });
    const existingVoterWallet = await Voter.findOne({ where: { walletAddress } });
    
    if (existingUserWallet || existingVoterWallet) {
      return res.status(400).json({ message: 'Wallet address is already registered' });
    }

    // Check if email is already registered (in both tables)
    const existingUserEmail = await User.findOne({ where: { email } });
    const existingVoterEmail = await Voter.findOne({ where: { email } });
    
    if (existingUserEmail || existingVoterEmail) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    if (role === 'admin') {
      // Admin registration
      const user = await User.create({ 
        username, 
        email, 
        password, 
        walletAddress,
        role: 'admin'
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: 'admin' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          walletAddress: user.walletAddress,
          role: 'admin',
        },
      });
    } else {
      // Voter registration
      if (!citizenshipNumber || !issueDate) {
        return res.status(400).json({ message: 'Citizenship number and issue date are required for voters' });
      }

      // Validate citizenship number format
      if (!/^[0-9]{5,20}$/.test(citizenshipNumber)) {
        return res.status(400).json({ message: 'Citizenship number must be 5-20 digits' });
      }

      // Check if citizenship number is already registered
      const existingCitizenship = await Voter.findOne({ where: { citizenshipNumber } });
      if (existingCitizenship) {
        return res.status(400).json({ message: 'Citizenship number is already registered' });
      }

      const voter = await Voter.create({
        username,
        email,
        password,
        citizenshipNumber,
        issueDate,
        walletAddress,
        role: 'voter',
        isEligible: true,
      });

      const token = jwt.sign(
        { id: voter.id, email: voter.email, role: 'voter', voterId: voter.voterId },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: voter.id,
          voterId: voter.voterId,
          username: voter.username,
          email: voter.email,
          walletAddress: voter.walletAddress,
          role: 'voter',
          isEligible: voter.isEligible,
        },
        message: `Registration successful! Your Voter ID is: ${voter.voterId}. Please save it for login.`,
      });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { role, email, password, voterId, citizenshipNumber, issueDate } = req.body;

    // Validate role
    if (!['admin', 'voter'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or voter.' });
    }

    if (role === 'admin') {
      // Admin login
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: 'admin' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          walletAddress: user.walletAddress,
          role: 'admin',
        },
      });
    } else {
      // Voter login
      if (!voterId || !citizenshipNumber || !issueDate) {
        return res.status(400).json({ message: 'Voter ID, citizenship number, and issue date are required' });
      }

      const voter = await Voter.findOne({ where: { voterId } });
      if (!voter) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify citizenship number
      const isCitizenshipMatch = await voter.compareCitizenship(citizenshipNumber);
      if (!isCitizenshipMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify issue date
      const voterIssueDate = new Date(voter.issueDate).toISOString().split('T')[0];
      if (voterIssueDate !== issueDate) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: voter.id, email: voter.email, role: 'voter', voterId: voter.voterId },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: voter.id,
          voterId: voter.voterId,
          username: voter.username,
          email: voter.email,
          walletAddress: voter.walletAddress,
          role: 'voter',
          isEligible: voter.isEligible,
        },
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

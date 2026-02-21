import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import { formatLocalDateTime } from '../utils/dateUtils';

interface Option {
  id: number;
  optionText: string;
  optionIndex: number;
  description?: string;
  imageUrl?: string;
}

interface Poll {
  id: number;
  title: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  options: Option[];
}

interface Result {
  optionText: string;
  optionIndex: number;
  voteCount: number;
}

const PollDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const { publicKey, sendTransaction } = useWallet();
  const { token } = useAuth();

  useEffect(() => {
    fetchPoll();
    fetchResults();
    checkIfVoted();
  }, [id]);

  const checkIfVoted = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/polls/${id}/vote-status`);
      setHasVoted(response.data.hasVoted);
    } catch (error) {
      console.error('Error checking vote status');
      setHasVoted(false);
    }
  };

  const fetchPoll = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls/${id}`);
      setPoll(response.data.poll);
    } catch (error) {
      toast.error('Failed to fetch poll');
    }
  };

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls/${id}/results`);
      setResults(response.data.results);
    } catch (error) {
      console.error('Failed to fetch results');
    }
  };

  const handleVote = async () => {
    if (!token) {
      toast.error('Please login to vote');
      return;
    }

    if (!publicKey || !sendTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    if (selectedOption === null) {
      toast.error('Please select an option');
      return;
    }

    try {
      toast.info('Creating blockchain transaction...');
      
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // Create a memo transaction to record the vote on blockchain
      const voteData = JSON.stringify({
        pollId: id,
        optionIndex: selectedOption,
        timestamp: Date.now(),
        voter: publicKey.toString()
      });
      
      // Create a transaction with memo instruction
      const transaction = new Transaction();
      
      // Add memo instruction with vote data
      const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      const memoInstruction = {
        keys: [],
        programId: memoProgram,
        data: Buffer.from(voteData, 'utf8'),
      };
      
      transaction.add(memoInstruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      toast.info('Please approve the transaction in your wallet...');
      
      // Sign and send transaction
      const signature = await sendTransaction(transaction, connection);
      
      toast.info('Confirming transaction on blockchain...');
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Now send to backend with real transaction signature
      await axios.post(`${API_BASE_URL}/polls/vote`, {
        pollId: id,
        optionIndex: selectedOption,
        transactionSignature: signature,
        walletAddress: publicKey.toString(),
      });

      toast.success(`Vote cast successfully! Transaction: ${signature.slice(0, 8)}...`);
      setHasVoted(true);
      fetchResults();
    } catch (error: any) {
      console.error('Voting error:', error);
      toast.error(error.message || 'Failed to cast vote');
    }
  };

  const handleDeletePoll = async () => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/polls/${id}`);
      toast.success('Poll deleted successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete poll');
    }
  };

  const isPollDeletable = () => {
    if (!poll) return false;
    const now = new Date();
    const startTime = new Date(poll.startTime);
    return now < startTime && poll.status === 'pending';
  };

  if (!poll) {
    return <div className="loading">Loading poll...</div>;
  }

  const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

  return (
    <div className="poll-details">
      <div className="poll-header">
        <div>
          <h1>{poll.title}</h1>
          <span className={`status ${poll.status}`}>{poll.status}</span>
        </div>
        {isPollDeletable() && (
          <button onClick={handleDeletePoll} className="btn-delete">
            🗑️ Delete Poll
          </button>
        )}
      </div>

      <p className="poll-description">{poll.description}</p>

      <div className="poll-time">
        <p>Start: {formatLocalDateTime(poll.startTime)}</p>
        <p>End: {formatLocalDateTime(poll.endTime)}</p>
      </div>

      {!hasVoted && poll.status === 'active' && (
        <div className="voting-section">
          <h3>Cast Your Vote</h3>
          <div className="options">
            {poll.options.map((option) => (
              <div key={option.id} className="option-card-vote">
                <label className="option-label">
                  <input
                    type="radio"
                    name="vote"
                    value={option.optionIndex}
                    onChange={() => setSelectedOption(option.optionIndex)}
                  />
                  <div className="option-content">
                    {option.imageUrl && (
                      <div className="option-image">
                        <img src={option.imageUrl} alt={option.optionText} />
                      </div>
                    )}
                    <div className="option-info">
                      <h4>{option.optionText}</h4>
                      {option.description && (
                        <p className="option-description">{option.description}</p>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
          <button onClick={handleVote} className="btn-primary">
            Submit Vote
          </button>
        </div>
      )}

      <div className="results-section">
        <h3>Results ({totalVotes} votes)</h3>
        <div className="results">
          {results.map((result) => {
            const percentage = totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0;
            return (
              <div key={result.optionIndex} className="result-item">
                <div className="result-header">
                  <span>{result.optionText}</span>
                  <span>{result.voteCount} votes ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="blockchain-info">
          <h4>🔗 Blockchain Verification</h4>
          <p>All votes are recorded on Solana devnet blockchain for transparency and immutability.</p>
          <p>
            <strong>Network:</strong> Solana Devnet<br/>
            <strong>Explorer:</strong> <a href="https://explorer.solana.com/?cluster=devnet" target="_blank" rel="noopener noreferrer">
              View on Solana Explorer
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PollDetails;

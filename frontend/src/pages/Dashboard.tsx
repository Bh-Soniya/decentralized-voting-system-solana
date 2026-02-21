import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';
import { formatLocalDate } from '../utils/dateUtils';

interface Poll {
  id: number;
  title: string;
  description: string;
  status: string;
  startTime: string;
  createdAt: string;
}

interface Winner {
  optionText: string;
  optionIndex: number;
  description?: string;
  imageUrl?: string;
  voteCount: number;
}

interface HistoryItem {
  id: number;
  title: string;
  description: string;
  endTime: string;
  totalVotes: number;
  winners: Winner[];
  isTie: boolean;
}

const Dashboard: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'polls' | 'history'>('polls');
  const { user, updateWallet } = useAuth();
  const { publicKey } = useWallet();

  useEffect(() => {
    fetchUserPolls();
    fetchHistory();
  }, []);

  useEffect(() => {
    if (publicKey && (!user?.walletAddress || user.walletAddress !== publicKey.toString())) {
      handleUpdateWallet();
    }
  }, [publicKey]);

  const fetchUserPolls = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls`);
      // Filter out closed polls for the main view
      const activePolls = response.data.polls.filter((poll: Poll) => poll.status !== 'closed');
      setPolls(activePolls);
    } catch (error) {
      toast.error('Failed to fetch polls');
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls/history/closed`);
      setHistory(response.data.history);
    } catch (error) {
      console.error('Failed to fetch history');
    }
  };

  const handleDeletePoll = async (pollId: number) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/polls/${pollId}`);
      toast.success('Poll deleted successfully');
      fetchUserPolls();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete poll');
    }
  };

  const handleDeleteHistory = async (pollId: number) => {
    if (!window.confirm('Are you sure you want to delete this poll from history? This will permanently remove all votes and results. This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/polls/history/${pollId}`);
      toast.success('Poll deleted from history successfully');
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete poll from history');
    }
  };

  const handleUpdateWallet = async () => {
    if (publicKey) {
      try {
        await updateWallet(publicKey.toString());
        toast.success('Wallet connected successfully');
      } catch (error) {
        console.error('Failed to update wallet');
      }
    }
  };

  const isPollDeletable = (poll: Poll) => {
    const now = new Date();
    const startTime = new Date(poll.startTime);
    return now < startTime && poll.status === 'pending';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/create-poll" className="btn-primary">
          Create New Poll
        </Link>
      </div>

      <div className="user-info">
        <h3>Welcome, {user?.username}!</h3>
        {publicKey && (
          <p className="wallet-address">
            Wallet: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
          </p>
        )}
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'polls' ? 'active' : ''}`}
          onClick={() => setActiveTab('polls')}
        >
          Active Polls
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History ({history.length})
        </button>
      </div>

      {activeTab === 'polls' ? (
        <div className="polls-section">
          <h2>Active & Pending Polls</h2>
          <div className="polls-list">
            {polls.length === 0 ? (
              <p>No active polls found. Create your first poll!</p>
            ) : (
              polls.map((poll) => (
                <div key={poll.id} className="poll-item">
                  <div className="poll-info">
                    <h3>{poll.title}</h3>
                    <p>{poll.description}</p>
                    <span className={`status ${poll.status}`}>{poll.status}</span>
                  </div>
                  <div className="poll-actions">
                    <Link to={`/poll/${poll.id}`} className="btn-secondary">
                      View
                    </Link>
                    {isPollDeletable(poll) && (
                      <button
                        onClick={() => handleDeletePoll(poll.id)}
                        className="btn-delete"
                        title="Delete poll"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="history-section">
          <h2>Poll History</h2>
          <div className="history-list">
            {history.length === 0 ? (
              <p>No completed polls yet.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-header">
                    <div>
                      <h3>{item.title}</h3>
                      <p className="history-meta">
                        Ended: {formatLocalDate(item.endTime)} • {item.totalVotes} votes
                      </p>
                    </div>
                    <div className="history-actions">
                      <Link to={`/poll/${item.id}`} className="btn-secondary">
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="btn-delete"
                        title="Delete from history"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  <div className="winner-section">
                    {item.isTie ? (
                      <div className="tie-indicator">
                        <span className="trophy">🏆</span>
                        <h4>Tie - Multiple Winners!</h4>
                      </div>
                    ) : (
                      <div className="winner-indicator">
                        <span className="trophy">🏆</span>
                        <h4>Winner</h4>
                      </div>
                    )}

                    <div className="winners-list">
                      {item.winners.map((winner) => (
                        <div key={winner.optionIndex} className="winner-card">
                          {winner.imageUrl && (
                            <div className="winner-image">
                              <img src={winner.imageUrl} alt={winner.optionText} />
                            </div>
                          )}
                          <div className="winner-info">
                            <h5>{winner.optionText}</h5>
                            {winner.description && (
                              <p className="winner-description">{winner.description}</p>
                            )}
                            <p className="winner-votes">
                              {winner.voteCount} votes ({((winner.voteCount / item.totalVotes) * 100).toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

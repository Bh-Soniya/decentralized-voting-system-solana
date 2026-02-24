import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';
import '../styles/TokenManagement.css';

interface Poll {
  id: number;
  pollId: string;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface TokenSummary {
  total: number;
  minted: number;
  used: number;
  collected: number;
}

interface Token {
  id: number;
  tokenId: string;
  status: string;
  mintedAt: string;
  usedAt?: string;
  voter: {
    voterId: string;
    username: string;
    email: string;
    walletAddress: string;
  };
}

const TokenManagement: React.FC = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<number | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [summary, setSummary] = useState<TokenSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        toast.error('Only admins can access token management');
        navigate('/dashboard');
        return;
      }
    }
    fetchPolls();
  }, [navigate]);

  const fetchPolls = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/polls`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolls(response.data.polls);
    } catch (error: any) {
      toast.error('Failed to load polls');
    }
  };

  const fetchPollTokens = async (pollId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/tokens/poll/${pollId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTokens(response.data.tokens);
      setSummary(response.data.summary);
      setLoading(false);
    } catch (error: any) {
      toast.error('Failed to load tokens');
      setLoading(false);
    }
  };

  const handlePollSelect = (pollId: number) => {
    setSelectedPoll(pollId);
    fetchPollTokens(pollId);
  };

  const handleMintTokens = async () => {
    if (!selectedPoll) {
      toast.error('Please select a poll first');
      return;
    }

    if (!window.confirm('Are you sure you want to mint tokens for all eligible voters?')) {
      return;
    }

    try {
      setMinting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/tokens/mint/${selectedPoll}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        `Successfully minted ${response.data.successfulMints} tokens!`
      );
      
      if (response.data.failedMints > 0) {
        toast.warning(`${response.data.failedMints} tokens failed to mint`);
      }

      // Refresh token list
      fetchPollTokens(selectedPoll);
      setMinting(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mint tokens');
      setMinting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      minted: '#10B981',
      used: '#F59E0B',
      collected: '#EF4444',
    };
    return (
      <span
        style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: '600',
          background: colors[status as keyof typeof colors] || '#6B7280',
          color: 'white',
        }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="token-management-page">
      <div className="container">
        <div className="token-header">
          <h1>🪙 Token Management</h1>
          <p>Mint and manage voting tokens for polls</p>
        </div>

        <div className="token-content">
          <div className="poll-selector">
            <h2>Select Poll</h2>
            <div className="poll-list">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className={`poll-item-token ${selectedPoll === poll.id ? 'selected' : ''}`}
                  onClick={() => handlePollSelect(poll.id)}
                >
                  <div className="poll-info">
                    <h3>{poll.title}</h3>
                    <p className="poll-id">ID: {poll.pollId}</p>
                    <span className={`status status-${poll.status}`}>
                      {poll.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedPoll && (
            <div className="token-details">
              <div className="token-actions-header">
                <h2>Token Details</h2>
                <button
                  onClick={handleMintTokens}
                  disabled={minting}
                  className="btn-primary"
                >
                  {minting ? '⏳ Minting...' : '🪙 Mint Tokens for All Voters'}
                </button>
              </div>

              {summary && (
                <div className="token-summary">
                  <div className="summary-card">
                    <div className="summary-icon">📊</div>
                    <div className="summary-info">
                      <h3>{summary.total}</h3>
                      <p>Total Tokens</p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">✅</div>
                    <div className="summary-info">
                      <h3>{summary.minted}</h3>
                      <p>Available</p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">🗳️</div>
                    <div className="summary-info">
                      <h3>{summary.collected}</h3>
                      <p>Collected</p>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="loading">Loading tokens...</div>
              ) : (
                <div className="token-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Token ID</th>
                        <th>Voter ID</th>
                        <th>Voter Name</th>
                        <th>Wallet Address</th>
                        <th>Status</th>
                        <th>Minted At</th>
                        <th>Used At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map((token) => (
                        <tr key={token.id}>
                          <td className="token-id">{token.tokenId}</td>
                          <td>{token.voter.voterId}</td>
                          <td>{token.voter.username}</td>
                          <td className="wallet-addr">
                            {token.voter.walletAddress.substring(0, 8)}...
                            {token.voter.walletAddress.substring(token.voter.walletAddress.length - 6)}
                          </td>
                          <td>{getStatusBadge(token.status)}</td>
                          <td>{new Date(token.mintedAt).toLocaleString()}</td>
                          <td>
                            {token.usedAt
                              ? new Date(token.usedAt).toLocaleString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tokens.length === 0 && (
                    <div className="no-tokens">
                      <p>No tokens minted yet for this poll</p>
                      <p>Click "Mint Tokens" to create tokens for all eligible voters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!selectedPoll && (
            <div className="no-selection">
              <div className="no-selection-content">
                <span className="icon">🪙</span>
                <h3>Select a Poll</h3>
                <p>Choose a poll from the list to view and manage its voting tokens</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenManagement;

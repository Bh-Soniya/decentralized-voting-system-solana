import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';
import { formatLocalDate } from '../utils/dateUtils';

interface Poll {
  id: number;
  title: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
}

const Home: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'closed'>('active');

  useEffect(() => {
    fetchPolls();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls`);
      setPolls(response.data.polls);
    } catch (error) {
      toast.error('Failed to fetch polls');
    } finally {
      setLoading(false);
    }
  };

  const filteredPolls = polls.filter(poll => {
    if (activeTab === 'all') return true;
    return poll.status === activeTab;
  });

  const pollStats = {
    total: polls.length,
    active: polls.filter(p => p.status === 'active').length,
    closed: polls.filter(p => p.status === 'closed').length,
    pending: polls.filter(p => p.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading polls...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-enhanced">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🔗</span>
            <span>Powered by Solana Blockchain</span>
          </div>
          <h1 className="hero-title">
            Decentralized Voting
            <span className="gradient-text"> on Solana</span>
          </h1>
          <p className="hero-subtitle">
            Experience transparent, secure, and immutable voting powered by blockchain technology.
            Your vote matters, and blockchain ensures it counts.
          </p>
          
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Secure</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👁️</span>
              <span>Transparent</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Fast</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌐</span>
              <span>Decentralized</span>
            </div>
          </div>

          {(!user || user.role === 'admin') && (
            <div className="hero-actions">
              <Link to="/create-poll" className="btn-hero-primary">
                <span className="btn-icon">✨</span>
                Create Your Poll
              </Link>
              <Link to="/dashboard" className="btn-hero-secondary">
                <span className="btn-icon">📊</span>
                View Dashboard
              </Link>
            </div>
          )}

          {user && user.role === 'voter' && (
            <div className="hero-actions">
              <Link to="/dashboard" className="btn-hero-primary">
                <span className="btn-icon">🗳️</span>
                View Available Polls
              </Link>
            </div>
          )}
        </div>

        <div className="hero-decoration">
          <div className="floating-card card-1">
            <div className="card-icon">🗳️</div>
            <div className="card-text">Cast Vote</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">🔗</div>
            <div className="card-text">Blockchain</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">✅</div>
            <div className="card-text">Verified</div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{pollStats.total}</h3>
            <p>Total Polls</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{pollStats.active}</h3>
            <p>Active Polls</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏁</div>
          <div className="stat-info">
            <h3>{pollStats.closed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{pollStats.pending}</h3>
            <p>Upcoming</p>
          </div>
        </div>
      </div>

      {/* Polls Section */}
      <div className="polls-section-enhanced">
        <div className="section-header">
          <h2>Explore Polls</h2>
          <div className="filter-tabs">
            <button
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({pollStats.active})
            </button>
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({pollStats.total})
            </button>
            <button
              className={`tab-btn ${activeTab === 'closed' ? 'active' : ''}`}
              onClick={() => setActiveTab('closed')}
            >
              Closed ({pollStats.closed})
            </button>
          </div>
        </div>

        <div className="polls-grid-enhanced">
          {filteredPolls.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No {activeTab !== 'all' ? activeTab : ''} polls found</h3>
              <p>
                {activeTab === 'active' 
                  ? "There are no active polls at the moment. Check back later!"
                  : "Be the first to create a poll!"}
              </p>
              {(!user || user.role === 'admin') && (
                <Link to="/create-poll" className="btn-primary">
                  Create Poll
                </Link>
              )}
            </div>
          ) : (
            filteredPolls.map((poll) => (
              <div key={poll.id} className="poll-card-enhanced">
                <div className="poll-card-header">
                  <span className={`status-badge status-${poll.status}`}>
                    {poll.status === 'active' && '🟢'}
                    {poll.status === 'closed' && '🔴'}
                    {poll.status === 'pending' && '🟡'}
                    {poll.status}
                  </span>
                </div>
                <h3 className="poll-card-title">{poll.title}</h3>
                <p className="poll-card-description">{poll.description}</p>
                <div className="poll-card-footer">
                  <div className="poll-time-info">
                    <span className="time-icon">📅</span>
                    <span>Ends: {formatLocalDate(poll.endTime)}</span>
                  </div>
                  <Link to={`/poll/${poll.id}`} className="btn-view-poll">
                    View Poll →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Choose Blockchain Voting?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">🔐</div>
            <h3>Secure & Encrypted</h3>
            <p>Every vote is encrypted and secured using blockchain technology, ensuring data integrity.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">🌐</div>
            <h3>Transparent</h3>
            <p>All transactions are recorded on the blockchain, providing complete transparency and auditability.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">⚡</div>
            <h3>Fast & Efficient</h3>
            <p>Powered by Solana's high-speed blockchain, votes are processed in seconds.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">🎯</div>
            <h3>Immutable</h3>
            <p>Once cast, votes cannot be altered or deleted, ensuring election integrity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

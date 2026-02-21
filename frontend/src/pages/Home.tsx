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

  useEffect(() => {
    fetchPolls();
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

  if (loading) {
    return <div className="loading">Loading polls...</div>;
  }

  return (
    <div className="home">
      <div className="hero">
        <h1>Decentralized Voting on Solana</h1>
        <p>Transparent, secure, and immutable voting powered by blockchain technology</p>
        <Link to="/create-poll" className="btn-primary">
          Create Your Poll
        </Link>
      </div>

      <div className="polls-section">
        <h2>Active Polls</h2>
        <div className="polls-grid">
          {polls.length === 0 ? (
            <p>No polls available yet. Be the first to create one!</p>
          ) : (
            polls.map((poll) => (
              <div key={poll.id} className="poll-card">
                <h3>{poll.title}</h3>
                <p>{poll.description}</p>
                <div className="poll-meta">
                  <span className={`status ${poll.status}`}>{poll.status}</span>
                  <span>Ends: {formatLocalDate(poll.endTime)}</span>
                </div>
                <Link to={`/poll/${poll.id}`} className="btn-secondary">
                  View Details
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          🗳️ Block Vote
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/create-poll">Create Poll</Link>
              <Link to="/profile" className="profile-icon" title="Profile">
                👤
              </Link>
              <button onClick={logout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

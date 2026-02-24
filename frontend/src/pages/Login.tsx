import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/Auth.css';

type UserRole = 'admin' | 'voter';

const Login: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('voter');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Admin fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Voter fields
  const [voterId, setVoterId] = useState('');
  const [citizenshipNumber, setCitizenshipNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        role: userRole,
      };

      if (userRole === 'admin') {
        payload.email = email;
        payload.password = password;
      } else {
        payload.voterId = voterId;
        payload.citizenshipNumber = citizenshipNumber;
        payload.issueDate = issueDate;
      }

      const response = await axios.post(`${API_BASE_URL}/unified-auth/login`, payload);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Dispatch custom event to update navbar
        window.dispatchEvent(new Event('userLogin'));
        
        toast.success(`${userRole === 'admin' ? 'Admin' : 'Voter'} login successful!`);
        
        if (userRole === 'voter') {
          navigate('/voter/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🗳️ Login</h1>
          <p>Welcome back! Please login to continue</p>
        </div>

        {/* Role Selection */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn voter-role ${userRole === 'voter' ? 'active' : ''}`}
            onClick={() => setUserRole('voter')}
          >
            <span className="role-icon">🗳️</span>
            <span className="role-title">Voter</span>
            <span className="role-desc">Cast your vote</span>
          </button>
          <button
            type="button"
            className={`role-btn admin-role ${userRole === 'admin' ? 'active' : ''}`}
            onClick={() => setUserRole('admin')}
          >
            <span className="role-icon">👤</span>
            <span className="role-title">Admin</span>
            <span className="role-desc">Manage polls</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="auth-form">
          {userRole === 'admin' ? (
            <>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Voter ID</label>
                <input
                  type="text"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                  placeholder="VID-YYYYMMDD-XXXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label>Citizenship Number</label>
                <input
                  type="text"
                  value={citizenshipNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setCitizenshipNumber(value);
                  }}
                  placeholder="Enter citizenship number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Citizenship Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-submit">
            Login as {userRole === 'admin' ? 'Admin' : 'Voter'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="link-btn">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

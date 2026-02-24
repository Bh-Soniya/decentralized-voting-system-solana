import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/Auth.css';

type UserRole = 'admin' | 'voter';

const Register: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('voter');
  const [showPassword, setShowPassword] = useState(false);
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  // Common fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Voter fields
  const [citizenshipNumber, setCitizenshipNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');

  const validatePassword = (pwd: string) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecialChar = /[@$!%*?&#]/.test(pwd);
    const hasMinLength = pwd.length >= 8;

    if (!hasMinLength) return 'Password must be at least 8 characters long';
    if (!hasUpperCase) return 'Password must contain at least 1 uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least 1 lowercase letter';
    if (!hasNumber) return 'Password must contain at least 1 number';
    if (!hasSpecialChar) return 'Password must contain at least 1 special character (@$!%*?&#)';
    return '';
  };

  const getPasswordStrength = () => {
    return {
      minLength: password.length >= 8,
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&#]/.test(password),
    };
  };

  const [showVoterIdModal, setShowVoterIdModal] = useState(false);
  const [generatedVoterId, setGeneratedVoterId] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    try {
      const payload: any = {
        role: userRole,
        username,
        email,
        password,
        walletAddress: publicKey.toString(),
      };

      if (userRole === 'voter') {
        payload.citizenshipNumber = citizenshipNumber;
        payload.issueDate = issueDate;
      }

      const response = await axios.post(`${API_BASE_URL}/unified-auth/register`, payload);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Dispatch custom event to update navbar
        window.dispatchEvent(new Event('userLogin'));
        
        if (userRole === 'voter') {
          // Show custom modal instead of alert
          setGeneratedVoterId(response.data.user.voterId);
          setShowVoterIdModal(true);
        } else {
          toast.success('Admin registration successful!');
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleVoterIdModalClose = () => {
    setShowVoterIdModal(false);
    navigate('/voter/dashboard');
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🗳️ Register</h1>
          <p>Create your account to get started</p>
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
            <span className="role-desc">Create polls</span>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

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
                placeholder="Create a strong password"
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
            {password && (
              <div className="password-requirements">
                <p className="requirements-title">Password Requirements:</p>
                <ul>
                  <li className={strength.minLength ? 'valid' : 'invalid'}>
                    {strength.minLength ? '✓' : '✗'} At least 8 characters
                  </li>
                  <li className={strength.upperCase ? 'valid' : 'invalid'}>
                    {strength.upperCase ? '✓' : '✗'} 1 uppercase letter
                  </li>
                  <li className={strength.lowerCase ? 'valid' : 'invalid'}>
                    {strength.lowerCase ? '✓' : '✗'} 1 lowercase letter
                  </li>
                  <li className={strength.number ? 'valid' : 'invalid'}>
                    {strength.number ? '✓' : '✗'} 1 number
                  </li>
                  <li className={strength.specialChar ? 'valid' : 'invalid'}>
                    {strength.specialChar ? '✓' : '✗'} 1 special character (@$!%*?&#)
                  </li>
                </ul>
              </div>
            )}
          </div>

          {userRole === 'voter' && (
            <>
              <div className="form-group">
                <label>Citizenship Number</label>
                <input
                  type="text"
                  value={citizenshipNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setCitizenshipNumber(value);
                  }}
                  placeholder="Enter citizenship number (5-20 digits)"
                  required
                />
                <small className="form-hint">Numbers only, 5-20 digits</small>
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

          {publicKey ? (
            <div className="wallet-connected">
              <span className="wallet-icon">✅</span>
              <div>
                <p className="wallet-label">Wallet Connected</p>
                <p className="wallet-address">{publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}</p>
              </div>
            </div>
          ) : (
            <div className="wallet-warning">
              <span className="warning-icon">⚠️</span>
              <p>Please connect your Solana wallet to register</p>
            </div>
          )}

          <button type="submit" className="btn-submit">
            Register as {userRole === 'admin' ? 'Admin' : 'Voter'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link-btn">
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Custom Voter ID Modal */}
      {showVoterIdModal && (
        <div className="modal-overlay" onClick={handleVoterIdModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="success-icon">✅</div>
              <h2>Registration Successful!</h2>
            </div>
            <div className="modal-body">
              <p className="modal-message">Your account has been created successfully.</p>
              <div className="voter-id-box">
                <label>Your Voter ID:</label>
                <div className="voter-id-display">{generatedVoterId}</div>
                <button 
                  className="btn-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedVoterId);
                    toast.success('Voter ID copied to clipboard!');
                  }}
                >
                  📋 Copy Voter ID
                </button>
              </div>
              <div className="warning-box">
                <span className="warning-icon">⚠️</span>
                <p><strong>IMPORTANT:</strong> Please save this Voter ID. You will need it to login.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary btn-large" onClick={handleVoterIdModalClose}>
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;

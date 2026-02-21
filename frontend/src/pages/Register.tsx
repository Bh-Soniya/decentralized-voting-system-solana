import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { publicKey } = useWallet();
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pwd: string) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecialChar = /[@$!%*?&#]/.test(pwd);
    const hasMinLength = pwd.length >= 8;

    if (!hasMinLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least 1 uppercase letter';
    }
    if (!hasNumber) {
      return 'Password must contain at least 1 number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least 1 special character (@$!%*?&#)';
    }
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordError(validatePassword(pwd));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validatePassword(password);
    if (error) {
      setPasswordError(error);
      toast.error(error);
      return;
    }

    try {
      const walletAddress = publicKey?.toString();
      await register(username, email, password, walletAddress);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const getPasswordStrength = () => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&#]/.test(password);
    const hasMinLength = password.length >= 8;

    return {
      minLength: hasMinLength,
      upperCase: hasUpperCase,
      number: hasNumber,
      specialChar: hasSpecialChar,
    };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
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
                <p className="requirements-title">Password must contain:</p>
                <ul>
                  <li className={strength.minLength ? 'valid' : 'invalid'}>
                    {strength.minLength ? '✓' : '✗'} At least 8 characters
                  </li>
                  <li className={strength.upperCase ? 'valid' : 'invalid'}>
                    {strength.upperCase ? '✓' : '✗'} 1 uppercase letter
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
          {publicKey && (
            <div className="wallet-info">
              <p>Connected Wallet: {publicKey.toString().slice(0, 8)}...</p>
            </div>
          )}
          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

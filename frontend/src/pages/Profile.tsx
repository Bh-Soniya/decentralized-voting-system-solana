import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  walletAddress?: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { token } = useAuth();
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (publicKey) {
      setWalletAddress(publicKey.toString());
    }
  }, [publicKey]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data.user);
      setUsername(response.data.user.username);
      setWalletAddress(response.data.user.walletAddress || '');
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        { username, walletAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await axios.put(
        'http://localhost:5000/api/auth/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Password changed successfully!');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const getPasswordStrength = () => {
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[@$!%*?&#]/.test(newPassword);
    const hasMinLength = newPassword.length >= 8;

    return {
      minLength: hasMinLength,
      upperCase: hasUpperCase,
      number: hasNumber,
      specialChar: hasSpecialChar,
    };
  };

  const strength = getPasswordStrength();

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <div className="error">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profile-container">
        <h1>My Profile</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!isEditing && !isChangingPassword ? (
          <div className="profile-view">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                <h2>{profile.username}</h2>
              </div>

              <div className="profile-details">
                <div className="profile-field">
                  <label>Email</label>
                  <p>{profile.email}</p>
                </div>

                <div className="profile-field">
                  <label>Wallet Address</label>
                  <p className="wallet-address">
                    {profile.walletAddress || 'Not connected'}
                  </p>
                </div>

                <div className="profile-field">
                  <label>Member Since</label>
                  <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="btn-secondary"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        ) : isEditing ? (
          <div className="profile-edit">
            <form onSubmit={handleUpdate} className="profile-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (cannot be changed)</label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="walletAddress">Wallet Address</label>
                <input
                  type="text"
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Connect wallet or enter manually"
                />
                <small>
                  {publicKey
                    ? 'Wallet connected via Solana adapter'
                    : 'Connect your wallet or enter address manually'}
                </small>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setUsername(profile.username);
                    setWalletAddress(profile.walletAddress || '');
                    setError('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-edit">
            <form onSubmit={handleChangePassword} className="profile-form">
              <h3>Change Password</h3>

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {newPassword && (
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                    setError('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

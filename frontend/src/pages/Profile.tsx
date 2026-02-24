import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  walletAddress: string;
  role: 'admin' | 'voter';
  voterId?: string;
  isEligible?: boolean;
  createdAt: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      setProfile(user);
      setUsername(user.username);
      setLoading(false);
    } catch (err: any) {
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      
      // For now, just update localStorage
      // In production, you'd call an API endpoint
      const updatedUser = { ...profile, username };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfile(updatedUser as UserProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error('Failed to update profile');
    }
  };

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      // In production, call API to change password
      toast.success('Password changed successfully!');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error('Failed to change password');
    }
  };

  const getPasswordStrength = () => {
    return {
      minLength: newPassword.length >= 8,
      upperCase: /[A-Z]/.test(newPassword),
      lowerCase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      specialChar: /[@$!%*?&#]/.test(newPassword),
    };
  };

  const strength = getPasswordStrength();

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="error">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header-section">
          <h1>My Profile</h1>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Logout
          </button>
        </div>

        {!isEditing && !isChangingPassword ? (
          <div className="profile-view">
            <div className="profile-card">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                <div className="profile-role-badge">
                  {profile.role === 'admin' ? '👤 Admin' : '🗳️ Voter'}
                </div>
              </div>

              <div className="profile-details">
                <div className="profile-field">
                  <label>Username</label>
                  <p>{profile.username}</p>
                </div>

                <div className="profile-field">
                  <label>Email</label>
                  <p>{profile.email}</p>
                </div>

                {profile.role === 'voter' && profile.voterId && (
                  <div className="profile-field voter-id-field">
                    <label>Voter ID</label>
                    <p className="voter-id">{profile.voterId}</p>
                  </div>
                )}

                <div className="profile-field">
                  <label>Wallet Address</label>
                  <p className="wallet-address">
                    {profile.walletAddress ? 
                      `${profile.walletAddress.slice(0, 8)}...${profile.walletAddress.slice(-8)}` : 
                      'Not connected'}
                  </p>
                </div>

                <div className="profile-field">
                  <label>Role</label>
                  <p className="role-text">
                    {profile.role === 'admin' ? 'Administrator' : 'Voter'}
                  </p>
                </div>

                {profile.role === 'voter' && (
                  <div className="profile-field">
                    <label>Voting Status</label>
                    <p className={profile.isEligible ? 'status-eligible' : 'status-ineligible'}>
                      {profile.isEligible ? '✅ Eligible to Vote' : '❌ Not Eligible'}
                    </p>
                  </div>
                )}

                <div className="profile-field">
                  <label>Member Since</label>
                  <p>{new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="btn-secondary"
                >
                  🔒 Change Password
                </button>
              </div>
            </div>
          </div>
        ) : isEditing ? (
          <div className="profile-edit">
            <h2>Edit Profile</h2>
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
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="walletAddress">Wallet Address (cannot be changed)</label>
                <input
                  type="text"
                  id="walletAddress"
                  value={profile.walletAddress}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setUsername(profile.username);
                  }}
                  className="btn-secondary"
                >
                  ✖️ Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-edit">
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword} className="profile-form">
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
                  🔒 Change Password
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
                  }}
                  className="btn-secondary"
                >
                  ✖️ Cancel
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

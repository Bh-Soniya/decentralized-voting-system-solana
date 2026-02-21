import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

interface User {
  id: number;
  username: string;
  email: string;
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, walletAddress?: string) => Promise<void>;
  logout: () => void;
  updateWallet: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
  };

  const register = async (username: string, email: string, password: string, walletAddress?: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      username,
      email,
      password,
      walletAddress,
    });
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateWallet = async (walletAddress: string) => {
    await axios.put(`${API_BASE_URL}/auth/wallet`, { walletAddress });
    if (user) {
      setUser({ ...user, walletAddress });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateWallet }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

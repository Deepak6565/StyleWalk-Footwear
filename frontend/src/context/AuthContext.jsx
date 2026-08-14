import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_BASE = '/api/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('stylewalk_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('stylewalk_token') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('stylewalk_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE}/login`, { email, password });
    const { token: newToken, user: newUser } = res.data;

    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('stylewalk_token', newToken);
    localStorage.setItem('stylewalk_user', JSON.stringify(newUser));
    return newUser;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API_BASE}/register`, { name, email, password });
    const { token: newToken, user: newUser } = res.data;

    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('stylewalk_token', newToken);
    localStorage.setItem('stylewalk_user', JSON.stringify(newUser));
    return newUser;
  };

  const setAuthSession = (newUser, newToken) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('stylewalk_token', newToken);
    localStorage.setItem('stylewalk_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('stylewalk_token');
    localStorage.removeItem('stylewalk_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setAuthSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

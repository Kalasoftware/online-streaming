import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:4000/api/auth/me', {
        headers: { Authorization: 'Bearer ' + token }
      }).then(res => {
        setUser(res.data);
        window.localStorage.setItem('user', JSON.stringify(res.data));
      }).catch(() => setUser(null)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Add a refreshUser method for dynamic updates
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const res = await axios.get('http://localhost:4000/api/auth/me', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setUser(res.data);
      window.localStorage.setItem('user', JSON.stringify(res.data));
    }
  };

  const login = (userObj) => {
    setUser(userObj);
    window.localStorage.setItem('user', JSON.stringify(userObj));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

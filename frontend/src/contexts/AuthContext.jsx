import React, { createContext, useContext, useState } from 'react';
import { db } from '../data/dbStore';
import { api } from '../services/api';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'jobflow_user_session';
const TOKEN_STORAGE_KEY = 'jobflow_jwt_token';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const saveUserSession = (user, token = null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  /**
   * Connected to Spring Boot AuthController
   * Endpoint: POST /api/auth/login
   * Body: { email, password }
   */
  const login = async (email, password) => {
    const authData = await api.auth.login(email, password);
    const userData = authData?.user || authData;
    const token = authData?.token || null;
    saveUserSession(userData, token);
    return userData;
  };

  /**
   * Connected to Spring Boot AuthController
   * Endpoint: POST /api/auth/register
   * Body: { name, email, password, role, companyName }
   */
  const signup = async ({ name, email, password, role = 'CANDIDATE', company_name = '' }) => {
    const authData = await api.auth.register({
      name,
      email,
      password,
      role,
      companyName: company_name
    });
    const newUser = {
      ...(authData?.user || authData),
      companyName: company_name
    };
    const token = authData?.token || null;
    saveUserSession(newUser, token);
    return newUser;
  };

  const updateCurrentUserSession = (partialUser) => {
    if (!currentUser) return;
    const merged = { ...currentUser, ...partialUser };
    setCurrentUser(merged);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
  };

  const logout = () => {
    saveUserSession(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, updateCurrentUserSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

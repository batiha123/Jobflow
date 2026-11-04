import React, { createContext, useContext, useState } from 'react';
import { db } from '../data/dbStore';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'jobflow_user_session';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const saveUserSession = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  /**
   * TODO (Team): Connect to Spring Boot AuthController
   * Endpoint: POST /api/auth/login
   * Body: { email, password }
   */
  const login = async (email, password) => {
    console.log('[AuthContext] login placeholder called with:', { email });
    // Local mock authentication: match existing user or generate session
    const users = db.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const userData = existing || {
      id: Date.now(),
      name: email.split('@')[0],
      email: email,
      role: email.includes('admin') ? 'ADMIN' : email.includes('company') || email.includes('novatech') ? 'COMPANY' : 'CANDIDATE'
    };
    saveUserSession(userData);
    return userData;
  };

  /**
   * TODO (Team): Connect to Spring Boot AuthController
   * Endpoint: POST /api/auth/register
   * Body: { name, email, password, role, companyName }
   */
  const signup = async ({ name, email, password, role = 'CANDIDATE', company_name = '' }) => {
    console.log('[AuthContext] signup placeholder called with:', { name, email, role, company_name });
    // Local mock registration:
    const newUser = {
      id: Date.now(),
      name,
      email,
      role,
      companyName: company_name
    };
    saveUserSession(newUser);
    return newUser;
  };

  const logout = () => {
    saveUserSession(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
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

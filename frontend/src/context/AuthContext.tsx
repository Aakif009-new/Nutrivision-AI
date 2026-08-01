'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (username: string, email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER = { id: 'mock-user-id', email: 'jordan@example.com' };
const MOCK_PROFILE: UserProfile = {
  id: 'mock-user-id',
  username: 'Jordan',
  email: 'jordan@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage to persist state across reloads
    const savedUser = sessionStorage.getItem('mock_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setProfile(MOCK_PROFILE);
    } else {
      // Default to logged-in user to bypass authentication completely per user request
      setUser(MOCK_USER);
      setProfile(MOCK_PROFILE);
      sessionStorage.setItem('mock_user', JSON.stringify(MOCK_USER));
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    const mockUser = { id: 'mock-user-id', email: email || 'jordan@example.com' };
    setUser(mockUser);
    setProfile({
      ...MOCK_PROFILE,
      email: email || 'jordan@example.com',
    });
    sessionStorage.setItem('mock_user', JSON.stringify(mockUser));
    setLoading(false);
  };

  const register = async (username: string, email: string) => {
    setLoading(true);
    const mockUser = { id: 'mock-user-id', email: email || 'jordan@example.com' };
    setUser(mockUser);
    setProfile({
      id: 'mock-user-id',
      username: username || 'Jordan',
      email: email || 'jordan@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    sessionStorage.setItem('mock_user', JSON.stringify(mockUser));
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    setUser(null);
    setProfile(null);
    sessionStorage.removeItem('mock_user');
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

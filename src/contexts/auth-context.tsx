
'use client';

import type { Player } from '@/lib/types';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockPlayers } from '@/lib/data'; // Using mockPlayers for now
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: Player | null;
  setCurrentUser: Dispatch<SetStateAction<Player | null>>;
  login: (email: string, pass: string) => Promise<boolean>; // Simulate async login
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<boolean>; // Simulate async registration
  loginWithGoogle: () => Promise<boolean>; // Simulate async Google login
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true); // To handle initial state check
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for an existing session (e.g., from localStorage)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockPlayers.find(p => p.email === email); // Simple mock lookup
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setLoading(false);
      router.push('/');
      return true;
    }
    setLoading(false);
    return false;
  };

  const register = async (name: string, email: string, _pass: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call & user creation
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingUser = mockPlayers.find(p => p.email === email);
    if (existingUser) {
      setLoading(false);
      return false; // User already exists
    }
    const newUser: Player = {
      id: String(mockPlayers.length + 1),
      name,
      email,
      avatarUrl: `https://placehold.co/100x100.png?text=${name.substring(0,1)}`,
      gamePreferences: [],
      availability: 'Non spécifiée',
    };
    // In a real app, you'd add this to your user database. Here, we're just setting it.
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setLoading(false);
    router.push('/');
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    // Simulate API call to Google
    await new Promise(resolve => setTimeout(resolve, 700));
    // For simulation, let's log in Alice or a generic Google user
    const googleUser = mockPlayers.find(p => p.email === 'alice@example.com') || mockPlayers[0]; 
    if (googleUser) {
      setCurrentUser(googleUser);
      localStorage.setItem('currentUser', JSON.stringify(googleUser));
      setLoading(false);
      router.push('/');
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout, register, loginWithGoogle, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

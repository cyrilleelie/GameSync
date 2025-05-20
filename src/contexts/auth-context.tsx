
'use client';

import type { Player } from '@/lib/types';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockPlayers } from '@/lib/data'; 
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: Player | null;
  setCurrentUser: Dispatch<SetStateAction<Player | null>>;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithFacebook: () => Promise<boolean>;
  updateUserProfile: (updatedData: Partial<Player>) => Promise<boolean>; // Nouvelle fonction
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockPlayers.find(p => p.email === email);
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
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingUser = mockPlayers.find(p => p.email === email);
    if (existingUser) {
      setLoading(false);
      return false; 
    }
    const newUser: Player = {
      id: String(mockPlayers.length + 1), // Attention : ceci n'est pas robuste pour une vraie BDD
      name,
      email,
      avatarUrl: `https://placehold.co/100x100.png?text=${name.substring(0,1).toUpperCase()}`,
      gamePreferences: [],
      availability: 'Non spécifiée',
    };
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setLoading(false);
    router.push('/');
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700));
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

  const loginWithFacebook = async (): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    const facebookUser = mockPlayers.find(p => p.email === 'bob@example.com') || mockPlayers[1] || mockPlayers[0];
    if (facebookUser) {
      setCurrentUser(facebookUser);
      localStorage.setItem('currentUser', JSON.stringify(facebookUser));
      setLoading(false);
      router.push('/');
      return true;
    }
    setLoading(false);
    return false;
  };

  const updateUserProfile = async (updatedData: Partial<Player>): Promise<boolean> => {
    if (!currentUser) return false;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Simulate updating in mockPlayers array if needed for other parts of the app (though not ideal for true persistence)
    const userIndex = mockPlayers.findIndex(p => p.id === currentUser.id);
    if (userIndex > -1) {
      mockPlayers[userIndex] = updatedUser;
    }

    setLoading(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout, register, loginWithGoogle, loginWithFacebook, updateUserProfile, loading }}>
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

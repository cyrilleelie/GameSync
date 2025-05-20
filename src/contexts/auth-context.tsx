
'use client';

import type { Player, UserRole } from '@/lib/types'; // Import UserRole
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
  updateUserProfile: (updatedData: Partial<Player>) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser: Player = JSON.parse(storedUser);
        // Ensure role is present, default to 'Joueur' if missing (for backward compatibility with old stored users)
        if (!parsedUser.role) {
          parsedUser.role = 'Joueur';
        }
        setCurrentUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser'); // Clear corrupted data
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockPlayers.find(p => p.email === email);
    if (user) {
      // Ensure role is present from mockPlayers, default if somehow missing
      const userWithRole: Player = { ...user, role: user.role || 'Joueur' };
      setCurrentUser(userWithRole);
      localStorage.setItem('currentUser', JSON.stringify(userWithRole));
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
      id: String(mockPlayers.length + 1 + Date.now()), // More unique ID for mock
      name,
      email,
      avatarUrl: `https://placehold.co/100x100.png?text=${name.substring(0,1).toUpperCase()}`,
      gamePreferences: [],
      availability: 'Non spécifiée',
      role: 'Joueur', // Default role for new users
    };
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    // Optionally, add to mockPlayers in memory if other parts of the app read from it directly
    // mockPlayers.push(newUser); 
    setLoading(false);
    router.push('/');
    return true;
  };

  const loginWithProvider = async (userEmail: string, defaultRole: UserRole = 'Joueur'): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    let user = mockPlayers.find(p => p.email === userEmail);
    
    if (user) {
      const userWithRole: Player = { ...user, role: user.role || defaultRole };
      setCurrentUser(userWithRole);
      localStorage.setItem('currentUser', JSON.stringify(userWithRole));
    } else {
      // If user not in mock, create a new one for simulation
      const nameFromEmail = userEmail.split('@')[0];
      const newUser: Player = {
        id: String(mockPlayers.length + 1 + Date.now()),
        name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        email: userEmail,
        avatarUrl: `https://placehold.co/100x100.png?text=${nameFromEmail.substring(0,1).toUpperCase()}`,
        gamePreferences: [],
        availability: 'Non spécifiée',
        role: defaultRole,
      };
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      // mockPlayers.push(newUser); // Optionally add to in-memory mock
    }
    setLoading(false);
    router.push('/');
    return true;
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    return loginWithProvider('alice@example.com', 'Administrateur'); // Alice is admin
  };

  const loginWithFacebook = async (): Promise<boolean> => {
    return loginWithProvider('bob@example.com'); // Bob is Joueur
  };

  const updateUserProfile = async (updatedData: Partial<Player>): Promise<boolean> => {
    if (!currentUser) return false;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ensure role is not accidentally removed or changed by updatedData unless explicitly included
    const updatedUser: Player = { 
      ...currentUser, 
      ...updatedData,
      role: updatedData.role || currentUser.role, // Preserve existing role if not in updatedData
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    const userIndex = mockPlayers.findIndex(p => p.id === currentUser.id);
    if (userIndex > -1) {
      mockPlayers[userIndex] = updatedUser;
    }

    setLoading(false);
    return true;
  };

  const logout = () => {
    setLoading(true);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setLoading(false);
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

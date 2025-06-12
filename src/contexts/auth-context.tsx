'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, User, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Player } from '@/lib/types';

export type AuthUser = User;

interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: Player | null; // Profil de la base de données
  loading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  updateUserProfileData: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as Player);
        } else {
            try {
                const newProfileData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    createdAt: serverTimestamp(),
                    bio: '',
                    gamePreferences: [],
                    ownedGames: [],
                    wishlist: [],
                    availability: '',
                };
                await setDoc(userDocRef, newProfileData);
                setUserProfile(newProfileData as Player);
            } catch (error) {
                console.error("Erreur lors de la création du profil utilisateur:", error);
            }
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (user: User) => {
    router.push('/');
    return true;
  };

  const handleAuthError = (error: any, providerName: string) => {
    console.error(`Erreur de connexion ${providerName}:`, error);
    toast({ title: "Échec de la connexion", description: "Une erreur est survenue.", variant: "destructive" });
    return false;
  };
  
  const updateUserProfileData = async (data: { displayName?: string; photoURL?: string }) => {
    if (auth.currentUser) {
        try {
            await updateProfile(auth.currentUser, data);
            setCurrentUser(Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser));
            // Mettre à jour également le profil Firestore si nécessaire
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userDocRef, { displayName: data.displayName, photoURL: data.photoURL }, { merge: true });

            toast({ title: "Profil d'authentification mis à jour." });
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
            throw error;
        }
    } else {
        throw new Error("Aucun utilisateur n'est connecté.");
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return handleAuthSuccess(result.user);
    } catch (error) {
      return handleAuthError(error, 'Google');
    }
  };

  const logout = async () => {
    await signOut(auth);
    toast({ title: "Déconnexion", description: "Vous avez été déconnecté." });
    router.push('/login');
  };

  const value = { currentUser, userProfile, loading, loginWithGoogle, updateUserProfileData, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
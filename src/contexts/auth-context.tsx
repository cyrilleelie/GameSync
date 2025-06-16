'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, User, updateProfile, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Player } from '@/lib/types';

export type AuthUser = User;

interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: Player | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithFacebook: () => Promise<boolean>;
  updateUserProfileData: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchAndSetUserProfile = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setUserProfile({ uid: user.uid, ...userDocSnap.data() } as Player);
    } else {
      try {
        const newProfileData: Omit<Player, 'id'> = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Nouveau Joueur',
          photoURL: user.photoURL,
          role: 'Utilisateur',
          createdAt: new Date(),
          bio: '',
          gamePreferences: [],
          ownedGames: [],
          wishlist: [],
          availability: '',
        };
        await setDoc(userDocRef, { ...newProfileData, createdAt: serverTimestamp() });
        setUserProfile(newProfileData as Player);
      } catch (error) { console.error("Erreur création profil:", error); }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchAndSetUserProfile(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      await fetchAndSetUserProfile(auth.currentUser);
    }
  };

  const handleAuthSuccess = (user: User) => {
    router.push('/');
    return true;
  };

  const handleAuthError = (error: any) => {
    let message = "Une erreur est survenue.";
    if (error.code === 'auth/email-already-in-use') {
        message = "Cet email est déjà utilisé par un autre compte.";
    }
    console.error("Erreur Auth:", error);
    toast({ title: "Échec", description: message, variant: "destructive" });
    return false;
  };

  const updateUserProfileData = async (data: { displayName?: string; photoURL?: string }) => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, data);
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, { displayName: data.displayName, photoURL: data.photoURL }, { merge: true });
        await refreshUserProfile();
        toast({ title: "Profil mis à jour." });
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
      return handleAuthError(error);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // Le onAuthStateChanged s'occupera de créer le profil Firestore.
      toast({ title: "Compte créé !", description: `Bienvenue sur GameSync, ${name} !` });
      return handleAuthSuccess(userCredential.user);
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const login = async (): Promise<boolean> => {
    toast({ title: "Non implémenté", description: "La connexion par email et mot de passe n'est pas encore disponible." });
    return false;
  };

  const loginWithFacebook = async (): Promise<boolean> => {
    toast({ title: "Non implémenté", description: "La connexion avec Facebook a été mise de côté pour le moment." });
    return false;
  };

  const logout = async () => {
    try {
        await signOut(auth);
        toast({ title: "Déconnexion réussie" });
        router.push('/login');
    } catch(error) {
        toast({ title: "Erreur de déconnexion", variant: "destructive" });
    }
  };

  const value = { currentUser, userProfile, loading, register, login, loginWithGoogle, loginWithFacebook, updateUserProfileData, logout, refreshUserProfile };

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
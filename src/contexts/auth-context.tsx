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
  userProfile: Player | null;
  loading: boolean;
  loginWithGoogle: () => Promise<boolean>;
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
      setUserProfile(userDocSnap.data() as Player);
    } else {
      // Le profil n'existe pas, on le crée (cas d'une toute première connexion)
      try {
        const newProfileData: Player = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email || 'Nouveau Joueur',
          photoURL: user.photoURL || '',
          createdAt: new Date(), // On utilise un objet Date ici, il sera converti par Firestore
          role: 'Utilisateur',
          bio: '',
        	gamePreferences: [],
        	ownedGames: [],
        	wishlist: [],
        	availability: '',
        };
        await setDoc(userDocRef, {
            ...newProfileData,
            createdAt: serverTimestamp() // On envoie la version serveur à Firestore
        });
        setUserProfile(newProfileData);
      } catch (error) {
        console.error("Erreur lors de la création du profil utilisateur:", error);
      }
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
      console.log("Rafraîchissement du profil utilisateur...");
      await fetchAndSetUserProfile(auth.currentUser);
      toast({ title: "Profil synchronisé", duration: 2000 });
    }
  };

  const handleAuthSuccess = (user: User) => {
    toast({ title: "Connexion réussie", description: `Bienvenue, ${user.displayName || user.email} !` });
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
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, { displayName: data.displayName, photoURL: data.photoURL }, { merge: true });
        await refreshUserProfile(); // On rafraîchit le profil local après la mise à jour
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

  const value = { currentUser, userProfile, loading, loginWithGoogle, updateUserProfileData, logout, refreshUserProfile };

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
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, fetchSignInMethodsForEmail, linkWithCredential, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export type AuthUser = User;

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithFacebook: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const loginWithGoogle = async (): Promise<boolean> => {
    console.log("AuthContext: Tentative de connexion Google...");
    const provider = new GoogleAuthProvider();
    try {
      console.log("AuthContext: Appel de signInWithPopup...");
      const result = await signInWithPopup(auth, provider);
      console.log("AuthContext: signInWithPopup a RÉUSSI. Utilisateur:", result.user.displayName);
      return handleAuthSuccess(result.user);
    } catch (error) {
      console.error("AuthContext: signInWithPopup a ÉCHOUÉ. Erreur attrapée:", error);
      return handleAuthError(error, 'Google');
    }
  };

  const loginWithFacebook = async (): Promise<boolean> => {
    console.log("AuthContext: Tentative de connexion Facebook...");
    const provider = new FacebookAuthProvider();
    try {
      console.log("AuthContext: Appel de signInWithPopup...");
      const result = await signInWithPopup(auth, provider);
      console.log("AuthContext: signInWithPopup a RÉUSSI. Utilisateur:", result.user.displayName);
      return handleAuthSuccess(result.user);
    } catch (error: any) {
        if (error.code === 'auth/account-exists-with-different-credential') {
            const email = error.customData?.email;
            if (!email) return handleAuthError(error, 'Facebook');
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods[0] === 'google.com') {
                toast({ title: 'Compte existant détecté', description: "Veuillez vous connecter avec Google pour lier votre compte Facebook.", duration: 7000 });
                const googleProvider = new GoogleAuthProvider();
                try {
                    const googleResult = await signInWithPopup(auth, googleProvider);
                    const facebookCredential = FacebookAuthProvider.credentialFromError(error);
                    if (facebookCredential) {
                        await linkWithCredential(googleResult.user, facebookCredential);
                        return handleAuthSuccess(googleResult.user);
                    }
                } catch (linkError) {
                    return handleAuthError(linkError, 'Google (liaison)');
                }
            }
            return false;
        } else {
            return handleAuthError(error, 'Facebook');
        }
    }
  };

  const logout = async () => {
    await signOut(auth);
    toast({ title: "Déconnexion", description: "Vous avez été déconnecté." });
    router.push('/login');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    toast({ title: "Fonctionnalité non implémentée", description: "La connexion par email arrive bientôt." });
    return false;
  };

  const value = { currentUser, loading, login, loginWithGoogle, loginWithFacebook, logout };

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
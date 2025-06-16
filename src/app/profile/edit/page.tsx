// Fichier : src/app/profile/edit/page.tsx (FINAL ET SYNCHRONISÉ)

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import type { Player } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import EditProfileForm from '@/components/profile/edit-profile-form';

export default function EditProfilePage() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Player | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Le userProfile du contexte est la source la plus fiable
    if (userProfile) {
      setProfile(userProfile);
      setLoadingProfile(false);
    } else {
      // Sécurité : si le contexte n'est pas encore prêt, on va chercher manuellement
      const fetchUserProfile = async () => {
        setLoadingProfile(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as Player);
        } else {
          // Si aucun profil n'existe, on ne peut rien éditer
          router.push('/profile'); 
        }
        setLoadingProfile(false);
      };
      fetchUserProfile();
    }
  }, [currentUser, userProfile, authLoading, router]);

  const handleCancel = () => {
    router.push('/profile');
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <p className="container mx-auto py-8">Impossible de charger le profil à modifier.</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Modifier Mon Profil</CardTitle>
          <CardDescription>Mettez à jour vos informations personnelles et vos préférences de jeu.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <EditProfileForm 
            userProfile={profile} 
            onCancel={handleCancel} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
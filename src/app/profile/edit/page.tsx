// Fichier : src/app/profile/edit/page.tsx (VERSION CORRECTE)

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
import { EditProfileForm } from '@/components/profile/edit-profile-form';

export default function EditProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter(); // On récupère le routeur pour la navigation
  
  const [profile, setProfile] = useState<Player | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      setLoadingProfile(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const serializableProfile = {
          ...data,
          createdAt: data.createdAt?.toDate().toISOString(),
        } as Player;
        setProfile(serializableProfile);
      } else {
        router.push('/profile');
      }
      setLoadingProfile(false);
    };

    fetchUserProfile();
  }, [currentUser, authLoading, router]);


  // === LA FONCTION POUR GÉRER L'ANNULATION ===
  const handleCancel = () => {
    // On utilise le routeur pour retourner à la page de profil
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
          {/* On passe la fonction handleCancel au formulaire via la prop onCancel */}
          <EditProfileForm 
            userProfile={profile} 
            onCancel={handleCancel} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
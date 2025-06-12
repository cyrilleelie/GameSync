// Fichier : src/app/profile/edit/page.tsx

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
import { EditProfileForm } from '@/components/profile/edit-profile-form'; // On importe notre futur formulaire

export default function EditProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
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
        setProfile(docSnap.data() as Player);
      } else {
        console.error("Aucun profil trouvé à modifier.");
        router.push('/profile'); // Redirige si pas de profil
      }
      setLoadingProfile(false);
    };

    fetchUserProfile();
  }, [currentUser, authLoading, router]);

  if (authLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <p>Impossible de charger le profil à modifier.</p>;
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
          {/* On passe le profil chargé au composant de formulaire */}
          <EditProfileForm userProfile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
// Fichier : src/app/profile/page.tsx (VERSION FINALE AVEC SÉRIALISATION)

'use client';

// ... (vos imports restent les mêmes)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserProfileDisplay } from '@/components/profile/user-profile-display';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Player } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Player | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setLoadingProfile(false);
      return;
    }

    const fetchUserProfile = async () => {
      if (!currentUser) return;
      setLoadingProfile(true);
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // === LA CORRECTION EST ICI ===
          // On convertit les données non-sériables AVANT de les mettre dans l'état.
          const serializableProfile = {
            ...data,
            // On transforme le Timestamp en une chaîne de caractères (format ISO)
            createdAt: data.createdAt?.toDate().toISOString(),
          } as Player;
          
          setProfile(serializableProfile);

        } else {
          console.error("Aucun profil trouvé pour cet utilisateur.");
          setProfile(null);
        }
      } catch (error) {
        console.error("Erreur de récupération du profil:", error);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchUserProfile();
  }, [currentUser, authLoading]);

  // Le reste du fichier est identique

  if (authLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center min-h-[calc(100vh-8rem)]">
        <p className="text-xl mb-4">Veuillez vous connecter pour voir votre profil.</p>
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Mon Profil</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <UserProfileDisplay user={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
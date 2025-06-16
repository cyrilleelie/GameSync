// Fichier : src/app/my-games/page.tsx (CONNECTÉ À FIREBASE)

'use client';

import { useState, useMemo, useEffect } from 'react';
import type { BoardGame } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Imports Firebase
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

// Imports UI
import { GameCard } from '@/components/games/game-card';
import { Button } from '@/components/ui/button';
import { Archive, Loader2, Frown } from 'lucide-react';

export default function MyGamesPage() {
  const { userProfile, loading: authLoading } = useAuth(); // On utilise userProfile
  const router = useRouter();
  
  // === NOUVEAUX ÉTATS POUR GÉRER LES DONNÉES DE FIREBASE ===
  const [allGames, setAllGames] = useState<BoardGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // === CHARGEMENT DES JEUX DEPUIS FIREBASE ===
  useEffect(() => {
    // Cette fonction sera utilisée pour charger TOUS les jeux une seule fois.
    const fetchAllGames = async () => {
      setIsLoading(true);
      try {
        const gamesRef = collection(db, "games");
        const q = query(gamesRef, orderBy("name"));
        const querySnapshot = await getDocs(q);
        const gamesFromDb = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BoardGame[];
        setAllGames(gamesFromDb);
      } catch (error) {
        console.error("Erreur de chargement de la bibliothèque de jeux:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllGames();
  }, []);


  useEffect(() => {
    if (isMounted && !authLoading && !userProfile) {
      router.push('/login');
    }
  }, [userProfile, authLoading, router, isMounted]);

  
  // === LA LOGIQUE DE FILTRAGE EST MISE À JOUR ===
  // Elle utilise maintenant le userProfile et la liste des jeux de Firebase
  const ownedGamesList = useMemo(() => {
    if (!userProfile || !userProfile.ownedGames || userProfile.ownedGames.length === 0) {
      return [];
    }
    // On filtre la liste complète des jeux pour ne garder que ceux dont le nom est dans notre profil
    return allGames.filter(game => userProfile.ownedGames!.includes(game.name));
  }, [userProfile, allGames]);

  // La condition de chargement prend en compte l'authentification ET le chargement des jeux
  if (!isMounted || authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // TOUT LE JSX EST CONSERVÉ À L'IDENTIQUE
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Archive className="h-8 w-8 text-primary" />
            Mes Jeux
          </h1>
          <p className="text-muted-foreground">Votre collection personnelle de jeux de société.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/profile/edit">Gérer ma collection</Link>
        </Button>
      </div>

      {ownedGamesList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ownedGamesList.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              showCreateSessionButton={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center">
          <Frown className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">
            Vous n'avez pas encore de jeux dans votre collection.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Ajoutez des jeux à votre profil ou parcourez tous les jeux disponibles.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/profile/edit">Ajouter des jeux à ma collection</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/games">Parcourir tous les jeux</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
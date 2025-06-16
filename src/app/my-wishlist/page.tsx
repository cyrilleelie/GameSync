// Fichier : src/app/my-wishlist/page.tsx (CONNECTÉ À FIREBASE)

'use client';

import { useState, useMemo, useEffect } from 'react';
import type { BoardGame } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Imports Firebase
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Imports UI
import { GameCard } from '@/components/games/game-card';
import { Button } from '@/components/ui/button';
import { Gift, Loader2, Frown } from 'lucide-react';

export default function MyWishlistPage() {
  // On récupère le userProfile qui contient la wishlist
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // États pour les données et le chargement
  const [allGames, setAllGames] = useState<BoardGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // On charge la bibliothèque complète de jeux depuis Firebase
  useEffect(() => {
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

  
  // La logique de filtrage utilise maintenant le userProfile et les jeux de Firebase
  const wishlistGames = useMemo(() => {
    if (!userProfile || !userProfile.wishlist || userProfile.wishlist.length === 0) {
      return [];
    }
    return allGames.filter(game => userProfile.wishlist!.includes(game.name));
  }, [userProfile, allGames]);

  // La condition de chargement est mise à jour
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
            <Gift className="h-8 w-8 text-primary" />
            Ma Wishlist
          </h1>
          <p className="text-muted-foreground">Les jeux que vous aimeriez acquérir.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/profile/edit">Gérer ma wishlist</Link>
        </Button>
      </div>

      {wishlistGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistGames.map((game) => (
            <GameCard 
                key={game.id} 
                game={game} 
                showCreateSessionButton={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center">
          <Frown className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">
            Votre wishlist est vide pour le moment.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Ajoutez des jeux à votre wishlist depuis la page "Tous les Jeux" ou modifiez votre profil.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/games">Parcourir tous les jeux</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
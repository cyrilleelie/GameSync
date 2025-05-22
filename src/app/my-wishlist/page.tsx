
'use client';

import { useState, useMemo, useEffect } from 'react';
import { mockBoardGames } from '@/lib/data';
import { GameCard } from '@/components/games/game-card';
import { Button } from '@/components/ui/button';
import { Gift, Loader2, Frown } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyWishlistPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router, isMounted]);

  const wishlistGames = useMemo(() => {
    if (!currentUser || !currentUser.wishlist) {
      return [];
    }
    return mockBoardGames.filter(game => currentUser.wishlist!.includes(game.name));
  }, [currentUser]);

  if (!isMounted || authLoading || (!currentUser && !authLoading && isMounted)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
            <GameCard key={game.id} game={game} />
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
              <Link href="/games" prefetch>Parcourir tous les jeux</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useMemo, useEffect } from 'react';
import { mockBoardGames } from '@/lib/data';
import type { BoardGame } from '@/lib/types';
import { GameCard } from '@/components/games/game-card';
import { Button } from '@/components/ui/button';
import { LibraryBig, ListFilter, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function GamesPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    mockBoardGames.forEach(game => {
      game.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'fr'));
  }, []);

  const filteredGames = useMemo(() => {
    if (!selectedTag) {
      return mockBoardGames;
    }
    return mockBoardGames.filter(game => game.tags?.includes(selectedTag));
  }, [selectedTag]);

  if (!isMounted || authLoading || (!currentUser && !authLoading)) {
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
            <LibraryBig className="h-8 w-8 text-primary" />
            Bibliothèque de Jeux
          </h1>
          <p className="text-muted-foreground">Découvrez tous les jeux disponibles sur GameSync.</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-primary" />
          Filtrer par tag
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === null ? 'default' : 'outline'}
            onClick={() => setSelectedTag(null)}
            size="sm"
          >
            Tous les tags
          </Button>
          {uniqueTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              onClick={() => setSelectedTag(tag)}
              size="sm"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            {selectedTag 
              ? `Aucun jeu ne correspond au tag "${selectedTag}".`
              : "Aucun jeu dans la bibliothèque pour le moment."}
          </p>
          {selectedTag && (
            <Button variant="link" onClick={() => setSelectedTag(null)} className="mt-2">
              Voir tous les jeux
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

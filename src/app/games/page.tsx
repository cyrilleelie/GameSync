
'use client';

import { useState, useMemo } from 'react';
import { mockBoardGames } from '@/lib/data';
import type { BoardGame, GameCategory } from '@/lib/types';
import { GameCard } from '@/components/games/game-card';
import { Button } from '@/components/ui/button';
import { LibraryBig, ListFilter } from 'lucide-react';
import { categoryTranslations } from '@/lib/category-translations';

export default function GamesPage() {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<GameCategory>();
    mockBoardGames.forEach(game => {
      if (game.category) {
        categories.add(game.category);
      }
    });
    return Array.from(categories).sort((a, b) => 
      (categoryTranslations[a] || a).localeCompare(categoryTranslations[b] || b, 'fr')
    );
  }, []);

  const filteredGames = useMemo(() => {
    if (!selectedCategory) {
      return mockBoardGames;
    }
    return mockBoardGames.filter(game => game.category === selectedCategory);
  }, [selectedCategory]);

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
          Filtrer par catégorie
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            Toutes les catégories
          </Button>
          {uniqueCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {categoryTranslations[category] || category}
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
            {selectedCategory 
              ? `Aucun jeu ne correspond à la catégorie "${categoryTranslations[selectedCategory] || selectedCategory}".`
              : "Aucun jeu dans la bibliothèque pour le moment."}
          </p>
          {selectedCategory && (
            <Button variant="link" onClick={() => setSelectedCategory(null)} className="mt-2">
              Voir toutes les catégories
            </Button>
          )}
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useMemo, useEffect } from 'react';
import { mockBoardGames } from '@/lib/data';
import type { BoardGame } from '@/lib/types';
import { GameCard } from '@/components/games/game-card';
import { Button } from '@/components/ui/button';
import { LibraryBig, ListFilter, Loader2, ChevronsUpDown, Check, X } from 'lucide-react'; // Ajout de X
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // Ajout de Badge

export default function GamesPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);

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
    if (selectedTags.length === 0) {
      return mockBoardGames;
    }
    return mockBoardGames.filter(game =>
      game.tags?.some(tag => selectedTags.includes(tag))
    );
  }, [selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prevTags =>
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };

  const getTriggerText = () => {
    if (selectedTags.length === 0) return "Tous les tags";
    if (selectedTags.length === 1) return selectedTags[0];
    return `${selectedTags.length} tags sélectionnés`;
  };

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
            <LibraryBig className="h-8 w-8 text-primary" />
            Bibliothèque de Jeux
          </h1>
          <p className="text-muted-foreground">Découvrez tous les jeux disponibles sur GameSync.</p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-primary" />
          Filtrer par tag(s)
        </h2>
        <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isTagPopoverOpen}
              className="w-full sm:w-[300px] justify-between"
            >
              {getTriggerText()}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Rechercher un tag..." />
              <CommandList>
                <CommandEmpty>Aucun tag trouvé.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    key="all-tags"
                    value="Tous les tags"
                    onSelect={() => {
                      setSelectedTags([]);
                      // Garder le popover ouvert pour d'autres actions si besoin,
                      // ou le fermer si "Tous les tags" est une action finale.
                      // Pour l'instant, on le laisse ouvert.
                      // setIsTagPopoverOpen(false);
                    }}
                  >
                     <Check // On garde le check pour "Tous les tags" pour indiquer que c'est l'option active
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTags.length === 0 ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Tous les tags (Réinitialiser)
                  </CommandItem>
                  {uniqueTags.map((tag) => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => {
                        toggleTag(tag);
                        // Laisser le popover ouvert pour la sélection multiple
                      }}
                    >
                      {/* Suppression de l'icône Check ici pour les tags individuels */}
                      <span className={cn("mr-2 h-4 w-4", selectedTags.includes(tag) ? "font-bold" : "")} /> {/* Espace pour alignement */}
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {selectedTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <p className="text-sm font-medium mr-2 self-center">Filtres actifs:</p>
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                aria-label={`Retirer ${tag}`}
              >
                <X className="h-3 w-3 text-destructive hover:text-destructive/80" />
              </button>
            </Badge>
          ))}
        </div>
      )}


      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            {selectedTags.length > 0
              ? `Aucun jeu ne correspond aux tags sélectionnés.`
              : "Aucun jeu dans la bibliothèque pour le moment."}
          </p>
          {selectedTags.length > 0 && (
            <Button variant="link" onClick={() => setSelectedTags([])} className="mt-2">
              Voir tous les jeux
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

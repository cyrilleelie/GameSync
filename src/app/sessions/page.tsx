
'use client';

import { useState, useMemo, useEffect } from 'react';
import { SessionCard } from '@/components/sessions/session-card';
import { mockSessions, mockBoardGames } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Filter, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GameSession } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function SessionsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [gameNameFilters, setGameNameFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [isGamePopoverOpen, setIsGamePopoverOpen] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(mockSessions.map(session => session.category).filter(Boolean as (value: any) => value is string));
    return ['Toutes', ...Array.from(categories)];
  }, []);

  const uniqueGameNamesFromDb = useMemo(() => {
    const gameNames = new Set(mockBoardGames.map(game => game.name));
    return Array.from(gameNames).sort();
  }, []);

  const filteredSessions = useMemo(() => {
    return mockSessions.filter(session => {
      const gameNameMatch = gameNameFilters.length === 0 || gameNameFilters.includes(session.gameName);
      const locationMatch = session.location.toLowerCase().includes(locationFilter.toLowerCase());
      const categoryMatch = categoryFilter === '' || categoryFilter === 'Toutes' || session.category === categoryFilter;
      return gameNameMatch && locationMatch && categoryMatch;
    });
  }, [gameNameFilters, locationFilter, categoryFilter]);

  const resetFilters = () => {
    setGameNameFilters([]);
    setLocationFilter('');
    setCategoryFilter('');
    setGameSearchQuery('');
  };

  const handleGameNameFilterChange = (gameName: string, isChecked: boolean) => {
    setGameNameFilters(prev =>
      isChecked ? [...prev, gameName] : prev.filter(name => name !== gameName)
    );
  };

  const popoverGameList = useMemo(() => {
    if (!gameSearchQuery) {
      return uniqueGameNamesFromDb;
    }
    return uniqueGameNamesFromDb.filter(name =>
      name.toLowerCase().includes(gameSearchQuery.toLowerCase())
    );
  }, [uniqueGameNamesFromDb, gameSearchQuery]);

  const activeFilterCount = [
    gameNameFilters.length > 0, 
    locationFilter !== '', 
    categoryFilter !== '' && categoryFilter !== 'Toutes'
  ].filter(Boolean).length;

  if (!isMounted) { // Prevent hydration mismatch by not rendering filter UI on server
    return (
      <div className="container mx-auto py-8">
         <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">Sessions de Jeu</h1>
            <p className="text-muted-foreground">Parcourez les sessions de jeu de société à venir ou créez la vôtre.</p>
            </div>
            {/* Placeholder for buttons or loading state */}
        </div>
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">Chargement des sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions de Jeu</h1>
          <p className="text-muted-foreground">Parcourez les sessions de jeu de société à venir ou créez la vôtre.</p>
        </div>
        <div className="flex gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Filtrer les Sessions</SheetTitle>
                <SheetDescription>
                  Affinez votre recherche pour trouver la session parfaite.
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="flex-grow pr-4"> {/* Adjusted pr for scrollbar */}
                <div className="grid gap-6 py-6">
                  
                  <div className="grid gap-3">
                    <Label>Nom du jeu</Label>
                    {gameNameFilters.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {gameNameFilters.map(gameName => (
                          <Badge key={gameName} variant="secondary" className="flex items-center gap-1 pr-1">
                            {gameName}
                            <button
                              type="button"
                              onClick={() => handleGameNameFilterChange(gameName, false)}
                              className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                              aria-label={`Retirer ${gameName}`}
                            >
                              <XCircle className="h-3 w-3 text-destructive hover:text-destructive/80" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Popover open={isGamePopoverOpen} onOpenChange={setIsGamePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          {gameNameFilters.length > 0 ? "Modifier la sélection de jeux" : "Sélectionner des jeux"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <div className="p-2">
                          <Input
                            placeholder="Rechercher un jeu..."
                            value={gameSearchQuery}
                            onChange={(e) => setGameSearchQuery(e.target.value)}
                            className="mb-2"
                          />
                        </div>
                        <ScrollArea className="h-[200px] border-t">
                          <div className="p-2 space-y-1">
                            {popoverGameList.length === 0 && (
                               <p className="text-sm text-muted-foreground text-center py-2">Aucun jeu trouvé.</p>
                            )}
                            {popoverGameList.map(gameName => (
                              <div key={gameName} className="flex items-center space-x-2 p-1.5 rounded-sm hover:bg-accent">
                                <Checkbox
                                  id={`popover-game-filter-${gameName.replace(/\W/g, '-')}`}
                                  checked={gameNameFilters.includes(gameName)}
                                  onCheckedChange={(checked) => handleGameNameFilterChange(gameName, !!checked)}
                                />
                                <Label 
                                  htmlFor={`popover-game-filter-${gameName.replace(/\W/g, '-')}`} 
                                  className="font-normal cursor-pointer flex-1"
                                >
                                  {gameName}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <div className="p-2 border-t">
                            <Button size="sm" className="w-full" onClick={() => setIsGamePopoverOpen(false)}>Fermer</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      placeholder="Ex : Centre-ville"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </ScrollArea>
              <SheetFooter className="mt-auto pt-4 border-t">
                <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser les filtres
                </Button>
                <SheetClose asChild>
                  <Button className="w-full sm:w-auto">Appliquer</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <Button asChild prefetch>
            <Link href="/sessions/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer une Session
            </Link>
          </Button>
        </div>
      </div>

      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            Aucune session ne correspond à vos filtres.
          </p>
          {mockSessions.length > 0 && 
             (gameNameFilters.length > 0 || locationFilter || (categoryFilter && categoryFilter !== 'Toutes')) && 
            <Button variant="link" onClick={resetFilters} className="mt-2">
              Voir toutes les sessions
            </Button>
          }
          <Button asChild className="mt-4">
            <Link href="/sessions/create" prefetch>Soyez le premier à en créer une !</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// Small helper icon for badge removal (assuming XCircle might not be available or desired)
const XCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

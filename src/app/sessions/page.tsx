
'use client';

import { useState, useMemo, useEffect } from 'react';
import { SessionCard } from '@/components/sessions/session-card';
import { mockSessions, mockBoardGames } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Filter, X, Star } from 'lucide-react';
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
import type { GameSession } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from "@/components/ui/slider";
import { useAuth } from '@/contexts/auth-context';

// Small helper icon for badge removal
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

function arraysHaveSameElements(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  return sortedArr1.every((value, index) => value === sortedArr2[index]);
}

const DEFAULT_RADIUS = 10; // km
const MAX_RADIUS = 100; // km

export default function SessionsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [gameNameFilters, setGameNameFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [radiusFilter, setRadiusFilter] = useState<number>(DEFAULT_RADIUS);
  
  const [isGamePopoverOpen, setIsGamePopoverOpen] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const { currentUser } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const uniqueGameNamesFromDb = useMemo(() => {
    const gameNames = new Set(mockBoardGames.map(game => game.name));
    return Array.from(gameNames).sort();
  }, []);

  const filteredSessions = useMemo(() => {
    // Note: Radius filtering is not actually implemented here due to lack of geodata in mocks.
    // This example focuses on UI and state management for the radius slider.
    return mockSessions.filter(session => {
      const gameNameMatch = gameNameFilters.length === 0 || gameNameFilters.some(filterName => session.gameName.includes(filterName));
      // Basic location match - a real app would use geocoding and distance calculation with the radiusFilter
      const locationMatch = session.location.toLowerCase().includes(locationFilter.toLowerCase());
      return gameNameMatch && locationMatch;
    });
  }, [gameNameFilters, locationFilter, radiusFilter]); // radiusFilter added for completeness, though not used in logic here

  const resetFilters = () => {
    setGameNameFilters([]);
    setLocationFilter('');
    setRadiusFilter(DEFAULT_RADIUS);
    setGameSearchQuery('');
  };

  const handleGameNameFilterChange = (gameName: string, isChecked: boolean) => {
    setGameNameFilters(prev =>
      isChecked ? [...prev, gameName] : prev.filter(name => name !== gameName)
    );
  };
  
  const canFilterByFavorites = !!currentUser && !!currentUser.gamePreferences && currentUser.gamePreferences.length > 0;
  const favoritesFilterIsActive = canFilterByFavorites && arraysHaveSameElements(gameNameFilters, currentUser.gamePreferences as string[]);


  const handleFilterByFavorites = () => {
    if (currentUser && currentUser.gamePreferences && currentUser.gamePreferences.length > 0) {
      const userFavorites = currentUser.gamePreferences;
      if (favoritesFilterIsActive) {
        // If favorites filter is active, toggle it off by clearing game filters
        setGameNameFilters([]);
      } else {
        // Otherwise, activate it
        setGameNameFilters(userFavorites);
      }
    }
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
    radiusFilter !== DEFAULT_RADIUS,
  ].filter(Boolean).length;


  if (!isMounted) {
    return (
      <div className="container mx-auto py-8">
         <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">Sessions de Jeu</h1>
            <p className="text-muted-foreground">Parcourez les sessions de jeu de société à venir ou créez la vôtre.</p>
            </div>
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
              <ScrollArea className="flex-grow pr-4">
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

                  {currentUser && (
                    <div className="grid gap-3">
                       <Button 
                        variant={favoritesFilterIsActive ? "secondary" : "outline"}
                        onClick={handleFilterByFavorites} 
                        disabled={!canFilterByFavorites}
                        className="w-full"
                      >
                        <Star 
                          className="mr-2 h-4 w-4 text-yellow-500"
                          fill={favoritesFilterIsActive ? 'currentColor' : 'none'}
                        />
                        {favoritesFilterIsActive ? "Filtre Favoris (Activé)" : "Filtrer par mes favoris"}
                      </Button>
                      {!canFilterByFavorites && (
                        <p className="text-xs text-muted-foreground text-center">
                          {currentUser.gamePreferences && currentUser.gamePreferences.length === 0 ? "Vous n'avez pas de jeux favoris." : "Connectez-vous pour utiliser cette fonction."}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid gap-3">
                    <Label htmlFor="location">Ville / Code Postal</Label>
                    <Input
                      id="location"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      placeholder="Ex : Paris ou 75001"
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="radius">Rayon</Label>
                      <span className="text-sm text-muted-foreground">{radiusFilter} km</span>
                    </div>
                    <Slider
                      id="radius"
                      min={0}
                      max={MAX_RADIUS}
                      step={5}
                      value={[radiusFilter]}
                      onValueChange={(value) => setRadiusFilter(value[0])}
                      className="[&>span]:bg-primary"
                    />
                     <p className="text-xs text-muted-foreground">
                      Le filtrage par rayon est simulé dans cette version.
                    </p>
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
             (gameNameFilters.length > 0 || locationFilter || radiusFilter !== DEFAULT_RADIUS) && 
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


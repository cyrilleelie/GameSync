
'use client';

import { useState, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GameSession } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SessionsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [gameNameFilters, setGameNameFilters] = useState<string[]>([]); // Changed to array for multiple game names
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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
  };

  const handleGameNameFilterChange = (gameName: string, isChecked: boolean) => {
    setGameNameFilters(prev =>
      isChecked ? [...prev, gameName] : prev.filter(name => name !== gameName)
    );
  };

  const activeFilterCount = [
    gameNameFilters.length > 0, 
    locationFilter !== '', 
    categoryFilter !== '' && categoryFilter !== 'Toutes'
  ].filter(Boolean).length;

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
              <ScrollArea className="flex-grow pr-6"> {/* Added ScrollArea for potentially long lists */}
                <div className="grid gap-6 py-6">
                  <div className="grid gap-3">
                    <Label>Nom du jeu</Label>
                    <div className="space-y-2 max-h-60"> {/* Max height for game list */}
                      {uniqueGameNamesFromDb.map(gameName => (
                        <div key={gameName} className="flex items-center space-x-2">
                          <Checkbox
                            id={`game-filter-${gameName.replace(/\W/g, '-')}`} // Make ID more robust
                            checked={gameNameFilters.includes(gameName)}
                            onCheckedChange={(checked) => handleGameNameFilterChange(gameName, !!checked)}
                          />
                          <Label htmlFor={`game-filter-${gameName.replace(/\W/g, '-')}`} className="font-normal cursor-pointer">
                            {gameName}
                          </Label>
                        </div>
                      ))}
                      {uniqueGameNamesFromDb.length === 0 && (
                        <p className="text-sm text-muted-foreground">Aucun jeu disponible pour le filtrage.</p>
                      )}
                    </div>
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
          {mockSessions.length > 0 && ( // Only show if there are sessions to potentially show
             (gameNameFilters.length > 0 || locationFilter || (categoryFilter && categoryFilter !== 'Toutes')) && // And if any filter is active
            <Button variant="link" onClick={resetFilters} className="mt-2">
              Voir toutes les sessions
            </Button>
          )}
          <Button asChild className="mt-4">
            <Link href="/sessions/create" prefetch>Soyez le premier à en créer une !</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

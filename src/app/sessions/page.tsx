'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import type { GameSession } from '@/lib/types';

// Imports pour Firebase
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Imports pour l'interface utilisateur (UI)
import { SessionCard } from '@/components/sessions/session-card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from "@/components/ui/slider";
import { PlusCircle, Filter, X, Star, Loader2, Frown } from 'lucide-react';

// === Fonctions Helper ===
const XCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

function arraysHaveSameElements(arr1: string[], arr2: string[]): boolean {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  return sortedArr1.every((value, index) => value === sortedArr2[index]);
}

const DEFAULT_RADIUS = 10;
const MAX_RADIUS = 100;

export default function SessionsPage() {
  // --- États du composant ---
  const [allSessions, setAllSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { currentUser, userProfile, loading: authLoading } = useAuth();

  // États pour les filtres
  const [gameNameFilters, setGameNameFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [radiusFilter, setRadiusFilter] = useState<number>(DEFAULT_RADIUS);
  const [isGamePopoverOpen, setIsGamePopoverOpen] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');

  // --- Chargement des données ---
  useEffect(() => {
    const fetchAllSessions = async () => {
      setIsLoading(true);
      try {
        const sessionsCollectionRef = collection(db, 'sessions');
        const q = query(sessionsCollectionRef, orderBy('dateTime', 'desc'));
        const querySnapshot = await getDocs(q);
        const sessionsFromDb = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dateTime: doc.data().dateTime?.toDate(),
        })) as GameSession[];
        setAllSessions(sessionsFromDb);
      } catch (error) {
        console.error("Erreur de chargement des sessions depuis Firebase:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllSessions();
  }, []);

  // --- Logique de filtrage ---
  const uniqueGameNames = useMemo(() => Array.from(new Set(allSessions.map(s => s.gameName))).sort(), [allSessions]);
  
  const canFilterByFavorites = !!userProfile?.gamePreferences && userProfile.gamePreferences.length > 0;
  
  const favoritesFilterIsActive = useMemo(() => 
    canFilterByFavorites && arraysHaveSameElements(gameNameFilters, userProfile.gamePreferences!)
  , [gameNameFilters, userProfile?.gamePreferences, canFilterByFavorites]);

  const handleFilterByFavorites = () => {
    if (!canFilterByFavorites) return;
    if (favoritesFilterIsActive) {
      setGameNameFilters([]); // Désactive le filtre
    } else {
      setGameNameFilters(userProfile.gamePreferences!); // Active le filtre
    }
  };

  const filteredSessions = useMemo(() => {
    return allSessions.filter(session => {
      const gameNameMatch = gameNameFilters.length === 0 || gameNameFilters.includes(session.gameName);
      const locationMatch = !locationFilter || session.location.toLowerCase().includes(locationFilter.toLowerCase());
      return gameNameMatch && locationMatch;
    });
  }, [allSessions, gameNameFilters, locationFilter]);
  
  const resetFilters = () => { setGameNameFilters([]); setLocationFilter(''); setRadiusFilter(DEFAULT_RADIUS); setGameSearchQuery(''); };
  const handleGameNameFilterChange = (gameName: string, isChecked: boolean) => { setGameNameFilters(prev => isChecked ? [...prev, gameName] : prev.filter(name => name !== gameName)); };
  const popoverGameList = useMemo(() => { if (!gameSearchQuery) return uniqueGameNames; return uniqueGameNames.filter(name => name.toLowerCase().includes(gameSearchQuery.toLowerCase())); }, [uniqueGameNames, gameSearchQuery]);
  const activeFilterCount = [gameNameFilters.length > 0, locationFilter !== '', radiusFilter !== DEFAULT_RADIUS].filter(Boolean).length;

  // --- Affichage ---
  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
                {activeFilterCount > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{activeFilterCount}</span>}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader><SheetTitle>Filtrer les Sessions</SheetTitle><SheetDescription>Affinez votre recherche pour trouver la session parfaite.</SheetDescription></SheetHeader>
              <ScrollArea className="flex-grow pr-4">
                <div className="grid gap-6 py-6">
                  <div className="grid gap-3"><Label>Nom du jeu</Label>{gameNameFilters.length > 0 && (<div className="flex flex-wrap gap-2 mb-2">{gameNameFilters.map(gameName => (<Badge key={gameName} variant="secondary" className="flex items-center gap-1 pr-1">{gameName}<button type="button" onClick={() => handleGameNameFilterChange(gameName, false)} className="ml-1 rounded-full hover:bg-destructive/20 p-0.5" aria-label={`Retirer ${gameName}`}><XCircle className="h-3 w-3 text-destructive hover:text-destructive/80" /></button></Badge>))}</div>)}<Popover open={isGamePopoverOpen} onOpenChange={setIsGamePopoverOpen}><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal"><PlusCircle className="mr-2 h-4 w-4" />{gameNameFilters.length > 0 ? "Modifier la sélection" : "Sélectionner des jeux"}</Button></PopoverTrigger><PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start"><div className="p-2"><Input placeholder="Rechercher un jeu..." value={gameSearchQuery} onChange={(e) => setGameSearchQuery(e.target.value)} className="mb-2"/></div><ScrollArea className="h-[200px] border-t"><div className="p-2 space-y-1">{popoverGameList.length === 0 && (<p className="text-sm text-muted-foreground text-center py-2">Aucun jeu trouvé.</p>)}{popoverGameList.map(gameName => (<div key={gameName} className="flex items-center space-x-2 p-1.5 rounded-sm hover:bg-accent"><Checkbox id={`popover-game-filter-${gameName.replace(/\W/g, '-')}`} checked={gameNameFilters.includes(gameName)} onCheckedChange={(checked) => handleGameNameFilterChange(gameName, !!checked)}/><Label htmlFor={`popover-game-filter-${gameName.replace(/\W/g, '-')}`} className="font-normal cursor-pointer flex-1">{gameName}</Label></div>))}</div></ScrollArea><div className="p-2 border-t"><Button size="sm" className="w-full" onClick={() => setIsGamePopoverOpen(false)}>Fermer</Button></div></PopoverContent></Popover></div>
                  {currentUser && (<div className="grid gap-3"><Button variant={favoritesFilterIsActive ? "secondary" : "outline"} onClick={handleFilterByFavorites} disabled={!canFilterByFavorites} className="w-full"><Star className="mr-2 h-4 w-4 text-yellow-500" fill={favoritesFilterIsActive ? 'currentColor' : 'none'}/>{favoritesFilterIsActive ? "Filtre Favoris (Activé)" : "Filtrer par mes favoris"}</Button>{!canFilterByFavorites && userProfile && (<p className="text-xs text-muted-foreground text-center">{userProfile.gamePreferences?.length === 0 ? "Ajoutez des favoris à votre profil." : ""}</p>)}</div>)}
                  <div className="grid gap-3"><Label htmlFor="location">Ville / Code Postal</Label><Input id="location" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="Ex : Paris ou 75001"/></div>
                  <div className="grid gap-3"><div className="flex justify-between items-center"><Label htmlFor="radius">Rayon</Label><span className="text-sm text-muted-foreground">{radiusFilter} km</span></div><Slider id="radius" min={0} max={MAX_RADIUS} step={5} value={[radiusFilter]} onValueChange={(value) => setRadiusFilter(value[0])} className="[&>span]:bg-primary"/><p className="text-xs text-muted-foreground">Le filtrage par rayon est simulé.</p></div>
                </div>
              </ScrollArea>
              <SheetFooter className="mt-auto pt-4 border-t"><Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto"><X className="mr-2 h-4 w-4" />Réinitialiser</Button><SheetClose asChild><Button className="w-full sm:w-auto">Appliquer</Button></SheetClose></SheetFooter>
            </SheetContent>
          </Sheet>
          <Button asChild prefetch><Link href="/sessions/create"><PlusCircle className="mr-2 h-4 w-4" />Créer une Session</Link></Button>
        </div>
      </div>
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredSessions.map((session) => (<SessionCard key={session.id} session={session} />))}</div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center">
          <Frown className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">{allSessions.length === 0 ? "Aucune session disponible pour le moment." : "Aucune session ne correspond à vos filtres."}</p>
          {allSessions.length > 0 && activeFilterCount > 0 && <Button variant="link" onClick={resetFilters} className="mt-2">Voir toutes les sessions</Button>}
          {(allSessions.length === 0 || activeFilterCount > 0) && <Button asChild className="mt-4"><Link href="/sessions/create">Soyez le premier à en créer une !</Link></Button>}
        </div>
      )}
    </div>
  );
}
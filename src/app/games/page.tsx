'use client';

import { useState, useMemo, useEffect } from 'react';
import type { BoardGame, TagCategoryKey } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { GameCard } from '@/components/games/game-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LibraryBig, ListFilter, Loader2, X, PlusCircle, Search, Frown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { RequestGameForm } from '@/components/games/request-game-form';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TAG_CATEGORY_DETAILS, getTranslatedTagCategory, getTagCategoryColorClass } from '@/lib/tag-categories';
import { cn } from '@/lib/utils';

type SelectedFilters = Record<TagCategoryKey, string[]>;

const initialFilters = (): SelectedFilters => {
  const filters: Partial<SelectedFilters> = {};
  (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => { filters[key] = []; });
  return filters as SelectedFilters;
};

export default function GamesPage() {
  const [allGames, setAllGames] = useState<BoardGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(initialFilters());
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const fetchGamesFromDb = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, "games"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        setAllGames(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BoardGame[]);
      } catch (error) { console.error("Erreur de chargement des jeux :", error); }
      finally { setIsLoading(false); }
    };
    fetchGamesFromDb();
  }, []);

  useEffect(() => { if (isMounted && !authLoading && !currentUser) { router.push('/login'); } }, [currentUser, authLoading, router, isMounted]);

  const allCategorizedTags = useMemo(() => {
    const categorized: Record<TagCategoryKey, Set<string>> = {} as any;
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => { categorized[key] = new Set<string>(); });
    allGames.forEach(game => { game.tags?.forEach(tag => { if (tag.categoryKey in categorized) { categorized[tag.categoryKey].add(tag.name); } }); });
    const result: Record<TagCategoryKey, string[]> = {} as any;
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => { result[key] = Array.from(categorized[key]).sort((a,b) => a.localeCompare(b, 'fr')); });
    return result;
  }, [allGames]);

  const activeSelectedTags = useMemo(() => Object.entries(selectedFilters).flatMap(([k,t])=>t.map(n=>({categoryKey:k as TagCategoryKey,categoryName:getTranslatedTagCategory(k as TagCategoryKey),tagName:n}))), [selectedFilters]);

  const filteredGames = useMemo(() => {
    let games = allGames;
    if (searchQuery) {
      games = games.filter(game => game.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    const allSelectedTagNames = Object.values(selectedFilters).flat();
    if (allSelectedTagNames.length > 0) {
      games = games.filter(game => { if (!game.tags?.length) return false; return (Object.keys(selectedFilters) as TagCategoryKey[]).every(k => { const s = selectedFilters[k]; if (s.length === 0) return true; return g.tags!.some(gt => gt.categoryKey === k && s.includes(gt.name)); }); });
    }
    return games;
  }, [allGames, selectedFilters, searchQuery]);

  const handleTagSelection = (k: TagCategoryKey, n: string, c: boolean) => { setSelectedFilters(p=>{const t=p[k]||[];const N=c?[...t,n]:t.filter(x=>x!==n);return{...p,[k]:N};}); };
  const resetFilters = () => { setSelectedFilters(initialFilters()); setSearchQuery(''); };
  const removeTagFromFilter = (k: TagCategoryKey, n: string) => { handleTagSelection(k, n, false); };

  if (!isMounted || authLoading || isLoading) {
    return (<div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><LibraryBig className="h-8 w-8 text-primary" />Bibliothèque de Jeux</h1><p className="text-muted-foreground">Découvrez tous les jeux disponibles sur GameSync.</p></div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Rechercher par nom..." className="pl-8 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/></div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}><SheetTrigger asChild><Button variant="outline" className="relative w-full sm:w-auto"><ListFilter className="mr-2 h-4 w-4" />Filtrer{activeSelectedTags.length > 0 && (<Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-1">{activeSelectedTags.length}</Badge>)}</Button></SheetTrigger><SheetContent className="w-full sm:max-w-md flex flex-col"><SheetHeader><SheetTitle>Filtrer les Jeux</SheetTitle><SheetDescription>Affinez votre recherche.</SheetDescription></SheetHeader><ScrollArea className="flex-grow my-4 pr-6 -mr-6"><div className="space-y-6">{(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(k => { const t = allCategorizedTags[k]; if (!t || t.length === 0) return null; return ( <div key={k}><h4 className="text-md font-semibold mb-2 text-primary">{getTranslatedTagCategory(k)}</h4><div className="space-y-2">{t.map(n => (<div key={n} className="flex items-center space-x-2"><Checkbox id={`${k}-${n}`} checked={selectedFilters[k]?.includes(n)} onCheckedChange={(c) => handleTagSelection(k, n, !!c)}/><Label htmlFor={`${k}-${n}`} className="font-normal text-sm">{n}</Label></div>))}</div></div> ); })}</div></ScrollArea><SheetFooter className="mt-auto pt-4 border-t"><Button variant="outline" onClick={resetFilters}><X className="mr-2 h-4 w-4" />Réinitialiser</Button><SheetClose asChild><Button>Appliquer</Button></SheetClose></SheetFooter></SheetContent></Sheet>
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}><DialogTrigger asChild><Button variant="outline" size="sm" className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" />Demander un jeu</Button></DialogTrigger><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Demander l'ajout d'un jeu</DialogTitle><DialogDescription>Le jeu que vous cherchez n'est pas dans la liste ? Remplissez ce formulaire.</DialogDescription></DialogHeader><RequestGameForm onSubmitSuccess={() => setIsRequestDialogOpen(false)} /></DialogContent></Dialog>
          </div>
        </div>
      </div>
      {activeSelectedTags.length > 0 && ( <div className="mb-6 flex flex-wrap items-center gap-2"><p className="text-sm font-medium mr-2 self-center">Filtres actifs:</p>{activeSelectedTags.map(({ categoryKey, categoryName, tagName }) => (<Badge key={`${categoryKey}-${tagName}`} variant="customColor" className={cn("flex items-center gap-1 pr-1 font-normal", getTagCategoryColorClass(categoryKey))}><span className="font-semibold opacity-80">{getTranslatedTagCategory(categoryKey)}:</span> {tagName}<button type="button" onClick={() => removeTagFromFilter(categoryKey, tagName)} className="ml-1 rounded-full hover:bg-black/20 dark:hover:bg-white/20 p-0.5" aria-label={`Retirer ${tagName}`}><X className="h-3 w-3" /></button></Badge>))}<Button variant="link" onClick={resetFilters} className="p-0 h-auto text-xs">Tout effacer</Button></div> )}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{filteredGames.map((game) => (<GameCard key={game.id} game={game} showCreateSessionButton={false} />))}</div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center"><Frown className="h-16 w-16 text-muted-foreground mb-4" /><p className="text-xl text-muted-foreground mb-2">{allGames.length > 0 ? `Aucun jeu ne correspond à vos critères.` : "Aucun jeu dans la bibliothèque."}</p>{activeSelectedTags.length > 0 || searchQuery ? (<Button variant="link" onClick={resetFilters} className="mt-2">Voir tous les jeux</Button>) : null}</div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import type { BoardGame, Player } from '@/lib/types';
import { TAG_CATEGORY_DETAILS, getTagCategoryColorClass, getTranslatedTagCategory, type TagCategoryKey, type TagDefinition } from '@/lib/tag-categories';
// import { mockBoardGames } from '@/lib/data'; // Conservé uniquement pour la fonction de seeding

// Imports Firebase
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, limit, orderBy, where } from 'firebase/firestore';

// Imports UI et icônes
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription as SheetDescriptionPrimitive, SheetHeader as SheetHeaderPrimitive, SheetTitle as SheetTitlePrimitive, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Edit, Trash2, Gamepad2, Loader2, Database, Search, Columns, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditGameForm, type GameFormValues } from '@/components/admin/edit-game-form';


const initialTagFilters = (): Record<TagCategoryKey, string[]> => {
  const filters: Partial<Record<TagCategoryKey, string[]>> = {};
  (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => { filters[key] = []; });
  return filters as Record<TagCategoryKey, string[]>;
};

const XCircle = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg> );

export function GamesTab() {
  const { toast } = useToast();
  const [games, setGames] = useState<BoardGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isGameFormDialogOpen, setIsGameFormDialogOpen] = useState(false);
  const [currentGameToEdit, setCurrentGameToEdit] = useState<BoardGame | null>(null);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({ tags: true, description: true, publisher: true, publicationYear: true });
  const [adminGameSearchQuery, setAdminGameSearchQuery] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [descriptionFilter, setDescriptionFilter] = useState<'all' | 'with' | 'without'>('all');
  const [selectedTagFilters, setSelectedTagFilters] = useState<Record<string, string[]>>(initialTagFilters());

  const fetchGames = async () => { setIsLoading(true); try { const q = query(collection(db, "games"), orderBy("name", "asc")); const querySnapshot = await getDocs(q); setGames(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BoardGame[]); } catch (error) { toast({ title: "Erreur de chargement des jeux", variant: "destructive" }); } finally { setIsLoading(false); } };
  useEffect(() => { fetchGames(); }, []);

  // const seedGamesDatabase = async () => { setIsSeeding(true); toast({ title: "Lancement..." }); try { const q = query(collection(db, 'games'), limit(1)); if (!(await getDocs(q)).empty) { toast({ title: "Annulé", description: "Collection déjà remplie.", variant: "destructive" }); return; } for (const game of mockBoardGames) { const { id, ...gameData } = game; await addDoc(collection(db, 'games'), gameData); } toast({ title: "Terminé !", description: `${mockBoardGames.length} jeux ajoutés.` }); await fetchGames(); } catch (e) { toast({ title: "Erreur", variant: "destructive" }); } finally { setIsSeeding(false); } };
  const handleSaveGame = async (gameData: GameFormValues) => { setIsLoading(true); const dataToSave = { ...gameData, publicationYear: Number(gameData.publicationYear) || undefined }; try { if (isAddingGame || !gameData.id) { const { id, ...newGameData } = dataToSave; await addDoc(collection(db, "games"), newGameData); toast({ title: "Jeu Ajouté" }); } else { const gameDocRef = doc(db, 'games', gameData.id); const { id, ...updatedGameData } = dataToSave; await updateDoc(gameDocRef, updatedGameData as any); toast({ title: "Jeu Modifié" }); } await fetchGames(); } catch (e) { toast({ title: "Erreur de sauvegarde", variant: "destructive" }); } finally { setIsLoading(false); setIsGameFormDialogOpen(false); } };
  const handleDeleteGame = async (gameId: string, gameName: string) => { setIsLoading(true); try { await deleteDoc(doc(db, "games", gameId)); toast({ title: "Jeu Supprimé" }); await fetchGames(); } catch (e) { toast({ title: "Erreur de suppression", variant: "destructive" }); } finally { setIsLoading(false); } };
  const handleOpenAddGameDialog = () => { setIsAddingGame(true); setCurrentGameToEdit(null); setIsGameFormDialogOpen(true); };
  const handleOpenEditGameDialog = (game: BoardGame) => { setIsAddingGame(false); setCurrentGameToEdit(game); setIsGameFormDialogOpen(true); };
  
  // === LA CORRECTION EST ICI ===
  // On utilise la variable `games` (de Firebase) au lieu de `mockBoardGames`
  const allCategorizedTagsForGames = useMemo(() => {
    const categorized: Record<string, Set<string>> = {};
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => { categorized[key] = new Set<string>(); });
    games.forEach(game => {
      game.tags?.forEach(tag => {
        if (tag.categoryKey in categorized) {
          categorized[tag.categoryKey as TagCategoryKey].add(tag.name);
        }
      });
    });
    const result: Record<string, string[]> = {};
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => { result[key] = Array.from(categorized[key]).sort((a, b) => a.localeCompare(b, 'fr')); });
    return result;
  }, [games]);

  const activeTagFilterBadges = useMemo(() => Object.entries(selectedTagFilters).flatMap(([k,t]) => t.map(n => ({ categoryKey: k as TagCategoryKey, categoryName: getTranslatedTagCategory(k as TagCategoryKey), tagName: n }))), [selectedTagFilters]);
  const handleTagSelection = (k: string, t: string, i: boolean) => { setSelectedTagFilters(p => { const c = p[k] || []; const n = i ? [...c,t] : c.filter(x => x !== t); return {...p, [k]:n}; }); };
  const removeTagFromFilterBadge = (k: string, t: string) => { handleTagSelection(k, t, false); };
  const resetAllFilters = () => { setAdminGameSearchQuery(''); setDescriptionFilter('all'); setSelectedTagFilters(initialTagFilters()); };
  const activeFilterCount = useMemo(() => [adminGameSearchQuery !== '', descriptionFilter !== 'all', activeTagFilterBadges.length > 0].filter(Boolean).length, [adminGameSearchQuery, descriptionFilter, activeTagFilterBadges]);
  const displayedGames = useMemo(() => { let g=[...games]; if(adminGameSearchQuery){g=g.filter(x=>x.name.toLowerCase().includes(adminGameSearchQuery.toLowerCase()))} g=g.filter(x=>{if(descriptionFilter==='with')return !!x.description&&x.description.trim()!=='';if(descriptionFilter==='without')return !x.description||x.description.trim()==='';return true}); if(Object.values(selectedTagFilters).some(t=>t.length>0)){g=g.filter(x=>{if(!x.tags||x.tags.length===0)return false;return(Object.keys(selectedTagFilters)as string[]).every(k=>{const c=selectedTagFilters[k];if(c.length===0)return true;return x.tags!.some(t=>t.categoryKey===k&&c.includes(t.name))})})}return g }, [games, adminGameSearchQuery, descriptionFilter, selectedTagFilters]);

  if (isLoading) { return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>; }

  return (
    <>
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div><CardTitle>Gestion des Jeux</CardTitle><CardDescription>{games.length} jeu(x) dans la base de données.</CardDescription></div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Rechercher un jeu..." className="pl-8 w-full" value={adminGameSearchQuery} onChange={(e) => setAdminGameSearchQuery(e.target.value)} /></div>
                    <div className="flex gap-2 justify-end sm:justify-start">
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Columns className="mr-2 h-4 w-4" />Colonnes</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Colonnes Visibles</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuCheckboxItem checked={visibleColumns.tags} onCheckedChange={(c)=>setVisibleColumns(p=>({...p,tags:!!c}))}>Tags</DropdownMenuCheckboxItem><DropdownMenuCheckboxItem checked={visibleColumns.description} onCheckedChange={(c)=>setVisibleColumns(p=>({...p,description:!!c}))}>Description</DropdownMenuCheckboxItem><DropdownMenuCheckboxItem checked={visibleColumns.publisher} onCheckedChange={(c)=>setVisibleColumns(p=>({...p,publisher:!!c}))}>Éditeur</DropdownMenuCheckboxItem><DropdownMenuCheckboxItem checked={visibleColumns.publicationYear} onCheckedChange={(c)=>setVisibleColumns(p=>({...p,publicationYear:!!c}))}>Année</DropdownMenuCheckboxItem></DropdownMenuContent></DropdownMenu>
                        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}><SheetTrigger asChild><Button variant="outline" size="sm" className="relative"><Filter className="mr-2 h-4 w-4" />Filtrer{activeFilterCount > 0 && (<Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-1 text-xs">{activeFilterCount}</Badge>)}</Button></SheetTrigger><SheetContent className="w-full sm:max-w-md flex flex-col"><SheetHeaderPrimitive><SheetTitlePrimitive>Filtrer les Jeux</SheetTitlePrimitive><SheetDescriptionPrimitive>Affinez votre recherche.</SheetDescriptionPrimitive></SheetHeaderPrimitive><ScrollArea className="flex-grow my-4 pr-6 -mr-6"><div className="space-y-6"><div><h4 className="text-md font-semibold mb-2 text-primary">Par description</h4><RadioGroup value={descriptionFilter} onValueChange={(v)=>setDescriptionFilter(v as any)}><div className="flex items-center space-x-2"><RadioGroupItem value="all" id="desc-all" /><Label htmlFor="desc-all" className="font-normal">Tous</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="with" id="desc-with" /><Label htmlFor="desc-with" className="font-normal">Avec</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="without" id="desc-without" /><Label htmlFor="desc-without" className="font-normal">Sans</Label></div></RadioGroup></div><DropdownMenuSeparator />{(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(k => { const t = allCategorizedTagsForGames[k]; if (!t || t.length === 0) return null; return ( <div key={k}><h4 className="text-md font-semibold mb-2 text-primary">{getTranslatedTagCategory(k)}</h4><div className="space-y-2">{t.map(n => (<div key={n} className="flex items-center space-x-2"><Checkbox id={`f-${k}-${n}`} checked={(selectedTagFilters[k]||[]).includes(n)} onCheckedChange={(c)=>handleTagSelection(k,n,!!c)}/><Label htmlFor={`f-${k}-${n}`} className="font-normal text-sm">{n}</Label></div>))}</div></div>)})}</div></ScrollArea><SheetFooter className="mt-auto pt-4 border-t"><Button variant="outline" onClick={resetAllFilters}><X className="mr-2 h-4 w-4" />Réinitialiser</Button><SheetClose asChild><Button>Appliquer</Button></SheetClose></SheetFooter></SheetContent></Sheet>
                        <Button onClick={handleOpenAddGameDialog} size="sm"><PlusCircle className="mr-2 h-4 w-4" />Ajouter</Button>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-2">
            {/* <div className="border-2 border-dashed p-4 rounded-lg mb-6"><h4 className="font-semibold text-sm">Outil de Développement</h4><p className="text-xs text-muted-foreground mt-1">Utilisez cet outil une seule fois pour remplir la collection `games` avec vos données locales.</p><Button variant="secondary" size="sm" className="mt-2" onClick={seedGamesDatabase} disabled={isSeeding}>{isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Database className="mr-2 h-4 w-4"/>}{isSeeding ? 'Remplissage...' : 'Lancer le remplissage'}</Button></div> */}
            {activeTagFilterBadges.length > 0 && (<div className="mb-4 flex flex-wrap items-center gap-2"><p className="text-sm font-medium mr-2 self-center text-muted-foreground">Filtres actifs:</p>{activeTagFilterBadges.map(({ categoryKey, tagName }) => (<Badge key={`${categoryKey}-${tagName}`} variant="customColor" className={cn("flex items-center gap-1 pr-1 font-normal text-xs", getTagCategoryColorClass(categoryKey as TagCategoryKey))}><span className="font-semibold opacity-80">{getTranslatedTagCategory(categoryKey)}:</span> {tagName}<button type="button" onClick={() => removeTagFromFilterBadge(categoryKey, tagName)} className="ml-1 rounded-full hover:bg-black/20 dark:hover:bg-white/20 p-0.5" aria-label={`Retirer ${tagName}`}><X className="h-3 w-3" /></button></Badge>))}<Button variant="link" onClick={resetAllFilters} className="p-0 h-auto text-xs">Tout effacer</Button></div>)}
            <Table><TableHeader><TableRow><TableHead>Image</TableHead><TableHead>Nom</TableHead>{visibleColumns.publisher&&<TableHead>Éditeur</TableHead>}{visibleColumns.publicationYear&&<TableHead>Année</TableHead>}{visibleColumns.tags&&<TableHead>Tags</TableHead>}{visibleColumns.description&&<TableHead>Description</TableHead>}<TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{displayedGames.map((game) => (<TableRow key={game.id}><TableCell><div className="relative h-12 w-12 rounded overflow-hidden bg-muted">{game.imageUrl ? (<Image src={game.imageUrl} alt={`Image de ${game.name}`} fill sizes="50px" className="object-cover"/>) : (<div className="flex items-center justify-center h-full w-full"><Gamepad2 className="h-6 w-6 text-muted-foreground" /></div>)}</div></TableCell><TableCell className="font-medium">{game.name}</TableCell>{visibleColumns.publisher&&(<TableCell className="text-xs text-muted-foreground">{game.publisher||<span className="italic">N/A</span>}</TableCell>)}{visibleColumns.publicationYear&&(<TableCell className="text-xs text-muted-foreground text-center">{game.publicationYear||<span className="italic">N/A</span>}</TableCell>)}{visibleColumns.tags&&(<TableCell>{game.tags&&game.tags.length>0?(<div className="flex flex-wrap gap-1">{game.tags.slice(0,3).map(t=>(<Badge key={`${t.categoryKey}-${t.name}`} variant="customColor" className={cn("font-normal text-xs", getTagCategoryColorClass(t.categoryKey as TagCategoryKey))} title={`${getTranslatedTagCategory(t.categoryKey)}: ${t.name}`}>{t.name}</Badge>))} {game.tags.length>3&&(<Badge variant="outline" className="text-xs">+{game.tags.length-3}</Badge>)}</div>):(<span className="text-muted-foreground text-xs">Aucun</span>)}</TableCell>)}{visibleColumns.description&&(<TableCell>{game.description?(<TooltipProvider><Tooltip><TooltipTrigger asChild><p className="text-xs text-muted-foreground line-clamp-2 cursor-default">{game.description}</p></TooltipTrigger><TooltipContent><p className="text-xs">{game.description}</p></TooltipContent></Tooltip></TooltipProvider>):(<span className="text-muted-foreground text-xs italic">N/A</span>)}</TableCell>)}<TableCell className="text-right"><Button variant="ghost" size="icon" onClick={()=>handleOpenEditGameDialog(game)} title={`Modifier ${game.name}`}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={()=>handleDeleteGame(game.id, game.name)} title={`Supprimer ${game.name}`}><Trash2 className="h-4 w-4"/></Button></TableCell></TableRow>))}</TableBody></Table>
            {displayedGames.length === 0 && <p className="text-muted-foreground text-center py-4">{games.length === 0 ? "Aucun jeu dans la base de données." : "Aucun jeu ne correspond à vos filtres."}</p>}
        </CardContent>
      </Card>
      <Dialog open={isGameFormDialogOpen} onOpenChange={setIsGameFormDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>{isAddingGame ? "Ajouter un nouveau jeu" : `Modifier : ${currentGameToEdit?.name}`}</DialogTitle></DialogHeader>
          <EditGameForm gameToEdit={isAddingGame ? null : currentGameToEdit} onSave={handleSaveGame} onCancel={() => setIsGameFormDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
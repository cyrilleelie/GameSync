'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { BoardGame, TagDefinition, TagCategoryKey } from '@/lib/types';
import { mockBoardGames } from '@/lib/data';

// Imports Firebase
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';

// Imports UI et icônes
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger as SelectTriggerPrimitive, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle, Edit, Trash2, Search, Check as CheckIcon, X, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TAG_CATEGORY_DETAILS, getTagCategoryColorClass, getTranslatedTagCategory } from '@/lib/tag-categories';
import { cn } from '@/lib/utils';

// Fonctions Helper
const calculateUniqueTags = (games: BoardGame[]): TagDefinition[] => {
  const tagSet = new Set<string>();
  const uniqueTags: TagDefinition[] = [];
  games.forEach(game => {
    game.tags?.forEach(tag => {
      const tagKey = `${tag.categoryKey}::${tag.name}`;
      if (!tagSet.has(tagKey)) {
        tagSet.add(tagKey);
        uniqueTags.push(tag);
      }
    });
  });
  return uniqueTags.sort((a, b) => (String(a.categoryKey).localeCompare(String(b.categoryKey)) || a.name.localeCompare(b.name)));
};
const CREATE_NEW_CATEGORY_VALUE = "--create-new-category--";

export function TagsTab() {
  const { toast } = useToast();
  const [tags, setTags] = useState<TagDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [editingTagKey, setEditingTagKey] = useState<string | null>(null);
  const [editedTagName, setEditedTagName] = useState('');
  const [editedTagCategory, setEditedTagCategory] = useState<TagCategoryKey | string>('');
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);
  const [newTagNameInput, setNewTagNameInput] = useState('');
  const [newTagCategoryInput, setNewTagCategoryInput] = useState<TagCategoryKey | string>('');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('');
  const [tagCategoryFilter, setTagCategoryFilter] = useState<string>('all');
  const [adminTagSearchQuery, setAdminTagSearchQuery] = useState('');

  const fetchTags = async () => {
    console.log("--- Lancement de fetchTags ---");
    setIsLoading(true);
    try {
      const tagsCollectionRef = collection(db, 'tags');
      console.log("1. Référence à la collection 'tags' obtenue.");

      const querySnapshot = await getDocs(tagsCollectionRef);
      console.log(`2. Requête exécutée. La requête est vide ? ${querySnapshot.empty}. Nombre de documents trouvés: ${querySnapshot.size}`);

      if (!querySnapshot.empty) {
        const tagsFromDb = querySnapshot.docs.map(doc => {
          console.log(`  - Document lu: ID=${doc.id}, Données=`, doc.data());
          return { id: doc.id, ...doc.data() } as TagDefinition;
        });

        console.log("3. Tags formatés prêts à être affichés:", tagsFromDb);
        setTags(tagsFromDb);
      } else {
        // Si aucun document n'est retourné, on s'assure que la liste est vide.
        setTags([]);
      }

    } catch (error) {
      console.error("--- ERREUR ATTRAPÉE DANS fetchTags ---", error);
      toast({ title: "Erreur de chargement des tags", variant: "destructive" });
    } finally {
      setIsLoading(false);
      console.log("4. fetchTags terminé.");
    }
  };

  useEffect(() => { fetchTags(); }, []);
  
  const seedTagsDatabase = async () => {
    setIsSeeding(true);
    toast({ title: "Lancement du remplissage des tags..." });
    try {
      const tagsRef = collection(db, 'tags');
      const q = query(tagsRef, limit(1));
      if (!(await getDocs(q)).empty) {
        toast({ title: "Opération annulée", description: "La collection 'tags' est déjà remplie.", variant: "destructive" });
        return;
      }
      const uniqueTagsToSeed = calculateUniqueTags(mockBoardGames);
      if (uniqueTagsToSeed.length === 0) {
        toast({ title: "Aucun tag à ajouter." });
        return;
      }
      for (const tag of uniqueTagsToSeed) {
        await addDoc(tagsRef, { name: tag.name, categoryKey: tag.categoryKey });
      }
      toast({ title: "Remplissage terminé !", description: `${uniqueTagsToSeed.length} tags uniques ont été ajoutés.` });
      await fetchTags();
    } catch (e) { toast({ title: "Erreur de remplissage", variant: "destructive" }); }
    finally { setIsSeeding(false); }
  };

  const handleOpenAddTagDialog = () => { setNewTagNameInput(''); setNewTagCategoryInput(''); setNewCategoryNameInput(''); setIsCreatingNewCategory(false); setIsAddTagDialogOpen(true); };

  const handleConfirmAddTag = async () => {
    if (!newTagNameInput.trim() || !newTagCategoryInput) { toast({ title: "Champs requis", variant: "destructive" }); return; }
    let k=newTagCategoryInput,c=newTagCategoryInput;if(newTagCategoryInput===CREATE_NEW_CATEGORY_VALUE){if(!newCategoryNameInput.trim()){toast({title:"Nom de catégorie requis",variant:"destructive"});return}k=newCategoryNameInput.trim().toLowerCase().replace(/\s+/g,'-');c=newCategoryNameInput.trim()}const e=tags.find(t=>t.name.toLowerCase()===newTagNameInput.trim().toLowerCase()&&t.categoryKey===k);if(e){toast({title:"Tag Existant",variant:"destructive"});return}
    try {
        await addDoc(collection(db, 'tags'), { name: newTagNameInput.trim(), categoryKey: k });
        toast({ title: "Tag Ajouté !", description: "Le tag a été ajouté à la base de données." });
        await fetchTags();
    } catch (error) { toast({ title: "Erreur", description: "Impossible d'ajouter le tag.", variant: "destructive" }); }
    finally { setIsAddTagDialogOpen(false); }
  };

  const handleDeleteTag = async (tag: TagDefinition) => {
    if (!tag.id) return;
    try {
        await deleteDoc(doc(db, 'tags', tag.id));
        toast({ title: "Tag Supprimé", description: `Le tag "${tag.name}" a été supprimé.` });
        await fetchTags();
    } catch (error) { toast({ title: "Erreur", description: "Impossible de supprimer le tag.", variant: "destructive" }); }
  };

  const handleStartEditTag = (tag: TagDefinition) => { /* ... simulation ... */ };
  const handleCancelEditTag = () => { /* ... simulation ... */ };
  const handleSaveTagEdit = () => { /* ... simulation ... */ };

  const displayedManagedTags = useMemo(() => {
    let filtered = tags;
    if (adminTagSearchQuery) filtered = filtered.filter(tag => tag.name.toLowerCase().includes(adminTagSearchQuery.toLowerCase()));
    if (tagCategoryFilter !== 'all') filtered = filtered.filter(tag => tag.categoryKey === tagCategoryFilter);
    return filtered;
  }, [tags, tagCategoryFilter, adminTagSearchQuery]);

  if (isLoading) { return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>; }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div><CardTitle>Gestion des Tags</CardTitle><CardDescription>{tags.length} tag(s) unique(s) dans la base de données.</CardDescription></div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Rechercher un tag..." className="pl-8 w-full h-9 text-sm" value={adminTagSearchQuery} onChange={(e) => setAdminTagSearchQuery(e.target.value)}/></div>
              <div className="w-full sm:w-48"><Select value={tagCategoryFilter} onValueChange={setTagCategoryFilter}><SelectTriggerPrimitive className="h-9 text-sm w-full"><SelectValue placeholder="Filtrer par catégorie" /></SelectTriggerPrimitive><SelectContent><SelectItem value="all">Toutes les catégories</SelectItem>{(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(catKey => (<SelectItem key={catKey} value={catKey}>{getTranslatedTagCategory(catKey)}</SelectItem>))}</SelectContent></Select></div>
              <Button onClick={handleOpenAddTagDialog} size="sm" className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" />Ajouter un Tag</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
            <div className="border-2 border-dashed p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-sm">Outil de Développement</h4>
                <p className="text-xs text-muted-foreground mt-1">Popule la collection `tags` avec tous les tags uniques des jeux locaux. Ne fonctionne que si la collection est vide.</p>
                <Button variant="secondary" size="sm" className="mt-2" onClick={seedTagsDatabase} disabled={isSeeding}>{isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Database className="mr-2 h-4 w-4"/>}{isSeeding ? 'Remplissage...' : 'Lancer le remplissage'}</Button>
            </div>
          {displayedManagedTags.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Nom du Tag</TableHead><TableHead>Catégorie</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {displayedManagedTags.map((tag) => {
                  const currentTagKey = `${tag.categoryKey}::${tag.name}`;
                  const isEditing = false; // La logique d'édition est désactivée pour l'instant
                  return (
                    <TableRow key={tag.id}>
                      <TableCell>{isEditing ? <Input /> : tag.name}</TableCell>
                      <TableCell>{isEditing ? <Select /> : <Badge variant="customColor" className={cn("font-normal text-xs", getTagCategoryColorClass(tag.categoryKey as TagCategoryKey))}>{getTranslatedTagCategory(tag.categoryKey)}</Badge>}</TableCell>
                      <TableCell className="text-right">{isEditing ? <></> : (<><Button variant="ghost" size="icon" disabled title="Modification à implémenter"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteTag(tag)} title={`Supprimer le tag ${tag.name}`}><Trash2 className="h-4 w-4" /></Button></>)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (<p className="text-muted-foreground text-center py-4">Aucun tag à afficher.</p>)}
        </CardContent>
      </Card>
      <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Ajouter un Nouveau Tag</DialogTitle><DialogDescription>Entrez le nom et sélectionnez ou créez la catégorie pour le nouveau tag.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="new-tag-name" className="text-right">Nom du Tag</Label><Input id="new-tag-name" value={newTagNameInput} onChange={(e) => setNewTagNameInput(e.target.value)} className="col-span-3" placeholder="Nom du tag"/></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="new-tag-category-select" className="text-right">Catégorie</Label><Select value={newTagCategoryInput} onValueChange={(value) => { setNewTagCategoryInput(value); setIsCreatingNewCategory(value === CREATE_NEW_CATEGORY_VALUE); if (value !== CREATE_NEW_CATEGORY_VALUE) { setNewCategoryNameInput(''); } }}><SelectTriggerPrimitive id="new-tag-category-select" className="col-span-3 h-9"><SelectValue placeholder="Choisir Catégorie" /></SelectTriggerPrimitive><SelectContent>{(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(key => (<SelectItem key={key} value={key}>{getTranslatedTagCategory(key)}</SelectItem>))}<SelectItem value={CREATE_NEW_CATEGORY_VALUE}>-- Créer une nouvelle catégorie --</SelectItem></SelectContent></Select></div>
            {isCreatingNewCategory && (<div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="new-category-name-input" className="text-right">Nom Nv. Cat.</Label><Input id="new-category-name-input" value={newCategoryNameInput} onChange={(e) => setNewCategoryNameInput(e.target.value)} className="col-span-3" placeholder="Nom de la nouvelle catégorie"/></div>)}
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setIsAddTagDialogOpen(false)}>Annuler</Button><Button type="button" onClick={handleConfirmAddTag}>Confirmer l'Ajout</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
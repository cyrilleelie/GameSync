// Fichier : src/components/admin/tags-tab.tsx (INTÉGRAL ET FINAL)

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { BoardGame, TagDefinition, TagCategoryKey } from '@/lib/types';
import { mockBoardGames } from '@/lib/data';

// Imports Firebase
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, limit, where, writeBatch } from 'firebase/firestore';

// Imports UI et icônes
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger as SelectTriggerPrimitive, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle, Edit, Trash2, Search, Check as CheckIcon, X, Database, ServerCrash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { TAG_CATEGORY_DETAILS, getTagCategoryColorClass, getTranslatedTagCategory } from '@/lib/tag-categories';
import { cn } from '@/lib/utils';

// Helper functions
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [fetchError, setFetchError] = useState<any>(null);
  
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

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const q = query(collection(db, 'tags'), orderBy('categoryKey'), orderBy('name'));
        const tagsSnapshot = await getDocs(q);
        setTags(tagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TagDefinition[]);
      } catch (error) {
        console.error("--- ERREUR DÉTAILLÉE ATTRAPÉE DANS fetchTags ---", error);
        setFetchError(error);
        toast({ title: "Erreur de chargement des tags", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, [toast]);

  const seedTagsDatabase = async () => {
    setIsSeeding(true);
    toast({ title: "Lancement du remplissage..." });
    try {
      const tagsRef = collection(db, 'tags');
      const q = query(tagsRef, limit(1));
      if (!(await getDocs(q)).empty) { toast({ title: "Opération annulée", description: "La collection 'tags' est déjà remplie.", variant: "destructive" }); return; }
      const uniqueTagsToSeed = calculateUniqueTags(mockBoardGames);
      for (const tag of uniqueTagsToSeed) { await addDoc(tagsRef, { name: tag.name, categoryKey: tag.categoryKey }); }
      toast({ title: "Remplissage terminé !", description: `${uniqueTagsToSeed.length} tags uniques ajoutés.` });
      await fetchTags();
    } catch (e) { toast({ title: "Erreur", variant: "destructive" }); }
    finally { setIsSeeding(false); }
  };

  const handleOpenAddTagDialog = () => { setNewTagNameInput(''); setNewTagCategoryInput(''); setNewCategoryNameInput(''); setIsCreatingNewCategory(false); setIsAddTagDialogOpen(true); };
  const handleConfirmAddTag = async () => { if (!newTagNameInput.trim() || !newTagCategoryInput) { toast({ title: "Champs requis", variant: "destructive" }); return; } let k=newTagCategoryInput; if(newTagCategoryInput===CREATE_NEW_CATEGORY_VALUE){if(!newCategoryNameInput.trim()){toast({title:"Nom de catégorie requis",variant:"destructive"});return}k=newCategoryNameInput.trim().toLowerCase().replace(/\s+/g,'-')}const e=tags.find(t=>t.name.toLowerCase()===newTagNameInput.trim().toLowerCase()&&t.categoryKey===k);if(e){toast({title:"Tag Existant",variant:"destructive"});return} setIsSubmitting(true); try { await addDoc(collection(db, 'tags'), { name: newTagNameInput.trim(), categoryKey: k }); toast({ title: "Tag Ajouté !" }); await fetchTags(); } catch (error) { toast({ title: "Erreur", variant: "destructive" }); } finally { setIsAddTagDialogOpen(false); setIsSubmitting(false); } };
  const handleStartEditTag = (tag: TagDefinition) => { setEditingTagKey(tag.id!); setEditedTagName(tag.name); setEditedTagCategory(tag.categoryKey); };
  const handleCancelEditTag = () => { setEditingTagKey(null); setEditedTagName(''); setEditedTagCategory(''); };
  const handleSaveTagEdit = async (originalTag: TagDefinition) => {
    if (!editedTagName.trim() || !originalTag.id) {
      toast({ title: "Le nom ne peut pas être vide.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    const batch = writeBatch(db);

    const newTagData = { name: editedTagName.trim(), categoryKey: originalTag.categoryKey };

    try {
      // Étape 1 : Préparer la mise à jour du tag lui-même
      const tagRef = doc(db, 'tags', originalTag.id);
      batch.update(tagRef, { name: newTagData.name });

      // Étape 2 : Préparer la mise à jour des jeux qui utilisent l'ancien tag
      const gamesRef = collection(db, 'games');
      const q = query(gamesRef, where("tags", "array-contains", { name: originalTag.name, categoryKey: originalTag.categoryKey }));
      const gamesToUpdateSnapshot = await getDocs(q);

      gamesToUpdateSnapshot.forEach(gameDoc => {
        const gameData = gameDoc.data() as BoardGame;
        const newTags = gameData.tags.map(t => 
          (t.name === originalTag.name && t.categoryKey === originalTag.categoryKey) ? newTagData : t
        );
        batch.update(doc(db, 'games', gameDoc.id), { tags: newTags });
      });

      // Étape 3 : Envoyer toutes les modifications à Firebase
      await batch.commit();

      // === DÉBUT DE LA CORRECTION : MISE À JOUR LOCALE ===
      // Au lieu d'appeler fetchTags(), on met à jour l'état local directement.
      setTags(prevTags => {
        const updatedTags = prevTags.map(t =>
            t.id === originalTag.id
                ? { ...t, name: newTagData.name }
                : t
        );
        // On re-trie le tableau pour que l'affichage reste cohérent
        return updatedTags.sort((a, b) => (String(a.categoryKey).localeCompare(String(b.categoryKey)) || a.name.localeCompare(b.name)));
      });
      // === FIN DE LA CORRECTION ===

      toast({ title: "Tag mis à jour partout !", description: `${gamesToUpdateSnapshot.size} jeu(x) ont été affecté(s).` });
      
    } catch (error) {
      console.error("Erreur de mise à jour en cascade:", error);
      toast({ title: "Erreur", description: "La mise à jour a échoué.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      handleCancelEditTag(); // On quitte le mode édition
    }
  };
  const handleDeleteTag = async (tag: TagDefinition) => { if (!tag.id) return; setIsSubmitting(true); try { await deleteDoc(doc(db, 'tags', tag.id)); toast({ title: "Tag Supprimé" }); await fetchTags(); } catch (error) { toast({ title: "Erreur", variant: "destructive" }); } finally { setIsSubmitting(false); } };
  
  const displayedManagedTags = useMemo(() => {
    let filtered = tags;
    if (adminTagSearchQuery) { filtered = filtered.filter(tag => tag.name.toLowerCase().includes(adminTagSearchQuery.toLowerCase())); }
    if (tagCategoryFilter !== 'all') { filtered = filtered.filter(tag => tag.categoryKey === tagCategoryFilter); }
    return filtered;
  }, [tags, tagCategoryFilter, adminTagSearchQuery]);

  if (isLoading) { return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>; }

  if (fetchError) {
    return (
        <Alert variant="destructive" className="m-4">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>Une erreur de chargement est survenue</AlertTitle>
            <AlertDescription>
                <p className="mb-2">Détails techniques :</p>
                <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-slate-950 p-4 font-mono text-xs text-white">
                  {JSON.stringify(fetchError, Object.getOwnPropertyNames(fetchError), 2)}
                </pre>
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div><CardTitle>Gestion des Tags</CardTitle><CardDescription>{tags.length} tag(s) dans la base de données.</CardDescription></div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Rechercher un tag..." className="pl-8 w-full h-9 text-sm" value={adminTagSearchQuery} onChange={(e) => setAdminTagSearchQuery(e.target.value)}/></div>
              <div className="w-full sm:w-48"><Select value={tagCategoryFilter} onValueChange={setTagCategoryFilter}><SelectTriggerPrimitive className="h-9 text-sm w-full"><SelectValue placeholder="Filtrer par catégorie" /></SelectTriggerPrimitive><SelectContent><SelectItem value="all">Toutes les catégories</SelectItem>{(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(catKey => (<SelectItem key={catKey} value={catKey}>{getTranslatedTagCategory(catKey)}</SelectItem>))}</SelectContent></Select></div>
              <Button onClick={handleOpenAddTagDialog} size="sm" className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" />Ajouter un Tag</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed p-4 rounded-lg">
            <h4 className="font-semibold text-sm">Outil de Développement</h4>
            <p className="text-xs text-muted-foreground mt-1">Remplit la collection `tags` avec les tags uniques des jeux locaux. Ne fonctionne que si la collection est vide.</p>
            <Button variant="secondary" size="sm" className="mt-2" onClick={seedTagsDatabase} disabled={isSeeding}>{isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Database className="mr-2 h-4 w-4"/>}{isSeeding ? 'Remplissage...' : 'Lancer le remplissage des Tags'}</Button>
          </div>
          {displayedManagedTags.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Nom du Tag</TableHead><TableHead>Catégorie</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {displayedManagedTags.map((tag) => {
                  const isEditing = editingTagKey === tag.id;
                  return (
                    <TableRow key={tag.id}>
                      <TableCell>{isEditing ? (<Input value={editedTagName} onChange={(e) => setEditedTagName(e.target.value)} className="h-8 text-sm"/>) : (tag.name)}</TableCell>
                      <TableCell>{isEditing ? (<Select value={editedTagCategory} onValueChange={(value) => setEditedTagCategory(value as TagCategoryKey)}><SelectTriggerPrimitive className="h-8 text-sm"><SelectValue /></SelectTriggerPrimitive><SelectContent>{(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(k=>(<SelectItem key={k} value={k}>{getTranslatedTagCategory(k)}</SelectItem>))}</SelectContent></Select>) : (<Badge variant="customColor" className={cn("font-normal text-xs", getTagCategoryColorClass(tag.categoryKey as TagCategoryKey))}>{getTranslatedTagCategory(tag.categoryKey)}</Badge>)}</TableCell>
                      <TableCell className="text-right">{isEditing ? (<><Button variant="ghost" size="icon" onClick={() => handleSaveTagEdit(tag)} disabled={isSubmitting} title="Sauvegarder"><CheckIcon className="h-4 w-4 text-green-600" /></Button><Button variant="ghost" size="icon" onClick={handleCancelEditTag} disabled={isSubmitting} title="Annuler"><X className="h-4 w-4 text-red-600" /></Button></>) : (<><Button variant="ghost" size="icon" onClick={() => handleStartEditTag(tag)}><Edit className="h-4 w-4" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" title="Supprimer"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer le tag ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible. Le tag sera supprimé de la liste maîtresse.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteTag(tag)} className="bg-destructive hover:bg-destructive/90">Confirmer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>)}</TableCell>
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
          <DialogHeader><DialogTitle>Ajouter un Nouveau Tag</DialogTitle><DialogDescription>Entrez le nom et sélectionnez ou créez une catégorie.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="new-tag-name" className="text-right">Nom</Label><Input id="new-tag-name" value={newTagNameInput} onChange={(e) => setNewTagNameInput(e.target.value)} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="new-tag-cat" className="text-right">Catégorie</Label><Select value={newTagCategoryInput} onValueChange={(v) => { setNewTagCategoryInput(v); setIsCreatingNewCategory(v === CREATE_NEW_CATEGORY_VALUE); if(v !== CREATE_NEW_CATEGORY_VALUE) setNewCategoryNameInput(''); }}><SelectTriggerPrimitive id="new-tag-cat" className="col-span-3 h-9"><SelectValue placeholder="Choisir" /></SelectTriggerPrimitive><SelectContent>{(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(k=>(<SelectItem key={k} value={k}>{getTranslatedTagCategory(k)}</SelectItem>))}<SelectItem value={CREATE_NEW_CATEGORY_VALUE}>-- Créer une nouvelle --</SelectItem></SelectContent></Select></div>
            {isCreatingNewCategory && (<div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="new-cat-name-input" className="text-right">Nv. Cat.</Label><Input id="new-cat-name-input" value={newCategoryNameInput} onChange={(e) => setNewCategoryNameInput(e.target.value)} className="col-span-3"/></div>)}
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setIsAddTagDialogOpen(false)}>Annuler</Button><Button type="button" onClick={handleConfirmAddTag} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Confirmer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
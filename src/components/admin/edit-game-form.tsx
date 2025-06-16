'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { BoardGame, Player } from '@/lib/types';
import { TAG_CATEGORY_DETAILS, type TagCategoryKey, getTranslatedTagCategory, getTagCategoryColorClass, type TagDefinition } from '@/lib/tag-categories';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Loader2, PlusCircle, Gamepad2, UploadCloud, Building, CalendarDays, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import NextImage from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';


const gameFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Le nom du jeu est requis." }),
  imageUrl: z.string().url({ message: 'Veuillez entrer une URL valide.' }).optional().or(z.literal('')),
  description: z.string().optional(),
  publisher: z.string().optional(),
  publicationYear: z.coerce.number().int().positive().min(1800).max(new Date().getFullYear() + 5).optional().or(z.literal('')).or(z.null()),
  tags: z.array(z.object({ name: z.string().min(1), categoryKey: z.custom<TagCategoryKey>() })).optional(),
});

export type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  gameToEdit?: BoardGame | null;
  onSave: (gameData: GameFormValues) => void;
  onCancel: () => void;
}

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export function EditGameForm({ gameToEdit, onSave, onCancel }: GameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addTagCategory, setAddTagCategory] = useState<TagCategoryKey | ''>('');
  const [addTagExistingName, setAddTagExistingName] = useState<string>('');
  const [addTagNewName, setAddTagNewName] = useState<string>('');
  const [allSystemTags, setAllSystemTags] = useState<TagDefinition[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);

  const isEditMode = !!gameToEdit && !!gameToEdit.id;

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: gameToEdit ? { id: gameToEdit.id, name: gameToEdit.name || '', imageUrl: gameToEdit.imageUrl || '', description: gameToEdit.description || '', publisher: gameToEdit.publisher || '', publicationYear: gameToEdit.publicationYear ?? null, tags: gameToEdit.tags || [] } : { name: '', imageUrl: '', description: '', publisher: '', publicationYear: null, tags: [] },
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({ control: form.control, name: "tags" });
  const currentImageUrl = form.watch('imageUrl');

  useEffect(() => {
    const fetchAllTags = async () => {
      setIsTagsLoading(true);
      try {
        const q = query(collection(db, 'tags'), orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
        setAllSystemTags(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TagDefinition[]);
      } catch (e) { toast({ title: "Erreur", description: "Impossible de charger les tags.", variant: "destructive" }); }
      finally { setIsTagsLoading(false); }
    };
    fetchAllTags();
  }, [toast]);

  const allSystemTagsByCategory = useMemo(() => {
    const categorized: Record<string, Set<string>> = {};
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => { categorized[key] = new Set<string>(); });
    allSystemTags.forEach(tag => { if (tag.categoryKey in categorized) categorized[tag.categoryKey].add(tag.name); });
    const result: Record<string, string[]> = {};
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => { result[key] = Array.from(categorized[key]).sort((a,b) => a.localeCompare(b, 'fr')); });
    return result as Record<TagCategoryKey, string[]>;
  }, [allSystemTags]);

  const availableExistingTagsForCategory = useMemo(() => {
    if (!addTagCategory) return [];
    const tagsInSystem = allSystemTagsByCategory[addTagCategory] || [];
    const currentTags = tagFields.filter(tf => tf.categoryKey === addTagCategory).map(tf => tf.name);
    return tagsInSystem.filter(tagName => !currentTags.includes(tagName));
  }, [addTagCategory, allSystemTagsByCategory, tagFields]);

  const handleAddTag = () => {
    if(!addTagCategory) return;
    let nameToAdd = addTagExistingName || addTagNewName.trim();
    if(!nameToAdd) return;
    if(!tagFields.find(t=>t.name.toLowerCase()===nameToAdd.toLowerCase()&&t.categoryKey===addTagCategory)) {
        appendTag({name:nameToAdd, categoryKey:addTagCategory});
        setAddTagNewName(''); setAddTagExistingName('');
    } else {
        form.setError("tags", {type:"manual", message:"Ce tag existe déjà."});
    }
  };

  async function onSubmit(values: GameFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(values);
    setIsSubmitting(false);
  }
  
  const handleCategoryChange = (v: string) => { setAddTagCategory(v as TagCategoryKey); setAddTagExistingName(''); setAddTagNewName(''); };
  const handleImageUploadClick = () => { fileInputRef.current?.click(); };
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file){if(file.size>MAX_IMAGE_SIZE_BYTES){toast({title:"Image trop volumineuse",variant:"destructive"});return}const r=new FileReader();r.onload=(e)=>{form.setValue('imageUrl',e.target?.result as string,{shouldValidate:true})};r.onerror=()=>{toast({title:"Erreur de lecture",variant:"destructive"})};r.readAsDataURL(file)}if(fileInputRef.current){fileInputRef.current.value=""}
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[90vh] overflow-y-auto pr-2">
        <FormItem>
          <FormLabel>Image du jeu</FormLabel>
          <div className="mt-2 space-y-3 flex flex-col items-center">
            <div className="w-full max-w-xs">
              <div className="relative w-full min-h-[10rem] bg-muted rounded-md overflow-hidden flex items-center justify-center border">
                {currentImageUrl ? (
                  <NextImage
                    key={currentImageUrl} // Ajout d'une clé pour forcer le re-rendu si l'URL change
                    src={currentImageUrl}
                    alt="Aperçu du jeu"
                    width={300}  // Largeur de base pour le calcul du ratio
                    height={200} // Hauteur de base pour le calcul du ratio
                    className="w-full h-auto object-contain" // Ces classes rendent l'image responsive et non coupée
                    data-ai-hint="board game box"
                    onError={(e) => {
                      console.error("Image load error in EditGameForm:", e.currentTarget.src);
                    }}
                  />
                ) : (
                  // On garde une hauteur fixe pour le placeholder pour que le layout ne saute pas
                  <div className="flex items-center justify-center h-40">
                    <Gamepad2 className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            <Button type="button" variant="outline" onClick={handleImageUploadClick} disabled={isSubmitting} className="sm:w-auto">
              <UploadCloud className="mr-2 h-4 w-4" />
              Charger une image
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept="image/*"
              className="hidden"
            />
            {form.formState.errors.imageUrl && (
              <FormMessage>{form.formState.errors.imageUrl.message}</FormMessage>
            )}
            <FormDescription>
              Chargez une image (max ${MAX_IMAGE_SIZE_MB}Mo). L'aperçu s'adaptera au format.
            </FormDescription>
          </div>
        </FormItem>
        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nom du jeu</FormLabel><FormControl><Input placeholder="Nom du jeu" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="publisher" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Building className="h-4 w-4"/>Éditeur (Optionnel)</FormLabel><FormControl><Input placeholder="Ex: Asmodee" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="publicationYear" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><CalendarDays className="h-4 w-4"/>Année (Optionnel)</FormLabel><FormControl><Input type="number" placeholder={`Ex: ${new Date().getFullYear()}`} {...field} onChange={e=>field.onChange(e.target.value===''?null:Number(e.target.value))} value={field.value??''} disabled={isSubmitting}/></FormControl><FormMessage/></FormItem> )}/>
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description (Optionnel)</FormLabel><FormControl><Textarea placeholder="Description du jeu" {...field} disabled={isSubmitting} className="min-h-[100px]" /></FormControl><FormMessage /></FormItem> )} />
        <FormItem><FormLabel>Tags Actuels</FormLabel>{tagFields.length > 0 ? (<div className="flex flex-wrap gap-2 mb-3 p-2 border rounded-md bg-muted/50">{tagFields.map((tag, i) => (<Badge key={tag.id} variant="customColor" className={cn("font-normal", getTagCategoryColorClass(tag.categoryKey))}><span className="font-semibold opacity-80">{getTranslatedTagCategory(tag.categoryKey)}:</span> {tag.name}<button type="button" onClick={()=>removeTag(i)} disabled={isSubmitting} className="ml-1.5 p-0.5"><XIcon className="h-3 w-3"/></button></Badge>))}</div>) : (<p className="text-sm text-muted-foreground mb-3">Aucun tag.</p>)}<FormLabel className="mt-4 mb-2 block">Ajouter un Tag</FormLabel><div className="flex flex-col sm:flex-row items-start gap-2"><div className="w-full sm:w-1/3"><FormLabel htmlFor="add-tag-cat" className="text-xs text-muted-foreground">Catégorie</FormLabel><Select value={addTagCategory} onValueChange={handleCategoryChange} disabled={isSubmitting}><SelectTrigger id="add-tag-cat" className="h-9"><SelectValue placeholder="Choisir" /></SelectTrigger><SelectContent>{(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(k=>(<SelectItem key={k} value={k}>{getTranslatedTagCategory(k)}</SelectItem>))}</SelectContent></Select></div><div className="flex-grow space-y-2 w-full sm:w-auto"><div><FormLabel htmlFor="add-tag-exist" className="text-xs text-muted-foreground">Tag existant</FormLabel><Select value={addTagExistingName} onValueChange={(v)=>{setAddTagExistingName(v);setAddTagNewName('')}} disabled={isSubmitting||!addTagCategory||isTagsLoading||availableExistingTagsForCategory.length===0}><SelectTrigger id="add-tag-exist" className="h-9"><SelectValue placeholder={isTagsLoading ? "Chargement..." : !addTagCategory ? "Catégorie d'abord" : "Choisir un tag"} /></SelectTrigger><SelectContent>{availableExistingTagsForCategory.map(n=>(<SelectItem key={n} value={n}>{n}</SelectItem>))}</SelectContent></Select></div><div className="relative"><p className="text-xs text-center text-muted-foreground my-1">OU</p><FormLabel htmlFor="add-tag-new" className="text-xs text-muted-foreground">Nouveau tag</FormLabel><Input id="add-tag-new" value={addTagNewName} onChange={(e)=>{setAddTagNewName(e.target.value);setAddTagExistingName('')}} placeholder="Nom du nouveau tag" disabled={isSubmitting||!addTagCategory} className="h-9"/></div></div><div className="self-end mt-2 sm:mt-0"><Button type="button" variant="outline" size="icon" onClick={handleAddTag} disabled={isSubmitting||!addTagCategory||(!addTagExistingName&&!addTagNewName.trim())} className="h-9 w-9 shrink-0" title="Ajouter le tag"><PlusCircle className="h-4 w-4"/></Button></div></div>{form.formState.errors.tags && (<FormMessage className="mt-2">{typeof form.formState.errors.tags.message==='string'?form.formState.errors.tags.message:'Erreur.'}</FormMessage>)}{form.formState.errors.root && (<FormMessage className="mt-2">{form.formState.errors.root.message}</FormMessage>)}</FormItem>
        <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Annuler</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting?(<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Sauvegarde...</>):(isEditMode?'Sauvegarder':'Ajouter le jeu')}</Button></div>
      </form>
    </Form>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { BoardGame, TagDefinition } from '@/lib/types';
import { TAG_CATEGORY_DETAILS, type TagCategoryKey, getTranslatedTagCategory, getTagCategoryColorClass } from '@/lib/tag-categories';
import { useState, useMemo, useRef } from 'react';
import { Loader2, PlusCircle, XCircle, Gamepad2, UploadCloud, Building, CalendarYear } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockBoardGames } from '@/lib/data';
import NextImage from 'next/image';
import { useToast } from "@/hooks/use-toast";

const gameFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Le nom du jeu est requis." }),
  imageUrl: z.string().refine(
    (val) => val === '' || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'),
    { message: "L'URL de l'image doit être une URL web valide ou une image chargée." }
  ).optional().or(z.literal('')),
  description: z.string().optional(),
  publisher: z.string().optional(),
  publicationYear: z.coerce
    .number({ invalid_type_error: "Veuillez entrer une année valide." })
    .int()
    .positive({ message: "L'année doit être positive." })
    .min(1800, { message: "L'année doit être après 1800." })
    .max(new Date().getFullYear() + 5, { message: `L'année ne peut excéder ${new Date().getFullYear() + 5}.`})
    .optional()
    .or(z.literal(''))
    .or(z.null()), // Permet null pour la réinitialisation correcte
  tags: z.array(z.object({
    name: z.string().min(1),
    categoryKey: z.custom<TagCategoryKey>((val) => Object.keys(TAG_CATEGORY_DETAILS).includes(val as string)),
  })).optional(),
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

  const isEditMode = !!gameToEdit && !!gameToEdit.id;

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: gameToEdit
      ? {
          id: gameToEdit.id,
          name: gameToEdit.name || '',
          imageUrl: gameToEdit.imageUrl || '',
          description: gameToEdit.description || '',
          publisher: gameToEdit.publisher || '',
          publicationYear: gameToEdit.publicationYear || null, // Utiliser null pour les valeurs par défaut
          tags: gameToEdit.tags || [],
        }
      : {
          name: '',
          imageUrl: '',
          description: '',
          publisher: '',
          publicationYear: null, // Utiliser null pour les valeurs par défaut
          tags: [],
        },
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const currentImageUrl = form.watch('imageUrl');

  const allSystemTagsByCategory = useMemo(() => {
    const categorized: Record<string, Set<string>> = {};
    (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => {
      categorized[key] = new Set<string>();
    });

    mockBoardGames.forEach(game => {
      game.tags?.forEach(tag => {
        if (tag.categoryKey in categorized) {
          categorized[tag.categoryKey].add(tag.name);
        }
      });
    });
    
    const result: Record<string, string[]> = {};
     (Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).forEach(key => {
      result[key] = Array.from(categorized[key]).sort((a,b) => a.localeCompare(b, 'fr'));
    });
    return result as Record<TagCategoryKey, string[]>;
  }, []);

  const availableExistingTagsForCategory = useMemo(() => {
    if (!addTagCategory) return [];
    const tagsInSystemForCategory = allSystemTagsByCategory[addTagCategory] || [];
    const currentTagsInFormForCategory = tagFields
      .filter(tf => tf.categoryKey === addTagCategory)
      .map(tf => tf.name);
    return tagsInSystemForCategory.filter(tagName => !currentTagsInFormForCategory.includes(tagName));
  }, [addTagCategory, allSystemTagsByCategory, tagFields]);


  const handleAddTag = () => {
    if (!addTagCategory) return; 

    let tagNameToAdd = '';
    if (addTagExistingName) {
      tagNameToAdd = addTagExistingName;
    } else if (addTagNewName.trim()) {
      tagNameToAdd = addTagNewName.trim();
    }

    if (!tagNameToAdd) return; 

    const existingTagInForm = tagFields.find(tag => tag.name.toLowerCase() === tagNameToAdd.toLowerCase() && tag.categoryKey === addTagCategory);
    if (!existingTagInForm) {
      appendTag({ name: tagNameToAdd, categoryKey: addTagCategory });
      setAddTagNewName('');
      setAddTagExistingName('');
    } else {
      form.setError("tags", { type: "manual", message: "Ce tag existe déjà pour ce jeu dans cette catégorie." });
    }
  };

  async function onSubmit(values: GameFormValues) {
    setIsSubmitting(true);
    const submissionValues = {
      ...values,
      imageUrl: values.imageUrl || '',
      publisher: values.publisher || '',
      publicationYear: values.publicationYear === '' ? undefined : values.publicationYear,
    };
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(submissionValues as GameFormValues); // Cast to ensure type compatibility
    setIsSubmitting(false);
  }
  
  const handleCategoryChange = (value: string) => {
    setAddTagCategory(value as TagCategoryKey);
    setAddTagExistingName(''); 
    setAddTagNewName(''); 
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast({
          title: "Image trop volumineuse",
          description: `La taille de l'image ne doit pas dépasser ${MAX_IMAGE_SIZE_MB}Mo.`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        form.setValue('imageUrl', dataUrl, { shouldValidate: true });
      };
      reader.onerror = () => {
        toast({
          title: "Erreur de lecture du fichier",
          description: "Impossible de lire l'image sélectionnée.",
          variant: "destructive",
        });
      }
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
        
        <FormItem>
          <FormLabel>Image du jeu</FormLabel>
          <div className="mt-2 space-y-3 flex flex-col items-center">
            <div className="w-full max-w-xs"> 
              <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden flex items-center justify-center"> 
                {currentImageUrl ? (
                  <NextImage
                    src={currentImageUrl}
                    alt="Aperçu du jeu"
                    width={300} 
                    height={200} 
                    className="w-full h-auto object-contain" 
                    data-ai-hint="board game box"
                    onError={(e) => {
                       console.error("Image load error in EditGameForm:", e.currentTarget.src);
                    }}
                  />
                ) : (
                  <Gamepad2 className="h-16 w-16 text-muted-foreground" />
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
              Chargez une image (max {MAX_IMAGE_SIZE_MB}Mo) ou laissez vide.
            </FormDescription>
          </div>
        </FormItem>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du jeu</FormLabel>
              <FormControl>
                <Input placeholder="Nom du jeu" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publisher"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" />Éditeur (Optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="Ex : Asmodee, Days of Wonder" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="publicationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><CalendarYear className="h-4 w-4 text-muted-foreground" />Année de publication (Optionnel)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder={`Ex : ${new Date().getFullYear()}`} 
                  {...field} 
                  onChange={event => field.onChange(event.target.value === '' ? null : Number(event.target.value))}
                  value={field.value === null ? '' : field.value ?? ''}
                  disabled={isSubmitting} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optionnel)</FormLabel>
              <FormControl>
                <Textarea placeholder="Description du jeu" {...field} disabled={isSubmitting} className="min-h-[100px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Tags Actuels du Jeu</FormLabel>
          {tagFields.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3 p-2 border rounded-md bg-muted/50">
              {tagFields.map((tag, index) => (
                <Badge
                  key={tag.id} 
                  variant="customColor"
                  className={cn("font-normal text-xs px-1.5 py-0.5", getTagCategoryColorClass(tag.categoryKey))}
                >
                  {getTranslatedTagCategory(tag.categoryKey)}: {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    disabled={isSubmitting}
                    className="ml-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
                    aria-label={`Retirer le tag ${tag.name}`}
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">Aucun tag pour ce jeu pour le moment.</p>
          )}
          
          <FormLabel className="mt-4 mb-2 block">Ajouter un Tag</FormLabel>
          <div className="flex flex-col sm:flex-row items-start gap-2">
            <div className="w-full sm:w-1/3">
              <FormLabel htmlFor="add-tag-category" className="text-xs text-muted-foreground">Catégorie</FormLabel>
              <Select
                value={addTagCategory}
                onValueChange={handleCategoryChange}
                disabled={isSubmitting}
              >
                <SelectTrigger id="add-tag-category" className="h-9">
                  <SelectValue placeholder="Choisir Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TAG_CATEGORY_DETAILS) as TagCategoryKey[]).map(key => (
                    <SelectItem key={key} value={key}>
                      {getTranslatedTagCategory(key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-grow space-y-2 w-full sm:w-auto">
              <div>
                <FormLabel htmlFor="add-tag-existing-name" className="text-xs text-muted-foreground">Choisir un tag existant</FormLabel>
                <Select
                  value={addTagExistingName}
                  onValueChange={(value) => { setAddTagExistingName(value); setAddTagNewName(''); }}
                  disabled={isSubmitting || !addTagCategory || availableExistingTagsForCategory.length === 0}
                >
                  <SelectTrigger id="add-tag-existing-name" className="h-9">
                    <SelectValue placeholder={!addTagCategory ? "Choisir catégorie d'abord" : availableExistingTagsForCategory.length === 0 ? "Aucun tag existant" : "Choisir un tag"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableExistingTagsForCategory.map(tagName => (
                      <SelectItem key={tagName} value={tagName}>
                        {tagName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                 <p className="text-xs text-center text-muted-foreground my-1">OU</p>
                <FormLabel htmlFor="add-tag-new-name" className="text-xs text-muted-foreground">Créer un nouveau tag</FormLabel>
                <Input
                  id="add-tag-new-name"
                  value={addTagNewName}
                  onChange={(e) => { setAddTagNewName(e.target.value); setAddTagExistingName(''); }}
                  placeholder="Nom du nouveau tag"
                  disabled={isSubmitting || !addTagCategory}
                  className="h-9"
                />
              </div>
            </div>
            
            <div className="self-end mt-2 sm:mt-0">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTag}
                disabled={isSubmitting || !addTagCategory || (!addTagExistingName && !addTagNewName.trim())}
                className="h-9 w-9 shrink-0"
                title="Ajouter le tag"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {form.formState.errors.tags && (
            <FormMessage className="mt-2">
              {typeof form.formState.errors.tags.message === 'string' ? form.formState.errors.tags.message : 'Erreur avec les tags.'}
            </FormMessage>
          )}
           {form.formState.errors.root && (
            <FormMessage className="mt-2">{form.formState.errors.root.message}</FormMessage>
          )}
        </FormItem>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              isEditMode ? 'Sauvegarder les modifications' : 'Ajouter le jeu'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

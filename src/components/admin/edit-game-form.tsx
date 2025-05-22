
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
import { useState }
from 'react';
import { Loader2, PlusCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const gameFormSchema = z.object({
  id: z.string().optional(), // Optional: not present for new games
  name: z.string().min(1, { message: "Le nom du jeu est requis." }),
  imageUrl: z.string().url({ message: "Veuillez entrer une URL d'image valide." }).or(z.literal('')),
  description: z.string().optional(),
  tags: z.array(z.object({
    name: z.string().min(1),
    categoryKey: z.custom<TagCategoryKey>((val) => Object.keys(TAG_CATEGORY_DETAILS).includes(val as string)),
  })).optional(),
});

export type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  gameToEdit?: BoardGame | null; // Optional: if null/undefined, it's "add" mode
  onSave: (gameData: GameFormValues) => void;
  onCancel: () => void;
}

export function EditGameForm({ gameToEdit, onSave, onCancel }: GameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<TagCategoryKey | ''>('');

  const isEditMode = !!gameToEdit;

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: gameToEdit
      ? {
          id: gameToEdit.id,
          name: gameToEdit.name || '',
          imageUrl: gameToEdit.imageUrl || '',
          description: gameToEdit.description || '',
          tags: gameToEdit.tags || [],
        }
      : {
          name: '',
          imageUrl: '',
          description: '',
          tags: [],
          // id is omitted for add mode
        },
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const handleAddTag = () => {
    if (newTagName.trim() && newTagCategory) {
      const existingTag = tagFields.find(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase() && tag.categoryKey === newTagCategory);
      if (!existingTag) {
        appendTag({ name: newTagName.trim(), categoryKey: newTagCategory });
        setNewTagName('');
        setNewTagCategory('');
      } else {
        console.warn("Tag already exists in this category");
      }
    }
  };

  async function onSubmit(values: GameFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(values);
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de l'image</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} disabled={isSubmitting} />
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
          <FormLabel>Tags</FormLabel>
          {tagFields.length > 0 && (
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
                    className="ml-1.5 rounded-full hover:bg-destructive/20 p-0.5"
                    aria-label={`Retirer le tag ${tag.name}`}
                  >
                    <XCircle className="h-3 w-3 text-destructive hover:text-destructive/80" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <FormLabel htmlFor="new-tag-name" className="text-xs text-muted-foreground">Nom du nouveau tag</FormLabel>
              <Input
                id="new-tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nom du tag"
                disabled={isSubmitting}
                className="h-9"
              />
            </div>
            <div className="w-2/5">
              <FormLabel htmlFor="new-tag-category" className="text-xs text-muted-foreground">Catégorie</FormLabel>
              <Select
                value={newTagCategory}
                onValueChange={(value) => setNewTagCategory(value as TagCategoryKey)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="new-tag-category" className="h-9">
                  <SelectValue placeholder="Catégorie" />
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
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddTag}
              disabled={isSubmitting || !newTagName.trim() || !newTagCategory}
              className="h-9 w-9 shrink-0"
              title="Ajouter le tag"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          <FormMessage>{form.formState.errors.tags?.message}</FormMessage>
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

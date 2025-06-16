// Fichier : src/components/admin/edit-user-form.tsx (FINAL ET SYNCHRONISÉ)

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Player, UserRole } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Loader2, User as UserIcon, Mail, Image as ImageIcon, Shield } from 'lucide-react';

// === Schéma Zod mis à jour avec les vrais noms de champs ===
const userFormSchema = z.object({
  uid: z.string(), // L'identifiant principal est uid
  displayName: z.string().min(1, { message: "Le nom est requis." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  photoURL: z.string().url({ message: "L'URL de l'avatar doit être une URL valide." }).optional().or(z.literal('')),
  role: z.enum(['Administrateur', 'Utilisateur'], { required_error: "Le rôle est requis." }),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface EditUserFormProps {
  userToEdit?: Player | null;
  onSave: (userData: UserFormValues) => void;
  onCancel: () => void;
}

export function EditUserForm({ userToEdit, onSave, onCancel }: EditUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!userToEdit && !!userToEdit.uid;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    // On pré-remplit le formulaire avec les bonnes données
    defaultValues: userToEdit
      ? {
          uid: userToEdit.uid,
          displayName: userToEdit.displayName || '',
          email: userToEdit.email || '',
          photoURL: userToEdit.photoURL || '',
          role: userToEdit.role || 'Utilisateur',
        }
      : {
          displayName: '', email: '', photoURL: '', role: 'Utilisateur',
        },
  });

  useEffect(() => {
    // Ce useEffect assure que le formulaire se réinitialise si l'utilisateur à éditer change
    if (userToEdit) {
      form.reset({
        uid: userToEdit.uid,
        displayName: userToEdit.displayName || '',
        email: userToEdit.email || '',
        photoURL: userToEdit.photoURL || '',
        role: userToEdit.role || 'Utilisateur',
      });
    }
  }, [userToEdit, form]);

  async function onSubmit(values: UserFormValues) {
    setIsSubmitting(true);
    // La logique de sauvegarde est gérée par le composant parent (users-tab.tsx)
    // On lui passe simplement les valeurs du formulaire
    await onSave(values);
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
        
        {/* On utilise `displayName` et `photoURL` dans le JSX */}
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><UserIcon className="h-4 w-4 text-muted-foreground" />Nom d'affichage</FormLabel>
              <FormControl><Input placeholder="Nom de l'utilisateur" {...field} disabled={isSubmitting} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />Adresse Email</FormLabel>
              <FormControl><Input type="email" placeholder="utilisateur@example.com" {...field} disabled /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photoURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground" />URL de l'Avatar (Optionnel)</FormLabel>
              <FormControl><Input placeholder="https://example.com/avatar.png" {...field} disabled={isSubmitting} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" />Rôle</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Joueur">Joueur</SelectItem>
                  <SelectItem value="Administrateur">Administrateur</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sauvegarde...</>) : (isEditMode ? 'Sauvegarder' : "Ajouter")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
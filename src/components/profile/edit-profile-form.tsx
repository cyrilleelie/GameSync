
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Player } from '@/lib/types';
import { Loader2, User, Image as ImageIcon, Gamepad2, CalendarDays } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit comporter au moins 2 caractères.' }),
  avatarUrl: z.string().url({ message: 'Veuillez entrer une URL valide pour l\'avatar ou laissez vide pour utiliser une image par défaut.' }).optional().or(z.literal('')),
  gamePreferences: z.string().optional(),
  availability: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  user: Player;
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { updateUserProfile, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      avatarUrl: user.avatarUrl || '',
      gamePreferences: user.gamePreferences?.join('\n') || '',
      availability: user.availability || '',
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setIsSubmitting(true);
    const gamePreferencesArray = values.gamePreferences
      ? values.gamePreferences.split('\n').map(pref => pref.trim()).filter(pref => pref !== '')
      : [];
    
    const avatarUrlOrDefault = values.avatarUrl || `https://placehold.co/100x100.png?text=${values.name.substring(0,1).toUpperCase()}`;

    const success = await updateUserProfile({
      ...values,
      avatarUrl: avatarUrlOrDefault,
      gamePreferences: gamePreferencesArray,
    });

    setIsSubmitting(false);

    if (success) {
      toast({
        title: 'Profil Mis à Jour !',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
      router.push('/profile');
      router.refresh(); // Pour s'assurer que la page de profil récupère les nouvelles données
    } else {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />Nom Complet</FormLabel>
              <FormControl>
                <Input placeholder="Votre nom complet" {...field} disabled={isSubmitting || authLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" />URL de l'Avatar (Optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="https://exemple.com/votre-avatar.png" {...field} disabled={isSubmitting || authLoading} />
              </FormControl>
              <FormDescription>
                Laissez vide pour utiliser une image générée à partir de vos initiales.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gamePreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-primary" />Préférences de Jeu</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Listez vos jeux préférés, un par ligne."
                  className="resize-y min-h-[100px]"
                  {...field}
                  disabled={isSubmitting || authLoading}
                />
              </FormControl>
              <FormDescription>
                Entrez chaque jeu ou type de jeu préféré sur une nouvelle ligne.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Disponibilité</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez vos disponibilités générales. Ex : Soirs de semaine, Weekends..."
                  className="resize-y min-h-[80px]"
                  {...field}
                  disabled={isSubmitting || authLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || authLoading}>
          {(isSubmitting || authLoading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer les Modifications'
          )}
        </Button>
      </form>
    </Form>
  );
}

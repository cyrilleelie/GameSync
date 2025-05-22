
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Player } from '@/lib/types';
import { mockBoardGames } from '@/lib/data';
import { Loader2, User, Image as ImageIcon, Gamepad2, CalendarDays, PlusCircle, XCircle, Archive, Gift } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit comporter au moins 2 caractères.' }),
  avatarUrl: z.string().url({ message: 'Veuillez entrer une URL valide pour l\'avatar ou laissez vide pour utiliser une image par défaut.' }).optional().or(z.literal('')),
  gamePreferences: z.array(z.string()).optional(), 
  ownedGames: z.array(z.string()).optional(),
  wishlist: z.array(z.string()).optional(),
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
  const [selectedGameToAdd, setSelectedGameToAdd] = useState<string>('');
  const [selectedOwnedGameToAdd, setSelectedOwnedGameToAdd] = useState<string>('');
  const [selectedWishlistGameToAdd, setSelectedWishlistGameToAdd] = useState<string>('');


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      avatarUrl: user.avatarUrl || '',
      gamePreferences: user.gamePreferences || [],
      ownedGames: user.ownedGames || [],
      wishlist: user.wishlist || [],
      availability: user.availability || '',
    },
  });

  const currentFavoriteGames = form.watch('gamePreferences') || [];
  const currentOwnedGames = form.watch('ownedGames') || [];
  const currentWishlistGames = form.watch('wishlist') || [];

  const handleAddFavoriteGame = () => {
    if (selectedGameToAdd && !currentFavoriteGames.includes(selectedGameToAdd)) {
      form.setValue('gamePreferences', [...currentFavoriteGames, selectedGameToAdd], { shouldValidate: true });
      setSelectedGameToAdd(''); 
    } else if (currentFavoriteGames.includes(selectedGameToAdd)) {
        toast({
            title: "Jeu déjà ajouté",
            description: `${selectedGameToAdd} est déjà dans vos favoris.`,
            variant: "default",
        });
    }
  };

  const handleRemoveFavoriteGame = (gameToRemove: string) => {
    form.setValue('gamePreferences', currentFavoriteGames.filter(game => game !== gameToRemove), { shouldValidate: true });
  };

  const handleAddOwnedGame = () => {
    if (selectedOwnedGameToAdd && !currentOwnedGames.includes(selectedOwnedGameToAdd)) {
      form.setValue('ownedGames', [...currentOwnedGames, selectedOwnedGameToAdd], { shouldValidate: true });
      setSelectedOwnedGameToAdd('');
    } else if (currentOwnedGames.includes(selectedOwnedGameToAdd)) {
        toast({
            title: "Jeu déjà ajouté",
            description: `${selectedOwnedGameToAdd} est déjà dans votre collection.`,
            variant: "default",
        });
    }
  };

  const handleRemoveOwnedGame = (gameToRemove: string) => {
    form.setValue('ownedGames', currentOwnedGames.filter(game => game !== gameToRemove), { shouldValidate: true });
  };

  const handleAddWishlistGame = () => {
    if (selectedWishlistGameToAdd && !currentWishlistGames.includes(selectedWishlistGameToAdd)) {
      form.setValue('wishlist', [...currentWishlistGames, selectedWishlistGameToAdd], { shouldValidate: true });
      setSelectedWishlistGameToAdd('');
    } else if (currentWishlistGames.includes(selectedWishlistGameToAdd)) {
        toast({
            title: "Jeu déjà ajouté",
            description: `${selectedWishlistGameToAdd} est déjà dans votre wishlist.`,
            variant: "default",
        });
    }
  };

  const handleRemoveWishlistGame = (gameToRemove: string) => {
    form.setValue('wishlist', currentWishlistGames.filter(game => game !== gameToRemove), { shouldValidate: true });
  };


  async function onSubmit(values: ProfileFormValues) {
    setIsSubmitting(true);
    
    const avatarUrlOrDefault = values.avatarUrl || `https://placehold.co/100x100.png?text=${values.name.substring(0,1).toUpperCase()}`;

    const success = await updateUserProfile({
      ...values,
      avatarUrl: avatarUrlOrDefault,
    });

    setIsSubmitting(false);

    if (success) {
      toast({
        title: 'Profil Mis à Jour !',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
      router.push('/profile');
      router.refresh(); 
    } else {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  }

  const availableGamesForPrefs = mockBoardGames.filter(
    (bg) => !currentFavoriteGames.includes(bg.name)
  ).sort((a, b) => a.name.localeCompare(b.name));

  const availableGamesForOwned = mockBoardGames.filter(
    (bg) => !currentOwnedGames.includes(bg.name)
  ).sort((a, b) => a.name.localeCompare(b.name));

  const availableGamesForWishlist = mockBoardGames.filter(
    (bg) => !currentWishlistGames.includes(bg.name)
  ).sort((a, b) => a.name.localeCompare(b.name));


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

        <FormItem>
          <FormLabel className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-primary" />Jeux Favoris</FormLabel>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedGameToAdd} onValueChange={setSelectedGameToAdd}>
                <SelectTrigger disabled={isSubmitting || authLoading || availableGamesForPrefs.length === 0}>
                  <SelectValue placeholder={availableGamesForPrefs.length === 0 ? "Tous les jeux ajoutés" : "Sélectionnez un jeu"} />
                </SelectTrigger>
                <SelectContent>
                  {availableGamesForPrefs.map((game) => (
                    <SelectItem key={game.id} value={game.name}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddFavoriteGame}
                disabled={isSubmitting || authLoading || !selectedGameToAdd}
              >
                <PlusCircle className="h-5 w-5" />
                <span className="sr-only">Ajouter le jeu aux favoris</span>
              </Button>
            </div>
            <FormDescription>
              Ajoutez vos jeux de société préférés à votre liste.
            </FormDescription>
            <FormField
              control={form.control}
              name="gamePreferences"
              render={({ field }) => (
                <>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {field.value.map((gameName) => (
                        <Badge key={gameName} variant="secondary" className="flex items-center gap-1 pr-1">
                          {gameName}
                          <button
                            type="button"
                            onClick={() => handleRemoveFavoriteGame(gameName)}
                            disabled={isSubmitting || authLoading}
                            className="rounded-full hover:bg-destructive/20 disabled:pointer-events-none"
                            aria-label={`Retirer ${gameName} des favoris`}
                          >
                            <XCircle className="h-4 w-4 text-destructive hover:text-destructive/80" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </>
              )}
            />
          </div>
        </FormItem>

        <FormItem>
          <FormLabel className="flex items-center gap-2"><Archive className="h-5 w-5 text-primary" />Mes Jeux Possédés</FormLabel>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedOwnedGameToAdd} onValueChange={setSelectedOwnedGameToAdd}>
                <SelectTrigger disabled={isSubmitting || authLoading || availableGamesForOwned.length === 0}>
                  <SelectValue placeholder={availableGamesForOwned.length === 0 ? "Tous les jeux ajoutés" : "Sélectionnez un jeu"} />
                </SelectTrigger>
                <SelectContent>
                  {availableGamesForOwned.map((game) => (
                    <SelectItem key={game.id} value={game.name}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddOwnedGame}
                disabled={isSubmitting || authLoading || !selectedOwnedGameToAdd}
              >
                <PlusCircle className="h-5 w-5" />
                <span className="sr-only">Ajouter le jeu à ma collection</span>
              </Button>
            </div>
            <FormDescription>
              Ajoutez les jeux de société que vous possédez à votre collection.
            </FormDescription>
            <FormField
              control={form.control}
              name="ownedGames"
              render={({ field }) => (
                <>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {field.value.map((gameName) => (
                        <Badge key={gameName} variant="secondary" className="flex items-center gap-1 pr-1">
                          {gameName}
                          <button
                            type="button"
                            onClick={() => handleRemoveOwnedGame(gameName)}
                            disabled={isSubmitting || authLoading}
                            className="rounded-full hover:bg-destructive/20 disabled:pointer-events-none"
                            aria-label={`Retirer ${gameName} de la collection`}
                          >
                            <XCircle className="h-4 w-4 text-destructive hover:text-destructive/80" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </>
              )}
            />
          </div>
        </FormItem>

        <FormItem>
          <FormLabel className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" />Ma Wishlist</FormLabel>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedWishlistGameToAdd} onValueChange={setSelectedWishlistGameToAdd}>
                <SelectTrigger disabled={isSubmitting || authLoading || availableGamesForWishlist.length === 0}>
                  <SelectValue placeholder={availableGamesForWishlist.length === 0 ? "Tous les jeux ajoutés" : "Sélectionnez un jeu"} />
                </SelectTrigger>
                <SelectContent>
                  {availableGamesForWishlist.map((game) => (
                    <SelectItem key={game.id} value={game.name}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddWishlistGame}
                disabled={isSubmitting || authLoading || !selectedWishlistGameToAdd}
              >
                <PlusCircle className="h-5 w-5" />
                <span className="sr-only">Ajouter le jeu à ma wishlist</span>
              </Button>
            </div>
            <FormDescription>
              Ajoutez les jeux de société que vous aimeriez acquérir.
            </FormDescription>
            <FormField
              control={form.control}
              name="wishlist"
              render={({ field }) => (
                <>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {field.value.map((gameName) => (
                        <Badge key={gameName} variant="secondary" className="flex items-center gap-1 pr-1">
                          {gameName}
                          <button
                            type="button"
                            onClick={() => handleRemoveWishlistGame(gameName)}
                            disabled={isSubmitting || authLoading}
                            className="rounded-full hover:bg-destructive/20 disabled:pointer-events-none"
                            aria-label={`Retirer ${gameName} de la wishlist`}
                          >
                            <XCircle className="h-4 w-4 text-destructive hover:text-destructive/80" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </>
              )}
            />
          </div>
        </FormItem>

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

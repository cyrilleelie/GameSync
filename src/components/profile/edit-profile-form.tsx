// Fichier : src/components/profile/edit-profile-form.tsx (COMPLET ET CORRIGÉ)

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
import { Loader2, User, Image as ImageIcon, Gamepad2, CalendarDays, PlusCircle, Archive, Gift } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

// Helper icon
const XCircle = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg> );

// === Schéma mis à jour avec les vrais noms de champs de Firebase ===
const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Le nom doit comporter au moins 2 caractères.' }),
  photoURL: z.string().url({ message: 'Veuillez entrer une URL valide.' }).optional().or(z.literal('')),
  gamePreferences: z.array(z.string()).optional(), 
  ownedGames: z.array(z.string()).optional(),
  wishlist: z.array(z.string()).optional(),
  availability: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  userProfile: Player; // Renommé pour la clarté
}

export function EditProfileForm({ userProfile }: EditProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, updateUserProfileData, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Votre logique de gestion des listes de jeux est conservée
  const [selectedGameToAdd, setSelectedGameToAdd] = useState<string>('');
  const [selectedOwnedGameToAdd, setSelectedOwnedGameToAdd] = useState<string>('');
  const [selectedWishlistGameToAdd, setSelectedWishlistGameToAdd] = useState<string>('');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    // === CORRECTION DU PRÉ-REMPLISSAGE ===
    // On utilise les données du profil chargé pour initialiser le formulaire
    defaultValues: {
      displayName: userProfile.displayName || '',
      photoURL: userProfile.photoURL || '',
      gamePreferences: userProfile.gamePreferences || [],
      ownedGames: userProfile.ownedGames || [],
      wishlist: userProfile.wishlist || [],
      availability: userProfile.availability || '',
    },
  });

  // Vos fonctions pour gérer les listes de jeux sont conservées
  const currentFavoriteGames = form.watch('gamePreferences') || [];
  const handleAddFavoriteGame = () => { if (selectedGameToAdd && !currentFavoriteGames.includes(selectedGameToAdd)) { form.setValue('gamePreferences', [...currentFavoriteGames, selectedGameToAdd], { shouldValidate: true }); setSelectedGameToAdd(''); } };
  const handleRemoveFavoriteGame = (gameToRemove: string) => { form.setValue('gamePreferences', currentFavoriteGames.filter(game => game !== gameToRemove), { shouldValidate: true }); };
  const currentOwnedGames = form.watch('ownedGames') || [];
  const handleAddOwnedGame = () => { if (selectedOwnedGameToAdd && !currentOwnedGames.includes(selectedOwnedGameToAdd)) { form.setValue('ownedGames', [...currentOwnedGames, selectedOwnedGameToAdd], { shouldValidate: true }); setSelectedOwnedGameToAdd(''); } };
  const handleRemoveOwnedGame = (gameToRemove: string) => { form.setValue('ownedGames', currentOwnedGames.filter(game => game !== gameToRemove), { shouldValidate: true }); };
  const currentWishlistGames = form.watch('wishlist') || [];
  const handleAddWishlistGame = () => { if (selectedWishlistGameToAdd && !currentWishlistGames.includes(selectedWishlistGameToAdd)) { form.setValue('wishlist', [...currentWishlistGames, selectedWishlistGameToAdd], { shouldValidate: true }); setSelectedWishlistGameToAdd(''); } };
  const handleRemoveWishlistGame = (gameToRemove: string) => { form.setValue('wishlist', currentWishlistGames.filter(game => game !== gameToRemove), { shouldValidate: true }); };

  // === MISE À JOUR DE LA FONCTION onSubmit AVEC FIREBASE ===
  async function onSubmit(values: ProfileFormValues) {
    if (!currentUser) return;
    setIsSubmitting(true);
    
    try {
      // Étape 1: Mettre à jour le profil d'authentification (nom & photo) via le contexte
      await updateUserProfileData({
        displayName: values.displayName,
        photoURL: values.photoURL,
      });

      // Étape 2: Mettre à jour le document dans Firestore avec TOUTES les données
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: values.displayName,
        photoURL: values.photoURL,
        gamePreferences: values.gamePreferences,
        ownedGames: values.ownedGames,
        wishlist: values.wishlist,
        availability: values.availability,
      });

      toast({ title: 'Profil Mis à Jour !', description: 'Vos informations ont été enregistrées avec succès.' });
      router.push('/profile');
      router.refresh();

    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le profil. Veuillez réessayer.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Vos listes de jeux disponibles sont conservées
  const availableGamesForPrefs = mockBoardGames.filter((bg) => !currentFavoriteGames.includes(bg.name)).sort((a, b) => a.name.localeCompare(b.name));
  const availableGamesForOwned = mockBoardGames.filter((bg) => !currentOwnedGames.includes(bg.name)).sort((a, b) => a.name.localeCompare(b.name));
  const availableGamesForWishlist = mockBoardGames.filter((bg) => !currentWishlistGames.includes(bg.name)).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* --- LE JSX EST ADAPTÉ POUR UTILISER LES BONS NOMS DE CHAMPS --- */}
        <FormField control={form.control} name="displayName" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />Nom d'Affichage</FormLabel><FormControl><Input placeholder="Votre nom ou pseudo" {...field} disabled={isSubmitting || authLoading} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="photoURL" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" />URL de l'Avatar (Optionnel)</FormLabel><FormControl><Input placeholder="https://exemple.com/votre-avatar.png" {...field} disabled={isSubmitting || authLoading} /></FormControl><FormDescription>Laissez vide pour utiliser votre photo de profil Google.</FormDescription><FormMessage /></FormItem> )} />
        
        {/* Jeux Favoris */}
        <FormItem><FormLabel className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-primary" />Jeux Favoris</FormLabel><div className="space-y-3"><div className="flex items-center gap-2"><Select value={selectedGameToAdd} onValueChange={setSelectedGameToAdd}><SelectTrigger disabled={isSubmitting || authLoading || availableGamesForPrefs.length === 0}><SelectValue placeholder={availableGamesForPrefs.length === 0 ? "Tous les jeux ajoutés" : "Sélectionnez un jeu"} /></SelectTrigger><SelectContent>{availableGamesForPrefs.map((game) => ( <SelectItem key={game.id} value={game.name}>{game.name}</SelectItem> ))}</SelectContent></Select><Button type="button" variant="outline" size="icon" onClick={handleAddFavoriteGame} disabled={isSubmitting || authLoading || !selectedGameToAdd}><PlusCircle className="h-5 w-5" /><span className="sr-only">Ajouter le jeu aux favoris</span></Button></div><FormDescription>Ajoutez vos jeux de société préférés à votre liste.</FormDescription><FormField control={form.control} name="gamePreferences" render={({ field }) => (<>{field.value && field.value.length > 0 && (<div className="flex flex-wrap gap-2 pt-2">{field.value.map((gameName) => (<Badge key={gameName} variant="secondary" className="flex items-center gap-1 pr-1">{gameName}<button type="button" onClick={() => handleRemoveFavoriteGame(gameName)} disabled={isSubmitting || authLoading} className="rounded-full hover:bg-destructive/20 disabled:pointer-events-none" aria-label={`Retirer ${gameName} des favoris`}><XCircle className="h-4 w-4 text-destructive hover:text-destructive/80" /></button></Badge>))}</div>)}<FormMessage /></>)}/></div></FormItem>
        
        {/* Jeux Possédés */}
        <FormItem><FormLabel className="flex items-center gap-2"><Archive className="h-5 w-5 text-primary" />Mes Jeux Possédés</FormLabel><div className="space-y-3"><div className="flex items-center gap-2"><Select value={selectedOwnedGameToAdd} onValueChange={setSelectedOwnedGameToAdd}><SelectTrigger disabled={isSubmitting || authLoading || availableGamesForOwned.length === 0}><SelectValue placeholder={availableGamesForOwned.length === 0 ? "Tous les jeux ajoutés" : "Sélectionnez un jeu"} /></SelectTrigger><SelectContent>{availableGamesForOwned.map((game) => ( <SelectItem key={game.id} value={game.name}>{game.name}</SelectItem> ))}</SelectContent></Select><Button type="button" variant="outline" size="icon" onClick={handleAddOwnedGame} disabled={isSubmitting || authLoading || !selectedOwnedGameToAdd}><PlusCircle className="h-5 w-5" /><span className="sr-only">Ajouter le jeu à ma collection</span></Button></div><FormDescription>Ajoutez les jeux de société que vous possédez à votre collection.</FormDescription><FormField control={form.control} name="ownedGames" render={({ field }) => (<>{field.value && field.value.length > 0 && (<div className="flex flex-wrap gap-2 pt-2">{field.value.map((gameName) => (<Badge key={gameName} variant="secondary" className="flex items-center gap-1 pr-1">{gameName}<button type="button" onClick={() => handleRemoveOwnedGame(gameName)} disabled={isSubmitting || authLoading} className="rounded-full hover:bg-destructive/20 disabled:pointer-events-none" aria-label={`Retirer ${gameName} de la collection`}><XCircle className="h-4 w-4 text-destructive hover:text-destructive/80" /></button></Badge>))}</div>)}<FormMessage /></>)}/></div></FormItem>
        
        {/* Wishlist */}
        <FormItem><FormLabel className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" />Ma Wishlist</FormLabel><div className="space-y-3"><div className="flex items-center gap-2"><Select value={selectedWishlistGameToAdd} onValueChange={setSelectedWishlistGameToAdd}><SelectTrigger disabled={isSubmitting || authLoading || availableGamesForWishlist.length === 0}><SelectValue placeholder={availableGamesForWishlist.length === 0 ? "Tous les jeux ajoutés" : "Sélectionnez un jeu"} /></SelectTrigger><SelectContent>{availableGamesForWishlist.map((game) => ( <SelectItem key={game.id} value={game.name}>{game.name}</SelectItem> ))}</SelectContent></Select><Button type="button" variant="outline" size="icon" onClick={handleAddWishlistGame} disabled={isSubmitting || authLoading || !selectedWishlistGameToAdd}><PlusCircle className="h-5 w-5" /><span className="sr-only">Ajouter le jeu à ma wishlist</span></Button></div><FormDescription>Ajoutez les jeux de société que vous aimeriez acquérir.</FormDescription><FormField control={form.control} name="wishlist" render={({ field }) => (<>{field.value && field.value.length > 0 && (<div className="flex flex-wrap gap-2 pt-2">{field.value.map((gameName) => (<Badge key={gameName} variant="secondary" className="flex items-center gap-1 pr-1">{gameName}<button type="button" onClick={() => handleRemoveWishlistGame(gameName)} disabled={isSubmitting || authLoading} className="rounded-full hover:bg-destructive/20 disabled:pointer-events-none" aria-label={`Retirer ${gameName} de la wishlist`}><XCircle className="h-4 w-4 text-destructive hover:text-destructive/80" /></button></Badge>))}</div>)}<FormMessage /></>)}/></div></FormItem>

        {/* Disponibilité */}
        <FormField control={form.control} name="availability" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Disponibilité</FormLabel><FormControl><Textarea placeholder="Décrivez vos disponibilités générales. Ex : Soirs de semaine, Weekends..." className="resize-y min-h-[80px]" {...field} disabled={isSubmitting || authLoading} /></FormControl><FormMessage /></FormItem> )} />
        
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || authLoading}>
          {(isSubmitting || authLoading) ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>) : ('Enregistrer les Modifications')}
        </Button>
      </form>
    </Form>
  );
}
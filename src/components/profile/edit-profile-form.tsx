// Fichier : src/components/profile/edit-profile-form.tsx (COMPLET ET DÉFINITIF)

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
import type { Player, BoardGame, TagDefinition, TagCategoryKey } from '@/lib/types';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Loader2, PlusCircle, Gamepad2, UploadCloud, Building, CalendarDays, X as XIcon, User } from 'lucide-react';
import NextImage from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';


const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Le nom doit comporter au moins 2 caractères.' }),
  photoURL: z.string().url({ message: "Veuillez entrer une URL valide ou laissez vide." }).optional().or(z.literal('')),
  availability: z.string().optional(),
  gamePreferences: z.array(z.string()).optional(), 
  ownedGames: z.array(z.string()).optional(),
  wishlist: z.array(z.string()).optional(),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  userProfile: Player;
  onCancel: () => void;
}

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export function EditProfileForm({ userProfile, onCancel }: EditProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, updateUserProfileData, refreshUserProfile, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [allSystemGames, setAllSystemGames] = useState<BoardGame[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [selectedGameToAdd, setSelectedGameToAdd] = useState<string>('');
  const [selectedOwnedGameToAdd, setSelectedOwnedGameToAdd] = useState<string>('');
  const [selectedWishlistGameToAdd, setSelectedWishlistGameToAdd] = useState<string>('');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: userProfile.displayName || '', photoURL: userProfile.photoURL || '',
      gamePreferences: userProfile.gamePreferences || [], ownedGames: userProfile.ownedGames || [],
      wishlist: userProfile.wishlist || [], availability: userProfile.availability || '',
    },
  });

  // === LA VARIABLE MANQUANTE EST DÉFINIE ICI ===
  // `form.watch` permet de suivre la valeur d'un champ en temps réel
  const currentImageUrl = form.watch('photoURL');
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const gamesQuery = query(collection(db, 'games'), orderBy('name', 'asc'));
        const gamesSnapshot = await getDocs(gamesQuery);
        setAllSystemGames(gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BoardGame[]);
      } catch (error) { toast({ title: "Erreur", description: "Impossible de charger la liste des jeux.", variant: "destructive" }); }
      finally { setIsLoadingData(false); }
    };
    fetchData();
  }, [toast]);

  const currentFavoriteGames = form.watch('gamePreferences') || [];
  const handleAddFavoriteGame = () => { if (selectedGameToAdd && !currentFavoriteGames.includes(selectedGameToAdd)) { form.setValue('gamePreferences', [...currentFavoriteGames, selectedGameToAdd]); setSelectedGameToAdd(''); }};
  const handleRemoveFavoriteGame = (game: string) => { form.setValue('gamePreferences', currentFavoriteGames.filter(g => g !== game)); };
  
  const currentOwnedGames = form.watch('ownedGames') || [];
  const handleAddOwnedGame = () => { if (selectedOwnedGameToAdd && !currentOwnedGames.includes(selectedOwnedGameToAdd)) { form.setValue('ownedGames', [...currentOwnedGames, selectedOwnedGameToAdd]); const wishlist = form.getValues('wishlist')||[]; if(wishlist.includes(selectedOwnedGameToAdd)){form.setValue('wishlist', wishlist.filter(g=>g!==selectedOwnedGameToAdd)); toast({title:"Jeu déplacé", description:`${selectedOwnedGameToAdd} a été ajouté à la collection et retiré de la wishlist.`})} setSelectedOwnedGameToAdd(''); form.trigger(['ownedGames', 'wishlist']); }};
  const handleRemoveOwnedGame = (game: string) => { form.setValue('ownedGames', currentOwnedGames.filter(g => g !== game)); };

  const currentWishlistGames = form.watch('wishlist') || [];
  const handleAddWishlistGame = () => { if (selectedWishlistGameToAdd && !currentWishlistGames.includes(selectedWishlistGameToAdd)) { form.setValue('wishlist', [...currentWishlistGames, selectedWishlistGameToAdd]); setSelectedWishlistGameToAdd(''); }};
  const handleRemoveWishlistGame = (game: string) => { form.setValue('wishlist', currentWishlistGames.filter(g => g !== game)); };

  async function onSubmit(values: ProfileFormValues) {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await updateUserProfileData({ displayName: values.displayName, photoURL: values.photoURL });
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { ...values });
      await refreshUserProfile();
      toast({ title: 'Profil Mis à Jour !' });
      router.push('/profile');
    } catch (error) { toast({ title: 'Erreur', variant: 'destructive' }); } 
    finally { setIsSubmitting(false); }
  }
  
  const handleImageUploadClick = () => { fileInputRef.current?.click(); };
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { if (file.size > MAX_IMAGE_SIZE_BYTES) { toast({ title: "Image trop volumineuse", variant: "destructive" }); return; } const reader = new FileReader(); reader.onload = (e) => { form.setValue('photoURL', e.target?.result as string, { shouldValidate: true }); }; reader.readAsDataURL(file); } if (fileInputRef.current) { fileInputRef.current.value = ""; } };
  
  const availableGamesForPrefs = useMemo(() => allSystemGames.filter(g => !currentFavoriteGames.includes(g.name)), [allSystemGames, currentFavoriteGames]);
  const availableGamesForOwned = useMemo(() => allSystemGames.filter(g => !currentOwnedGames.includes(g.name)), [allSystemGames, currentOwnedGames]);
  const availableGamesForWishlist = useMemo(() => allSystemGames.filter(g => !currentWishlistGames.includes(g.name)), [allSystemGames, currentWishlistGames]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[90vh] overflow-y-auto pr-2">
        <FormItem>
          <FormLabel>Image du profil</FormLabel>
          <div className="mt-2 space-y-4 flex flex-col items-center">
            <div className="relative h-32 w-32 bg-muted rounded-full overflow-hidden flex items-center justify-center border shadow-inner">
              {currentImageUrl ? (
                <NextImage src={currentImageUrl} alt="Aperçu de l'avatar" fill sizes="128px" className="object-cover" />
              ) : (
                <User className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
                <Button type="button" variant="outline" size="sm" onClick={handleImageUploadClick} disabled={isSubmitting || authLoading}><UploadCloud className="mr-2 h-4 w-4" />Charger une image</Button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept="image/*" className="hidden"/>
                <FormField control={form.control} name="photoURL" render={({ field }) => (<FormControl><Input placeholder="Ou collez une URL d'image" {...field} disabled={isSubmitting || authLoading} className="text-center text-xs h-9" /></FormControl>)} />
            </div>
            <FormMessage>{form.formState.errors.photoURL?.message}</FormMessage>
            <FormDescription>Chargez une image (max {MAX_IMAGE_SIZE_MB}Mo) ou collez une URL.</FormDescription>
          </div>
        </FormItem>
        <FormField control={form.control} name="displayName" render={({ field }) => ( <FormItem><FormLabel>Nom d'Affichage</FormLabel><FormControl><Input placeholder="Votre nom ou pseudo" {...field} disabled={isSubmitting || authLoading} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="availability" render={({ field }) => ( <FormItem><FormLabel>Disponibilité</FormLabel><FormControl><Textarea placeholder="Décrivez vos disponibilités générales. Ex : Soirs de semaine, Weekends..." {...field} disabled={isSubmitting || authLoading} /></FormControl><FormMessage /></FormItem> )} />
        <FormItem>
          <FormLabel>Jeux Favoris</FormLabel>
          <div className="flex items-center gap-2"><Select value={selectedGameToAdd} onValueChange={setSelectedGameToAdd}><SelectTrigger disabled={isLoadingData}><SelectValue placeholder={isLoadingData ? "Chargement..." : "Ajouter un jeu..."} /></SelectTrigger><SelectContent>{availableGamesForPrefs.map(g=>(<SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>))}</SelectContent></Select><Button type="button" variant="outline" size="icon" onClick={handleAddFavoriteGame} disabled={!selectedGameToAdd || isSubmitting}><PlusCircle className="h-5 w-5" /></Button></div>
          <FormField control={form.control} name="gamePreferences" render={({ field }) => (<FormItem>{field.value && field.value.length > 0 && (<div className="flex flex-wrap gap-2 pt-2">{field.value.map(game => (<Badge key={game} variant="secondary">{game}<button type="button" onClick={() => handleRemoveFavoriteGame(game)} disabled={isSubmitting || authLoading} className="ml-1.5 p-0.5"><XIcon className="h-3 w-3"/></button></Badge>))}</div>)}<FormMessage /></FormItem>)} />
        </FormItem>
        <FormItem>
          <FormLabel>Ma Collection</FormLabel>
          <div className="flex items-center gap-2"><Select value={selectedOwnedGameToAdd} onValueChange={setSelectedOwnedGameToAdd}><SelectTrigger disabled={isLoadingData}><SelectValue placeholder={isLoadingData ? "Chargement..." : "Ajouter un jeu..."} /></SelectTrigger><SelectContent>{availableGamesForOwned.map(g=>(<SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>))}</SelectContent></Select><Button type="button" variant="outline" size="icon" onClick={handleAddOwnedGame} disabled={!selectedOwnedGameToAdd || isSubmitting}><PlusCircle className="h-5 w-5" /></Button></div>
          <FormField control={form.control} name="ownedGames" render={({ field }) => (<FormItem>{field.value && field.value.length > 0 && (<div className="flex flex-wrap gap-2 pt-2">{field.value.map(game => (<Badge key={game}>{game}<button type="button" onClick={() => handleRemoveOwnedGame(game)} disabled={isSubmitting || authLoading} className="ml-1.5 p-0.5"><XIcon className="h-3 w-3"/></button></Badge>))}</div>)}<FormMessage /></FormItem>)} />
        </FormItem>
        <FormItem>
          <FormLabel>Ma Wishlist</FormLabel>
          <div className="flex items-center gap-2"><Select value={selectedWishlistGameToAdd} onValueChange={setSelectedWishlistGameToAdd}><SelectTrigger disabled={isLoadingData}><SelectValue placeholder={isLoadingData ? "Chargement..." : "Ajouter un jeu..."} /></SelectTrigger><SelectContent>{availableGamesForWishlist.map(g=>(<SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>))}</SelectContent></Select><Button type="button" variant="outline" size="icon" onClick={handleAddWishlistGame} disabled={!selectedWishlistGameToAdd || isSubmitting}><PlusCircle className="h-5 w-5" /></Button></div>
          <FormField control={form.control} name="wishlist" render={({ field }) => (<FormItem>{field.value && field.value.length > 0 && (<div className="flex flex-wrap gap-2 pt-2">{field.value.map(game => (<Badge key={game}>{game}<button type="button" onClick={() => handleRemoveWishlistGame(game)} disabled={isSubmitting || authLoading} className="ml-1.5 p-0.5"><XIcon className="h-3 w-3"/></button></Badge>))}</div>)}<FormMessage /></FormItem>)} />
        </FormItem>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" disabled={isSubmitting || authLoading}>{ (isSubmitting || authLoading) ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>) : ('Enregistrer les Modifications')}</Button>
        </div>
      </form>
    </Form>
  );
}
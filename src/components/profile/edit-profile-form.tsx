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
import type { Player, BoardGame } from '@/lib/types';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Loader2, PlusCircle, Gamepad2, UploadCloud, Building, CalendarDays, Archive, Gift, X as XIcon, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import NextImage from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Le nom doit comporter au moins 2 caractères.' }),
  photoURL: z.string().url({ message: "Veuillez entrer une URL valide." }).optional().or(z.literal('')),
  bio: z.string().max(500, "La biographie est limitée à 500 caractères.").optional(),
  availability: z.string().max(200, "La disponibilité est limitée à 200 caractères.").optional(),
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

export default function EditProfileForm({ userProfile, onCancel }: EditProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, updateUserProfileData, refreshUserProfile, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [allSystemGames, setAllSystemGames] = useState<BoardGame[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

  const [selectedGameToAdd, setSelectedGameToAdd] = useState<string>('');
  const [selectedOwnedGameToAdd, setSelectedOwnedGameToAdd] = useState<string>('');
  const [selectedWishlistGameToAdd, setSelectedWishlistGameToAdd] = useState<string>('');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: userProfile.displayName || '',
      photoURL: userProfile.photoURL || '',
      bio: userProfile.bio || '',
      availability: userProfile.availability || '',
      gamePreferences: userProfile.gamePreferences || [],
      ownedGames: userProfile.ownedGames || [],
      wishlist: userProfile.wishlist || [],
    },
  });

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoadingGames(true);
      try {
        const q = query(collection(db, 'games'), orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
        setAllSystemGames(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BoardGame[]);
      } catch (e) {
        toast({ title: "Erreur", description: "Impossible de charger la liste des jeux.", variant: "destructive" });
      } finally {
        setIsLoadingGames(false);
      }
    };
    fetchGames();
  }, [toast]);

  const currentImageUrl = form.watch('photoURL');
  const currentFavoriteGames = form.watch('gamePreferences') || [];
  const currentOwnedGames = form.watch('ownedGames') || [];
  const currentWishlistGames = form.watch('wishlist') || [];

  const handleAddGameToList = (listName: 'gamePreferences' | 'ownedGames' | 'wishlist', gameToAdd: string, currentList: string[], resetter: React.Dispatch<React.SetStateAction<string>>) => { if (gameToAdd && !currentList.includes(gameToAdd)) { form.setValue(listName, [...currentList, gameToAdd]); resetter(''); }};
  const handleRemoveGameFromList = (listName: 'gamePreferences' | 'ownedGames' | 'wishlist', gameToRemove: string, currentList: string[]) => { form.setValue(listName, currentList.filter(g => g !== gameToRemove)); };
  const handleAddOwnedGame = () => { if (selectedOwnedGameToAdd && !currentOwnedGames.includes(selectedOwnedGameToAdd)) { form.setValue('ownedGames', [...currentOwnedGames, selectedOwnedGameToAdd]); const wishlist = form.getValues('wishlist')||[]; if(wishlist.includes(selectedOwnedGameToAdd)){form.setValue('wishlist', wishlist.filter(g=>g!==selectedOwnedGameToAdd)); toast({title:"Jeu déplacé", description:`${selectedOwnedGameToAdd} a été ajouté à la collection et retiré de la wishlist.`})} setSelectedOwnedGameToAdd(''); form.trigger(['ownedGames', 'wishlist']); }};

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4 max-h-[80vh] overflow-y-auto pr-4">
        <FormItem>
          <FormLabel>Image du profil</FormLabel>
          <div className="mt-2 space-y-4 flex flex-col items-center">
            <div className="relative h-32 w-32 bg-muted rounded-full overflow-hidden flex items-center justify-center border shadow-inner">{currentImageUrl ? (<NextImage src={currentImageUrl} alt="Aperçu de l'avatar" fill sizes="128px" className="object-cover" />) : (<UserIcon className="h-16 w-16 text-muted-foreground" />)}</div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
                <Button type="button" variant="outline" size="sm" onClick={handleImageUploadClick} disabled={isSubmitting || authLoading}><UploadCloud className="mr-2 h-4 w-4" />Charger une image</Button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept="image/*" className="hidden"/>
                <FormField control={form.control} name="photoURL" render={({ field }) => (<FormControl><Input placeholder="Ou collez une URL d'image" {...field} disabled={isSubmitting || authLoading} className="text-center text-xs h-9" /></FormControl>)} />
            </div>
            <FormMessage>{form.formState.errors.photoURL?.message}</FormMessage>
            <FormDescription>Chargez une image (max {MAX_IMAGE_SIZE_MB}Mo).</FormDescription>
          </div>
        </FormItem>
        <FormField control={form.control} name="displayName" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><UserIcon className="h-5 w-5 text-primary" />Nom d'Affichage</FormLabel><FormControl><Input placeholder="Votre nom ou pseudo" {...field} disabled={isSubmitting || authLoading} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="bio" render={({ field }) => ( <FormItem><FormLabel>Biographie</FormLabel><FormControl><Textarea placeholder="Parlez un peu de vous..." {...field} disabled={isSubmitting || authLoading} className="min-h-[100px]"/></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="availability" render={({ field }) => ( <FormItem><FormLabel>Disponibilité</FormLabel><FormControl><Textarea placeholder="Décrivez vos disponibilités générales..." {...field} disabled={isSubmitting || authLoading} /></FormControl><FormMessage /></FormItem> )} />
        
        <FormItem><FormLabel className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-primary" />Jeux Favoris</FormLabel><div className="flex items-center gap-2"><Select value={selectedGameToAdd} onValueChange={setSelectedGameToAdd}><SelectTrigger disabled={isLoadingGames || isSubmitting}><SelectValue placeholder={isLoadingGames?"Chargement...":"Ajouter un jeu"} /></SelectTrigger><SelectContent>{availableGamesForPrefs.map(g=>(<SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>))}</SelectContent></Select><Button type="button" variant="outline" size="icon" onClick={() => handleAddGameToList('gamePreferences', selectedGameToAdd, currentFavoriteGames, setSelectedGameToAdd)} disabled={!selectedGameToAdd || isSubmitting}><PlusCircle className="h-5 w-5" /></Button></div><div className="flex flex-wrap gap-1 pt-2">{currentFavoriteGames.map(game => (<Badge key={game} variant="secondary">{game}<button type="button" onClick={() => handleRemoveGameFromList('gamePreferences', game, currentFavoriteGames)} className="ml-1.5 p-0.5"><XIcon className="h-3 w-3"/></button></Badge>))}</div></FormItem>
        <FormItem><FormLabel className="flex items-center gap-2"><Archive className="h-5 w-5 text-primary" />Ma Collection</FormLabel><div className="flex items-center gap-2"><Select value={selectedOwnedGameToAdd} onValueChange={setSelectedOwnedGameToAdd}><SelectTrigger disabled={isLoadingGames || isSubmitting}><SelectValue placeholder={isLoadingGames?"Chargement...":"Ajouter un jeu"} /></SelectTrigger><SelectContent>{availableGamesForOwned.map(g=>(<SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>))}</SelectContent></Select><Button type="button" variant="outline" size="icon" onClick={handleAddOwnedGame} disabled={!selectedOwnedGameToAdd || isSubmitting}><PlusCircle className="h-5 w-5" /></Button></div><div className="flex flex-wrap gap-1 pt-2">{currentOwnedGames.map(game => (<Badge key={game}>{game}<button type="button" onClick={() => handleRemoveGameFromList('ownedGames', game, currentOwnedGames)} className="ml-1.5 p-0.5"><XIcon className="h-3 w-3"/></button></Badge>))}</div></FormItem>
        <FormItem><FormLabel className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" />Ma Wishlist</FormLabel><div className="flex items-center gap-2"><Select value={selectedWishlistGameToAdd} onValueChange={setSelectedWishlistGameToAdd}><SelectTrigger disabled={isLoadingGames || isSubmitting}><SelectValue placeholder={isLoadingGames?"Chargement...":"Ajouter un jeu"} /></SelectTrigger><SelectContent>{availableGamesForWishlist.map(g=>(<SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>))}</SelectContent></Select><Button type="button" variant="outline" size="icon" onClick={() => handleAddGameToList('wishlist', selectedWishlistGameToAdd, currentWishlistGames, setSelectedWishlistGameToAdd)} disabled={!selectedWishlistGameToAdd || isSubmitting}><PlusCircle className="h-5 w-5" /></Button></div><div className="flex flex-wrap gap-1 pt-2">{currentWishlistGames.map(game => (<Badge key={game}>{game}<button type="button" onClick={() => handleRemoveGameFromList('wishlist', game, currentWishlistGames)} className="ml-1.5 p-0.5"><XIcon className="h-3 w-3"/></button></Badge>))}</div></FormItem>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Annuler</Button>
          <Button type="submit" disabled={isSubmitting || authLoading}>{(isSubmitting || authLoading) ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sauvegarde...</>) : ('Enregistrer les Modifications')}</Button>
        </div>
      </form>
    </Form>
  );
}
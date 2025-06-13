// Fichier : src/components/sessions/create-session-form.tsx (DÉFINITIF)

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CalendarIcon, Gamepad2, MapPin, Users, Info, Clock, Loader2, Timer, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { GameSession, BoardGame } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';


const formSchema = z.object({
  gameName: z.string({ required_error: 'Veuillez sélectionner un jeu.'}).min(1, { message: 'Veuillez sélectionner un jeu.' }),
  gameImageUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().min(3, { message: 'Le lieu doit comporter au moins 3 caractères.' }),
  dateTime: z.date({ required_error: 'La date et l\'heure sont requises.' }),
  maxPlayers: z.coerce.number().min(2, { message: 'Il faut au moins 2 joueurs.' }).max(20, { message: 'Ne peut excéder 20 joueurs.' }),
  duration: z.string().optional(),
  description: z.string().optional(),
});

type SessionFormValues = z.infer<typeof formSchema>;

export function CreateSessionForm({ sessionToEdit }: { sessionToEdit?: GameSession }) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGameComboboxOpen, setIsGameComboboxOpen] = useState(false);
  const [allGames, setAllGames] = useState<BoardGame[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

  const isEditMode = !!sessionToEdit;

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameName: sessionToEdit?.gameName || '',
      gameImageUrl: sessionToEdit?.gameImageUrl || '',
      location: sessionToEdit?.location || '',
      dateTime: sessionToEdit?.dateTime ? new Date(sessionToEdit.dateTime) : undefined,
      maxPlayers: sessionToEdit?.maxPlayers || 4,
      duration: sessionToEdit?.duration || '',
      description: sessionToEdit?.description || '',
    },
  });

  const searchParams = useSearchParams(); // On récupère les paramètres d'URL de manière stable

  // === LA CORRECTION EST ICI ===
  // On utilise une liste de dépendances stable pour que l'effet ne s'exécute qu'une fois
  // ou si les paramètres d'URL changent (pour le pré-remplissage).
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoadingGames(true);
      try {
        const gamesRef = collection(db, "games");
        const q = query(gamesRef, orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        const gamesFromDb = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BoardGame[];
        setAllGames(gamesFromDb);
        
        const initialGameNameFromQuery = searchParams.get('gameName');
        if (!isEditMode && initialGameNameFromQuery) {
            const gameFromQuery = gamesFromDb.find(g => g.name === initialGameNameFromQuery);
            if (gameFromQuery) {
                form.setValue("gameName", gameFromQuery.name);
                form.setValue("gameImageUrl", gameFromQuery.imageUrl);
            }
        }
      } catch (e) {
        toast({ title: "Erreur", description: "Impossible de charger la liste des jeux.", variant: "destructive" });
      } finally {
        setIsLoadingGames(false);
      }
    };
    fetchGames();
  }, [isEditMode, searchParams, form, toast]); // Dépendances stables

  async function onSubmit(values: SessionFormValues) {
    if (!currentUser) { toast({title: "Erreur", description: "Vous devez être connecté.", variant: "destructive"}); return; }
    setIsSubmitting(true);
    
    try {
      if (isEditMode && sessionToEdit.id) {
        const sessionDocRef = doc(db, 'sessions', sessionToEdit.id);
        await updateDoc(sessionDocRef, { ...values, updatedAt: serverTimestamp() });
        toast({ title: 'Session Modifiée !' });
        router.push(`/sessions/${sessionToEdit.id}`);
      } else {
        const newSessionData = {
          ...values,
          gameImageUrl: values.gameImageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(values.gameName)}`,
          host: { id: currentUser.uid, name: currentUser.displayName || '', avatarUrl: currentUser.photoURL || '' },
          currentPlayers: [{ id: currentUser.uid, name: currentUser.displayName || '', avatarUrl: currentUser.photoURL || '' }],
          participantIds: [currentUser.uid],
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, 'sessions'), newSessionData);
        toast({ title: 'Session Créée !' });
        router.push('/sessions');
      }
      router.refresh();
    } catch (error) {
      toast({ title: 'Erreur', description: "L'opération a échoué.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const favoriteGames = allGames.filter(game => userProfile?.gamePreferences?.includes(game.name));
  const otherGames = allGames.filter(game => !userProfile?.gamePreferences?.includes(game.name));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField control={form.control} name="gameName" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-primary" />Nom du Jeu</FormLabel><Popover open={isGameComboboxOpen} onOpenChange={setIsGameComboboxOpen}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" aria-expanded={isGameComboboxOpen} className={cn("w-full justify-between", !field.value && "text-muted-foreground")} disabled={isSubmitting || isLoadingGames}>{isLoadingGames ? "Chargement..." : (field.value || "Sélectionnez un jeu")}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Rechercher..." /><CommandList><CommandEmpty>Aucun jeu.</CommandEmpty>{favoriteGames.length > 0 && <CommandGroup heading="Favoris">{favoriteGames.map((game) => (<CommandItem value={game.name} key={game.id} onSelect={() => { form.setValue("gameName", game.name); form.setValue("gameImageUrl", game.imageUrl); setIsGameComboboxOpen(false); }}><Check className={cn("mr-2 h-4 w-4", game.name === field.value ? "opacity-100" : "opacity-0")}/>{game.name}</CommandItem>))}</CommandGroup>}{otherGames.length > 0 && <CommandGroup heading="Autres jeux">{otherGames.map((game) => (<CommandItem value={game.name} key={game.id} onSelect={() => { form.setValue("gameName", game.name); form.setValue("gameImageUrl", game.imageUrl); setIsGameComboboxOpen(false); }}><Check className={cn("mr-2 h-4 w-4", game.name === field.value ? "opacity-100" : "opacity-0")}/>{game.name}</CommandItem>))}</CommandGroup>}</CommandList></Command></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="location" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Lieu</FormLabel><FormControl><Input placeholder="Ex : Chez moi" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField control={form.control} name="dateTime" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel className="flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary" />Date et Heure</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground')} disabled={isSubmitting}>{field.value ? format(field.value, 'PPP HH:mm', { locale: fr }) : <span>Choisissez une date</span>}<Clock className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={(date) => {if (date) { const currentTime = field.value || new Date(); date.setHours(currentTime.getHours()); date.setMinutes(currentTime.getMinutes()); field.onChange(date);} else { field.onChange(undefined);}}} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } locale={fr}/><div className="p-3 border-t border-border"><Input type="time" defaultValue={field.value ? format(field.value, 'HH:mm') : undefined} onChange={(e) => { const [hours, minutes] = e.target.value.split(':').map(Number); const newDate = field.value ? new Date(field.value) : new Date(); if (!isNaN(hours) && !isNaN(minutes)) { newDate.setHours(hours, minutes); field.onChange(newDate);}}} disabled={isSubmitting}/></div></PopoverContent></Popover><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="maxPlayers" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Joueurs Max</FormLabel><FormControl><Input type="number" placeholder="Ex : 4" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="duration" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Timer className="h-5 w-5 text-primary" />Durée (Opt.)</FormLabel><FormControl><Input placeholder="Ex : 2-3 heures" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Info className="h-5 w-5 text-primary" />Description (Opt.)</FormLabel><FormControl><Textarea placeholder="Détails sur la session..." className="resize-none" {...field} disabled={isSubmitting}/></FormControl><FormDescription>Infos utiles pour les participants.</FormDescription><FormMessage /></FormItem>)} />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
                Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Sauvegarde...' : (isEditMode ? 'Sauvegarder les modifications' : 'Créer la Session')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
// Fichier : src/components/sessions/create-session-form.tsx (COMPLET ET FINAL)

'use client';

// Imports de React et Next.js
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Imports pour la logique
import { useAuth } from '@/contexts/auth-context';
import type { GameSession } from '@/lib/types';
import { mockBoardGames, getBoardGameByName } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Imports des composants UI
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"; // Import qui manquait
import { Loader2, User, Image as ImageIcon, Gamepad2, CalendarIcon, MapPin, Clock, Users, Info, Timer, ChevronsUpDown, Check, PlusCircle } from 'lucide-react'; // Import de CalendarIcon ajouté


const XCircle = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg> );

const formSchema = z.object({
  gameName: z.string({ required_error: 'Veuillez sélectionner un jeu.'}).min(1, { message: 'Veuillez sélectionner un jeu.' }),
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
  const [isMounted, setIsMounted] = useState(false);
  const [isGameComboboxOpen, setIsGameComboboxOpen] = useState(false);
  const searchParams = useSearchParams();
  const initialGameNameFromQuery = searchParams.get('gameName');

  useEffect(() => { setIsMounted(true); }, []);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { gameName: initialGameNameFromQuery || '', location: '', maxPlayers: 4, duration: '', description: '' },
  });
  
  useEffect(() => {
    if (isMounted) {
      if (sessionToEdit) {
        form.reset({
          gameName: sessionToEdit.gameName, location: sessionToEdit.location,
          dateTime: typeof sessionToEdit.dateTime === 'string' ? parseISO(sessionToEdit.dateTime) : sessionToEdit.dateTime,
          maxPlayers: sessionToEdit.maxPlayers, duration: sessionToEdit.duration || '', description: sessionToEdit.description || '',
        });
      } else {
        const currentFormGameName = form.getValues('gameName');
        if (initialGameNameFromQuery && currentFormGameName !== initialGameNameFromQuery) {
          form.setValue('gameName', initialGameNameFromQuery);
        }
      }
    }
  }, [sessionToEdit, form, isMounted, initialGameNameFromQuery ]);

  async function onSubmit(values: SessionFormValues) {
    setIsSubmitting(true);
    if (!currentUser) {
      toast({ title: "Utilisateur non connecté", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const selectedGame = getBoardGameByName(values.gameName);
    const gameImageUrl = selectedGame ? selectedGame.imageUrl : 'https://placehold.co/300x200.png?text=Image+Non+Disponible';
    
    try {
      const newSessionData = {
        ...values,
        gameImageUrl: gameImageUrl,
        host: { id: currentUser.uid, name: currentUser.displayName || currentUser.email || '', avatarUrl: currentUser.photoURL || '' },
        currentPlayers: [{ id: currentUser.uid, name: currentUser.displayName || currentUser.email || '', avatarUrl: currentUser.photoURL || '' }],
        participantIds: [currentUser.uid],
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'sessions'), newSessionData);
      toast({ title: 'Session Créée !', description: `Votre session pour ${values.gameName} a été créée.` });
      router.push('/sessions');
    } catch (error) {
      console.error("Erreur de création de session:", error);
      toast({ title: 'Erreur', description: 'Impossible de créer la session.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleRemoveFavoriteGame = (game: string) => form.setValue('gamePreferences', form.getValues('gamePreferences')?.filter(g => g !== game) || []);

  if (!isMounted) {
    return (<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>);
  }

  const favoriteGameNames = userProfile?.gamePreferences || [];
  const favoriteGames = mockBoardGames.filter(game => favoriteGameNames.includes(game.name));
  const otherGames = mockBoardGames.filter(game => !favoriteGameNames.includes(game.name));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField control={form.control} name="gameName" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-primary" />Nom du Jeu</FormLabel><Popover open={isGameComboboxOpen} onOpenChange={setIsGameComboboxOpen}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" aria-expanded={isGameComboboxOpen} className={cn("w-full justify-between",!field.value && "text-muted-foreground")} disabled={isSubmitting}>{field.value? mockBoardGames.find((game) => game.name === field.value)?.name: "Sélectionnez un jeu"}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Rechercher un jeu..." /><CommandList><CommandEmpty>Aucun jeu trouvé.</CommandEmpty>{favoriteGames.length > 0 && (<CommandGroup heading="Favoris">{favoriteGames.map((game) => (<CommandItem value={game.name} key={game.id} onSelect={() => {form.setValue("gameName", game.name); setIsGameComboboxOpen(false);}}><Check className={cn("mr-2 h-4 w-4", game.name === field.value? "opacity-100": "opacity-0")}/>{game.name}</CommandItem>))}</CommandGroup>)}{otherGames.length > 0 && (<CommandGroup heading={favoriteGames.length > 0 ? "Autres Jeux" : "Jeux"}>{otherGames.map((game) => (<CommandItem value={game.name} key={game.id} onSelect={() => {form.setValue("gameName", game.name); setIsGameComboboxOpen(false);}}><Check className={cn("mr-2 h-4 w-4", game.name === field.value? "opacity-100": "opacity-0")}/>{game.name}</CommandItem>))}</CommandGroup>)}{favoriteGames.length === 0 && otherGames.length === 0 && mockBoardGames.length > 0 && (mockBoardGames.sort((a,b) => a.name.localeCompare(b.name)).map((game) => (<CommandItem value={game.name} key={game.id} onSelect={() => {form.setValue("gameName", game.name); setIsGameComboboxOpen(false);}}><Check className={cn("mr-2 h-4 w-4", game.name === field.value ? "opacity-100" : "opacity-0")}/>{game.name}</CommandItem>)))}</CommandList></Command></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="location" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Lieu</FormLabel><FormControl><Input placeholder="Ex : Chez moi, Nom du café local" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><FormField control={form.control} name="dateTime" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel className="flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary" />Date et Heure</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground')} disabled={isSubmitting}>{field.value ? (format(field.value, 'PPP HH:mm', { locale: fr })): (<span>Choisissez une date</span>)}<Clock className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={(date) => {if (date) { const currentTime = field.value || new Date(); date.setHours(currentTime.getHours()); date.setMinutes(currentTime.getMinutes()); field.onChange(date);} else { field.onChange(undefined);}}} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } locale={fr}/><div className="p-3 border-t border-border"><Input type="time" defaultValue={field.value ? format(field.value, 'HH:mm') : undefined} onChange={(e) => { const [hours, minutes] = e.target.value.split(':').map(Number); const newDate = field.value ? new Date(field.value) : new Date(); if (!isNaN(hours) && !isNaN(minutes)) { newDate.setHours(hours, minutes); field.onChange(newDate);}}} disabled={isSubmitting}/></div></PopoverContent></Popover><FormMessage /></FormItem>)} /><FormField control={form.control} name="maxPlayers" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Joueurs Max</FormLabel><FormControl><Input type="number" placeholder="Ex : 4" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} /></div>
        <FormField control={form.control} name="duration" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Timer className="h-5 w-5 text-primary" />Durée (Optionnel)</FormLabel><FormControl><Input placeholder="Ex : 2-3 heures, Environ 90 min" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-2"><Info className="h-5 w-5 text-primary" />Description (Optionnel)</FormLabel><FormControl><Textarea placeholder="Détails supplémentaires sur la session..." className="resize-none" {...field} disabled={isSubmitting}/></FormControl><FormDescription>Fournissez toute information supplémentaire.</FormDescription><FormMessage /></FormItem>)} />
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}><>{isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création en cours...</>) : ('Créer la Session')}</></Button>
      </form>
    </Form>
  );
}
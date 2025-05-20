
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Gamepad2, MapPin, Users, Info, Clock, Loader2, Timer } from 'lucide-react'; // Ajout de Timer
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { mockBoardGames, getBoardGameByName, mockSessions } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import type { GameSession } from '@/lib/types';

const LOCALSTORAGE_SESSIONS_KEY = 'gameSessions';

const formSchema = z.object({
  gameName: z.string({ required_error: 'Veuillez sélectionner un jeu.'}).min(1, { message: 'Veuillez sélectionner un jeu.' }),
  location: z.string().min(3, { message: 'Le lieu doit comporter au moins 3 caractères.' }),
  dateTime: z.date({ required_error: 'La date et l\'heure sont requises.' }),
  maxPlayers: z.coerce.number().min(2, { message: 'Il faut au moins 2 joueurs.' }).max(20, { message: 'Ne peut excéder 20 joueurs.' }),
  duration: z.string().optional(), // Nouveau champ pour la durée
  description: z.string().optional(),
});

type SessionFormValues = z.infer<typeof formSchema>;

interface CreateSessionFormProps {
  sessionToEdit?: GameSession;
}

export function CreateSessionForm({ sessionToEdit }: CreateSessionFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: sessionToEdit ? {
      gameName: sessionToEdit.gameName,
      location: sessionToEdit.location,
      dateTime: typeof sessionToEdit.dateTime === 'string' ? parseISO(sessionToEdit.dateTime) : sessionToEdit.dateTime,
      maxPlayers: sessionToEdit.maxPlayers,
      duration: sessionToEdit.duration || '',
      description: sessionToEdit.description || '',
    } : {
      gameName: '',
      location: '',
      maxPlayers: 4,
      duration: '',
      description: '',
    },
  });
  
  useEffect(() => {
    if (sessionToEdit && isMounted) {
      form.reset({
        gameName: sessionToEdit.gameName,
        location: sessionToEdit.location,
        dateTime: typeof sessionToEdit.dateTime === 'string' ? parseISO(sessionToEdit.dateTime) : sessionToEdit.dateTime,
        maxPlayers: sessionToEdit.maxPlayers,
        duration: sessionToEdit.duration || '',
        description: sessionToEdit.description || '',
      });
    }
  }, [sessionToEdit, form, isMounted]);


  async function onSubmit(values: SessionFormValues) {
    setIsSubmitting(true);

    if (!currentUser) {
      toast({
        title: "Utilisateur non connecté",
        description: "Vous devez être connecté pour " + (sessionToEdit ? "modifier" : "créer") + " une session.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (sessionToEdit && sessionToEdit.host.id !== currentUser.id) {
        toast({
            title: "Action non autorisée",
            description: "Vous n'êtes pas l'hôte de cette session.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const selectedGame = getBoardGameByName(values.gameName);
    const gameImageUrl = selectedGame ? selectedGame.imageUrl : 'https://placehold.co/300x200.png?text=Image+Non+Disponible';
    
    try {
      const existingSessionsString = localStorage.getItem(LOCALSTORAGE_SESSIONS_KEY);
      let sessionsToUpdate: GameSession[] = [];
      if (existingSessionsString) {
        const parsedSessions = JSON.parse(existingSessionsString);
        if (Array.isArray(parsedSessions)) {
           sessionsToUpdate = parsedSessions.map((s: any) => ({...s, dateTime: new Date(s.dateTime)}));
        } else {
           sessionsToUpdate = mockSessions.map(s => ({...s, dateTime: new Date(s.dateTime)})); // Fallback
        }
      } else {
        sessionsToUpdate = mockSessions.map(s => ({...s, dateTime: new Date(s.dateTime)})); // Fallback
      }

      if (sessionToEdit) { // Editing existing session
        const sessionIndex = sessionsToUpdate.findIndex(s => s.id === sessionToEdit.id);
        if (sessionIndex > -1) {
          sessionsToUpdate[sessionIndex] = {
            ...sessionsToUpdate[sessionIndex],
            gameName: values.gameName,
            gameImageUrl: gameImageUrl,
            dateTime: values.dateTime,
            location: values.location,
            maxPlayers: values.maxPlayers,
            duration: values.duration, // Ajout de la durée
            description: values.description,
            category: selectedGame ? selectedGame.category : sessionsToUpdate[sessionIndex].category,
          };
          toast({
            title: 'Session Modifiée !',
            description: `Votre session pour ${values.gameName} a été modifiée avec succès.`,
            variant: 'default',
          });
          router.push(`/sessions/${sessionToEdit.id}`);
        } else {
          throw new Error("Session à modifier non trouvée.");
        }
      } else { // Creating new session
        const newSessionId = 's' + Date.now();
        const newSession: GameSession = {
          id: newSessionId,
          gameName: values.gameName,
          gameImageUrl: gameImageUrl,
          dateTime: values.dateTime,
          location: values.location,
          maxPlayers: values.maxPlayers,
          currentPlayers: [currentUser], 
          host: currentUser,
          duration: values.duration, // Ajout de la durée
          description: values.description,
          category: selectedGame ? selectedGame.category : undefined,
        };
        sessionsToUpdate.push(newSession);
        toast({
          title: 'Session Créée !',
          description: `Votre session pour ${values.gameName} a été créée avec succès.`,
          variant: 'default',
        });
        router.push('/sessions');
      }
      
      localStorage.setItem(LOCALSTORAGE_SESSIONS_KEY, JSON.stringify(sessionsToUpdate));
      router.refresh(); // Important to reflect changes if other pages are reading from localStorage

    } catch (error) {
      console.error("Failed to save session to localStorage", error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
      toast({
        title: 'Erreur de Sauvegarde',
        description: `Impossible d'enregistrer la session localement. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (!isMounted && sessionToEdit) { // Prevent rendering form with incorrect defaults before effect runs
    return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="gameName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-primary" />Nom du Jeu</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un jeu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockBoardGames.map((game) => (
                    <SelectItem key={game.id} value={game.name}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Lieu</FormLabel>
              <FormControl>
                <Input placeholder="Ex : Chez moi, Nom du café local" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="dateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary" />Date et Heure</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          format(field.value, 'PPP HH:mm', { locale: fr })
                        ) : (
                          <span>Choisissez une date et une heure</span>
                        )}
                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                            const currentTime = field.value || new Date();
                            date.setHours(currentTime.getHours());
                            date.setMinutes(currentTime.getMinutes());
                            field.onChange(date);
                        } else {
                            field.onChange(undefined);
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                      locale={fr}
                    />
                    <div className="p-3 border-t border-border">
                       <Input 
                          type="time"
                          defaultValue={field.value ? format(field.value, 'HH:mm') : undefined}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = field.value ? new Date(field.value) : new Date();
                            if (!isNaN(hours) && !isNaN(minutes)) {
                              newDate.setHours(hours, minutes);
                              field.onChange(newDate);
                            }
                          }}
                          disabled={isSubmitting}
                       />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxPlayers"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Joueurs Max</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ex : 4" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Timer className="h-5 w-5 text-primary" />Durée (Optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="Ex : 2-3 heures, Environ 90 min" {...field} disabled={isSubmitting} />
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
              <FormLabel className="flex items-center gap-2"><Info className="h-5 w-5 text-primary" />Description (Optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Détails supplémentaires sur la session, ex : règles maison, snacks, niveau d'expérience."
                  className="resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Fournissez toute information supplémentaire dont les participants pourraient avoir besoin.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {sessionToEdit ? 'Modification en cours...' : 'Création en cours...'}
            </>
          ) : (
            sessionToEdit ? 'Modifier la Session' : 'Créer la Session'
          )}
        </Button>
      </form>
    </Form>
  );
}

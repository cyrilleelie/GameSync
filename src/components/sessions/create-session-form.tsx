
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
import { CalendarIcon, Gamepad2, MapPin, Users, Info, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale'; // Import French locale
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; 
import { useState } from 'react';
import { mockBoardGames, getBoardGameByName } from '@/lib/data';


const formSchema = z.object({
  gameName: z.string({ required_error: 'Veuillez sélectionner un jeu.'}).min(1, { message: 'Veuillez sélectionner un jeu.' }),
  location: z.string().min(3, { message: 'Le lieu doit comporter au moins 3 caractères.' }),
  dateTime: z.date({ required_error: 'La date et l\'heure sont requises.' }),
  maxPlayers: z.coerce.number().min(2, { message: 'Il faut au moins 2 joueurs.' }).max(20, { message: 'Ne peut excéder 20 joueurs.' }),
  description: z.string().optional(),
});

export function CreateSessionForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameName: '',
      location: '',
      maxPlayers: 4,
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const selectedGame = getBoardGameByName(values.gameName);
    const gameImageUrl = selectedGame ? selectedGame.imageUrl : 'https://placehold.co/300x200.png?text=Image+Non+Disponible';

    // In a real app, you would save this session data including gameImageUrl
    console.log('Formulaire soumis:', { ...values, gameImageUrl });
    
    toast({
      title: 'Session Créée !',
      description: `Votre session pour ${values.gameName} a été créée avec succès.`,
      variant: 'default',
    });
    setIsSubmitting(false);
    // In a real app, you might get an ID back and redirect to the session page
    // For now, we don't add to mockSessions, so this new session won't appear immediately unless page is reloaded with new static data
    router.push('/sessions'); 
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Input placeholder="Ex : Chez moi, Nom du café local" {...field} />
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
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                      locale={fr} // Add French locale to Calendar
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
                  <Input type="number" placeholder="Ex : 4" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          {isSubmitting ? 'Création en cours...' : 'Créer la Session'}
        </Button>
      </form>
    </Form>
  );
}

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
import { useState, useEffect } from 'react';
import { suggestSessionDetails, type SuggestSessionDetailsOutput } from '@/ai/flows/suggest-session-details';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2, CheckCircle, Lightbulb, Gamepad2, UserCheck, MapPinned } from "lucide-react";
import type { SmartSchedulerFormData } from '@/lib/types';

const formSchema = z.object({
  gameName: z.string().min(2, { message: 'Le nom du jeu doit comporter au moins 2 caractères.' }),
  playerPreferences: z.string().min(10, { message: 'Veuillez entrer les préférences des joueurs.' }),
  suggestedLocations: z.string().min(3, { message: 'Veuillez entrer au moins un lieu suggéré.' }),
});

export function SmartSchedulerForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestSessionDetailsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<SmartSchedulerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameName: '',
      playerPreferences: '',
      suggestedLocations: '',
    },
  });

  async function onSubmit(values: SmartSchedulerFormData) {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const playerPreferencesArray = values.playerPreferences.split('\n').filter(line => line.trim() !== '');
      const suggestedLocationsArray = values.suggestedLocations.split('\n').filter(line => line.trim() !== '');

      const result = await suggestSessionDetails({
        gameName: values.gameName,
        playerPreferences: playerPreferencesArray,
        suggestedLocations: suggestedLocationsArray,
      });
      setSuggestion(result);
      toast({
        title: 'Suggestion Prête !',
        description: "L'IA a fourni une suggestion de planification.",
        variant: 'default',
      });
    } catch (e) {
      console.error('Erreur lors de la récupération de la suggestion :', e);
      const errorMessage = e instanceof Error ? e.message : 'Une erreur inconnue est survenue.';
      setError(`Échec de l'obtention de la suggestion : ${errorMessage}`);
      toast({
        title: 'Erreur',
        description: `Impossible de récupérer la suggestion. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="gameName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-primary"/>Nom du Jeu</FormLabel>
                <FormControl>
                  <Input placeholder="Ex : Gloomhaven" {...field} />
                </FormControl>
                <FormDescription>
                  Le jeu de société que vous prévoyez de jouer.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="playerPreferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary"/>Préférences des Joueurs</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Entrez les préférences de chaque joueur sur une nouvelle ligne. Ex :&#10;Alice : Préfère les week-ends, disponible après 18h.&#10;Bob : N'importe quel soir de semaine, pas les lundis."
                    className="resize-y min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Incluez la disponibilité, les lieux préférés ou toute autre contrainte pour chaque joueur.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="suggestedLocations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><MapPinned className="h-5 w-5 text-primary"/>Lieux Suggérés</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Listez les lieux possibles, chacun sur une nouvelle ligne. Ex :&#10;Chez moi&#10;Le magasin de jeux local&#10;Centre communautaire"
                    className="resize-y min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                 <FormDescription>
                  Fournissez une liste de lieux potentiels pour la session de jeu.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Obtention de la suggestion...
              </>
            ) : (
              'Suggérer une Session Optimale'
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="mt-8">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestion && (
        <Alert className="mt-8 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700 font-semibold">Suggestion IA Reçue !</AlertTitle>
          <AlertDescription className="space-y-3 mt-2">
            <p><strong>Heure Suggérée :</strong> {suggestion.suggestedTime}</p>
            <p><strong>Lieu Suggéré :</strong> {suggestion.suggestedLocation}</p>
            <div className="pt-2">
              <p className="font-medium flex items-center gap-1"><Lightbulb className="h-4 w-4 text-yellow-500"/>Raisonnement :</p>
              <p className="text-sm text-muted-foreground italic pl-1 border-l-2 border-muted ml-2">{suggestion.reasoning}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

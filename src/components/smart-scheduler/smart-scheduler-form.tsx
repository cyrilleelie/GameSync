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
  gameName: z.string().min(2, { message: 'Game name must be at least 2 characters.' }),
  playerPreferences: z.string().min(10, { message: 'Please enter player preferences.' }),
  suggestedLocations: z.string().min(3, { message: 'Please enter at least one suggested location.' }),
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
        title: 'Suggestion Ready!',
        description: 'AI has provided a scheduling suggestion.',
        variant: 'default',
      });
    } catch (e) {
      console.error('Error fetching suggestion:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get suggestion: ${errorMessage}`);
      toast({
        title: 'Error',
        description: `Could not fetch suggestion. ${errorMessage}`,
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
                <FormLabel className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-primary"/>Game Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Gloomhaven" {...field} />
                </FormControl>
                <FormDescription>
                  The board game you plan to play.
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
                <FormLabel className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary"/>Player Preferences</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter each player's preferences on a new line. E.g.,&#10;Alice: Prefers weekends, available after 6 PM.&#10;Bob: Any weekday evening, not Mondays."
                    className="resize-y min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include availability, preferred locations, or any other constraints for each player.
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
                <FormLabel className="flex items-center gap-2"><MapPinned className="h-5 w-5 text-primary"/>Suggested Locations</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List possible locations, each on a new line. E.g.,&#10;My place&#10;The Friendly LGS&#10;Community Center"
                    className="resize-y min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                 <FormDescription>
                  Provide a list of potential venues for the game session.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Suggestion...
              </>
            ) : (
              'Suggest Optimal Session'
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="mt-8">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestion && (
        <Alert className="mt-8 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700 font-semibold">AI Suggestion Received!</AlertTitle>
          <AlertDescription className="space-y-3 mt-2">
            <p><strong>Suggested Time:</strong> {suggestion.suggestedTime}</p>
            <p><strong>Suggested Location:</strong> {suggestion.suggestedLocation}</p>
            <div className="pt-2">
              <p className="font-medium flex items-center gap-1"><Lightbulb className="h-4 w-4 text-yellow-500"/>Reasoning:</p>
              <p className="text-sm text-muted-foreground italic pl-1 border-l-2 border-muted ml-2">{suggestion.reasoning}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

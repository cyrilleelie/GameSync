'use server';

/**
 * @fileOverview AI flow for suggesting optimal times and locations for a gaming session.
 *
 * - suggestSessionDetails - A function that handles the session details suggestion process.
 * - SuggestSessionDetailsInput - The input type for the suggestSessionDetails function.
 * - SuggestSessionDetailsOutput - The return type for the suggestSessionDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSessionDetailsInputSchema = z.object({
  gameName: z.string().describe('The name of the board game to be played.'),
  playerPreferences: z
    .array(z.string())
    .describe(
      'An array of strings, each representing a player and their time and location preferences.'
    ),
  suggestedLocations: z
    .array(z.string())
    .describe(
      'An array of strings, each representing a location that can be suggested.'
    ),
});
export type SuggestSessionDetailsInput = z.infer<typeof SuggestSessionDetailsInputSchema>;

const SuggestSessionDetailsOutputSchema = z.object({
  suggestedTime: z.string().describe('The suggested time for the gaming session.'),
  suggestedLocation: z.string().describe('The suggested location for the gaming session.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the suggested time and location.'),
});
export type SuggestSessionDetailsOutput = z.infer<typeof SuggestSessionDetailsOutputSchema>;

export async function suggestSessionDetails(
  input: SuggestSessionDetailsInput
): Promise<SuggestSessionDetailsOutput> {
  return suggestSessionDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSessionDetailsPrompt',
  input: {schema: SuggestSessionDetailsInputSchema},
  output: {schema: SuggestSessionDetailsOutputSchema},
  prompt: `You are an AI assistant helping to organize board game sessions.

  Based on the game to be played, player preferences, and possible locations, suggest an optimal time and location for the session.

  Consider all player preferences when suggesting the time and location, and explain your reasoning.

  Game Name: {{{gameName}}}
  Player Preferences:
  {{#each playerPreferences}}
  - {{{this}}}
  {{/each}}
  Suggested Locations:
  {{#each suggestedLocations}}
  - {{{this}}}
  {{/each}}
  \n  Output your suggested time, location, and reasoning.`,
});

const suggestSessionDetailsFlow = ai.defineFlow(
  {
    name: 'suggestSessionDetailsFlow',
    inputSchema: SuggestSessionDetailsInputSchema,
    outputSchema: SuggestSessionDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

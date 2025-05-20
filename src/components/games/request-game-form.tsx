
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DialogFooter, DialogClose } from '@/components/ui/dialog'; // Import DialogClose for cancel button

const requestGameFormSchema = z.object({
  gameName: z.string().min(1, { message: "Le nom du jeu est requis." }),
  publisher: z.string().optional(),
  year: z.coerce
    .number({ invalid_type_error: "Veuillez entrer une année valide." })
    .int()
    .positive({ message: "L'année doit être positive." })
    .min(1900, { message: "L'année doit être après 1900." })
    .max(new Date().getFullYear() + 5, { message: `L'année ne peut excéder ${new Date().getFullYear() + 5}.`})
    .optional()
    .or(z.literal('')), // Allow empty string for optional number
  reason: z.string().optional(),
});

type RequestGameFormValues = z.infer<typeof requestGameFormSchema>;

interface RequestGameFormProps {
  onSubmitSuccess: () => void;
}

export function RequestGameForm({ onSubmitSuccess }: RequestGameFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestGameFormValues>({
    resolver: zodResolver(requestGameFormSchema),
    defaultValues: {
      gameName: '',
      publisher: '',
      year: '',
      reason: '',
    },
  });

  async function onSubmit(values: RequestGameFormValues) {
    setIsSubmitting(true);
    console.log('Game request submitted:', values); // Simulate API call
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Demande Envoyée !',
      description: `Votre demande pour le jeu "${values.gameName}" a été envoyée. Nous l'examinerons bientôt.`,
    });
    setIsSubmitting(false);
    form.reset(); // Reset form fields
    onSubmitSuccess(); // Close the dialog
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="gameName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du jeu <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Ex : Les Colons de Catane" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publisher"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Éditeur (Optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="Ex : Asmodee, Days of Wonder" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Année de publication (Optionnel)</FormLabel>
              <FormControl>
                <Input type="number" placeholder={`Ex : ${new Date().getFullYear()}`} {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pourquoi demandez-vous ce jeu ? (Optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex : C'est un classique que beaucoup apprécieraient, un ami me l'a recommandé..."
                  className="resize-y min-h-[80px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Annuler
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Soumettre la demande'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

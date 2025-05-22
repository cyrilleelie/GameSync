
'use client';

import type { BoardGame } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gamepad2, Archive, ArchiveX, Loader2, CalendarPlus, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface GameCardProps {
  game: BoardGame;
}

export function GameCard({ game }: GameCardProps) {
  const { currentUser, updateUserProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const isOwned = useMemo(() => {
    if (!currentUser || !currentUser.ownedGames) return false;
    return currentUser.ownedGames.includes(game.name);
  }, [currentUser, game.name]);

  const handleToggleOwnedGame = async (action: 'add' | 'remove') => {
    if (!currentUser) {
      toast({
        title: "Connexion Requise",
        description: "Veuillez vous connecter pour gérer votre collection.",
        variant: "destructive"
      });
      return;
    }
    if (authLoading || isProcessing) return;

    setIsProcessing(true);
    const currentOwnedGames = currentUser.ownedGames || [];
    let newOwnedGames: string[];
    let successMessage: string;
    let toastTitle: string;

    if (action === 'remove') {
      newOwnedGames = currentOwnedGames.filter(g => g !== game.name);
      toastTitle = "Jeu Retiré";
      successMessage = `"${game.name}" a été retiré de votre collection.`;
    } else { // action === 'add'
      newOwnedGames = [...currentOwnedGames, game.name];
      toastTitle = "Jeu Ajouté";
      successMessage = `"${game.name}" a été ajouté à votre collection !`;
    }

    const success = await updateUserProfile({ ownedGames: newOwnedGames });

    if (success) {
      toast({
        title: toastTitle,
        description: successMessage,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre collection. Veuillez réessayer.",
        variant: "destructive",
      });
    }
    setIsProcessing(false);
    setIsConfirmDialogOpen(false); // Ensure dialog is closed after action
  };

  const handleAttemptRemoveGame = () => {
    if (localStorage.getItem('gameSync_skipGameRemoveConfirmation') === 'true') {
      handleToggleOwnedGame('remove');
    } else {
      setDontAskAgain(false); // Reset checkbox state each time dialog is about to open
      setIsConfirmDialogOpen(true);
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4 relative">
        {currentUser && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-card/70 p-1 rounded-md">
            {isOwned ? (
              <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={authLoading || isProcessing}
                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  aria-label={`Retirer ${game.name} de la collection`}
                  title={`Retirer ${game.name} de la collection`}
                  onClick={handleAttemptRemoveGame}
                >
                  {isProcessing && !isConfirmDialogOpen ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArchiveX className="h-5 w-5" />
                  )}
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir retirer "{game.name}" de votre collection ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex items-center space-x-2 py-3">
                    <Checkbox
                      id={`dont-ask-again-${game.id}`}
                      checked={dontAskAgain}
                      onCheckedChange={(checked) => setDontAskAgain(Boolean(checked))}
                      disabled={isProcessing}
                    />
                    <Label htmlFor={`dont-ask-again-${game.id}`} className="text-sm font-normal text-muted-foreground">
                      Ne plus me demander (pour cette session)
                    </Label>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel 
                      onClick={() => setIsConfirmDialogOpen(false)} 
                      disabled={isProcessing}
                    >
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => {
                        if (dontAskAgain) {
                          localStorage.setItem('gameSync_skipGameRemoveConfirmation', 'true');
                        }
                        handleToggleOwnedGame('remove');
                      }} 
                      disabled={isProcessing}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Supprimer'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggleOwnedGame('add')}
                disabled={authLoading || isProcessing}
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
                aria-label={`Ajouter ${game.name} à la collection`}
                title={`Ajouter ${game.name} à la collection`}
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Archive className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10" aria-label={`Créer une session pour ${game.name}`} title={`Créer une session pour ${game.name}`}>
              <Link href={`/sessions/create?gameName=${encodeURIComponent(game.name)}`} prefetch>
                <CalendarPlus className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
        {game.imageUrl ? (
          <div className="relative h-48 w-full mb-4 rounded-t-md overflow-hidden bg-muted">
            <Image
              src={game.imageUrl}
              alt={`Boîte du jeu ${game.name}`}
              layout="fill"
              objectFit="cover"
              data-ai-hint="board game box"
            />
          </div>
        ) : (
           <div className="relative h-48 w-full mb-4 rounded-t-md overflow-hidden bg-muted flex items-center justify-center">
            <Gamepad2 className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            {game.name}
          </CardTitle>
          {game.tags && game.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {game.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {game.description && (
            <p className="text-sm text-foreground line-clamp-3">{game.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

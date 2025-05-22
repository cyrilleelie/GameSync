
'use client';

import React, { useState, useMemo } from 'react';
import type { BoardGame, Player } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gamepad2, Archive, ArchiveX, Loader2, CalendarPlus, XCircle, Gift, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: BoardGame;
  showCreateSessionButton?: boolean; // New prop
}

// Renamed original component
function GameCardComponent({ game, showCreateSessionButton = false }: GameCardProps) {
  const { currentUser, updateUserProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessingOwned, setIsProcessingOwned] = useState(false);
  const [isProcessingWishlist, setIsProcessingWishlist] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const isOwned = useMemo(() => {
    if (!currentUser || !currentUser.ownedGames) return false;
    return currentUser.ownedGames.includes(game.name);
  }, [currentUser, game.name]);

  const isInWishlist = useMemo(() => {
    if (!currentUser || !currentUser.wishlist) return false;
    return currentUser.wishlist.includes(game.name);
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
    if (authLoading || isProcessingOwned) return;

    setIsProcessingOwned(true);
    const currentOwnedGames = currentUser.ownedGames || [];
    let newOwnedGames: string[];
    let successMessage: string;
    let toastTitle: string;
    
    const updatedProfileData: Partial<Player> = {};

    if (action === 'remove') {
      newOwnedGames = currentOwnedGames.filter(g => g !== game.name);
      updatedProfileData.ownedGames = newOwnedGames;
      toastTitle = "Jeu Retiré";
      successMessage = `"${game.name}" a été retiré de votre collection.`;
    } else { // action === 'add'
      newOwnedGames = [...currentOwnedGames, game.name];
      updatedProfileData.ownedGames = newOwnedGames;
      toastTitle = "Jeu Ajouté";
      successMessage = `"${game.name}" a été ajouté à votre collection !`;

      // Check if game was in wishlist and remove it
      const currentWishlist = currentUser.wishlist || [];
      if (currentWishlist.includes(game.name)) {
        const newWishlist = currentWishlist.filter(gName => gName !== game.name);
        updatedProfileData.wishlist = newWishlist;
        toastTitle = "Jeu Ajouté & Retiré de la Wishlist";
        successMessage = `"${game.name}" a été ajouté à votre collection et retiré de votre wishlist.`;
      }
    }

    const success = await updateUserProfile(updatedProfileData);

    if (success) {
      toast({
        title: toastTitle,
        description: successMessage,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil. Veuillez réessayer.",
        variant: "destructive",
      });
    }
    setIsProcessingOwned(false);
    setIsConfirmDialogOpen(false);
  };

  const handleToggleWishlistGame = async () => {
    if (!currentUser) {
      toast({
        title: "Connexion Requise",
        description: "Veuillez vous connecter pour gérer votre wishlist.",
        variant: "destructive"
      });
      return;
    }
    if (authLoading || isProcessingWishlist) return;

    setIsProcessingWishlist(true);
    const currentWishlist = currentUser.wishlist || [];
    let newWishlist: string[];
    let successMessage: string;
    let toastTitle: string;

    if (isInWishlist) {
      newWishlist = currentWishlist.filter(gName => gName !== game.name);
      toastTitle = "Retiré de la Wishlist";
      successMessage = `"${game.name}" a été retiré de votre wishlist.`;
    } else {
      // Cannot add to wishlist if already owned
      if (isOwned) {
        toast({
          title: "Déjà Possédé",
          description: `"${game.name}" est déjà dans votre collection et ne peut pas être ajouté à la wishlist.`,
          variant: "default"
        });
        setIsProcessingWishlist(false);
        return;
      }
      newWishlist = [...currentWishlist, game.name];
      toastTitle = "Ajouté à la Wishlist";
      successMessage = `"${game.name}" a été ajouté à votre wishlist !`;
    }

    const success = await updateUserProfile({ wishlist: newWishlist });

    if (success) {
      toast({
        title: toastTitle,
        description: successMessage,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre wishlist. Veuillez réessayer.",
        variant: "destructive",
      });
    }
    setIsProcessingWishlist(false);
  };

  const handleAttemptRemoveGame = () => {
    if (localStorage.getItem('gameSync_skipGameRemoveConfirmation') === 'true') {
      handleToggleOwnedGame('remove');
    } else {
      setDontAskAgain(false);
      setIsConfirmDialogOpen(true);
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4 relative">
        <div className="relative h-48 w-full mb-4 rounded-t-md overflow-hidden bg-muted">
          {game.imageUrl ? (
            <Image
              src={game.imageUrl}
              alt={`Boîte du jeu ${game.name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint="board game box"
            />
          ) : (
             <div className="flex items-center justify-center h-full">
              <Gamepad2 className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          {currentUser && (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-card/20 p-1 rounded-md">
              {!isOwned && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleWishlistGame}
                  disabled={authLoading || isProcessingWishlist}
                  className={cn(
                    "hover:bg-pink-500/20",
                    isInWishlist ? "text-pink-500 hover:text-pink-600" : "text-muted-foreground hover:text-pink-500"
                  )}
                  aria-label={isInWishlist ? `Retirer ${game.name} de la wishlist` : `Ajouter ${game.name} à la wishlist`}
                  title={isInWishlist ? `Retirer ${game.name} de la wishlist` : `Ajouter ${game.name} à la wishlist`}
                >
                  {isProcessingWishlist ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
                  )}
                </Button>
              )}
              {isOwned ? (
                <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                   <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={authLoading || isProcessingOwned}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      onClick={handleAttemptRemoveGame}
                      aria-label={`Retirer ${game.name} de la collection`}
                      title={`Retirer ${game.name} de la collection`}
                    >
                      {isProcessingOwned && !isConfirmDialogOpen ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ArchiveX className="h-5 w-5" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
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
                        disabled={isProcessingOwned}
                      />
                      <Label htmlFor={`dont-ask-again-${game.id}`} className="text-sm font-normal text-muted-foreground">
                        Ne plus me demander (pour cette session)
                      </Label>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setIsConfirmDialogOpen(false)}
                        disabled={isProcessingOwned}
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
                        disabled={isProcessingOwned}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isProcessingOwned && isConfirmDialogOpen ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Supprimer'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleOwnedGame('add')}
                  disabled={authLoading || isProcessingOwned}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                  aria-label={`Ajouter ${game.name} à la collection`}
                  title={`Ajouter ${game.name} à la collection`}
                >
                  {isProcessingOwned ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Archive className="h-5 w-5" />
                  )}
                </Button>
              )}
              {showCreateSessionButton && (
                <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10" aria-label={`Créer une session pour ${game.name}`} title={`Créer une session pour ${game.name}`}>
                  <Link href={`/sessions/create?gameName=${encodeURIComponent(game.name)}`} prefetch>
                    <CalendarPlus className="h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

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

// Export memoized version
export const GameCard = React.memo(GameCardComponent);

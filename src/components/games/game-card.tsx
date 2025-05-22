
'use client';

import type { BoardGame } from '@/lib/types';
import Image from 'next/image';
// Link n'est plus utilisé ici directement pour le bouton modifié
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gamepad2, Archive, ArchiveX } from 'lucide-react'; // Correction: ArchivePlus remplacé par Archive
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';

interface GameCardProps {
  game: BoardGame;
}

export function GameCard({ game }: GameCardProps) {
  const { currentUser, updateUserProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const isOwned = useMemo(() => {
    if (!currentUser || !currentUser.ownedGames) return false;
    return currentUser.ownedGames.includes(game.name);
  }, [currentUser, game.name]);

  const handleToggleOwnedGame = async () => {
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

    if (isOwned) {
      newOwnedGames = currentOwnedGames.filter(g => g !== game.name);
      toastTitle = "Jeu Retiré";
      successMessage = `"${game.name}" a été retiré de votre collection.`;
    } else {
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
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4 relative">
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
        <div className="flex justify-between items-start">
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
          {/* Bouton pour Ajouter/Retirer de la collection */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleOwnedGame}
            disabled={authLoading || isProcessing}
            className="text-primary hover:text-primary/80 shrink-0"
            aria-label={isOwned ? `Retirer ${game.name} de la collection` : `Ajouter ${game.name} à la collection`}
            title={isOwned ? `Retirer ${game.name} de la collection` : `Ajouter ${game.name} à la collection`}
          >
            {isProcessing ? (
              <Gamepad2 className="h-5 w-5 animate-spin" />
            ) : isOwned ? (
              <ArchiveX className="h-5 w-5" />
            ) : (
              <Archive className="h-5 w-5" /> // Utilisation de Archive pour ajouter
            )}
          </Button>
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

// Fichier : src/components/games/game-card.tsx (VERSION FINALE AVEC LOGIQUE WISHLIST)

'use client';

import React, { useState, useMemo } from 'react';
import type { BoardGame } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gamepad2, Archive, ArchiveX, Loader2, CalendarPlus, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getTagCategoryColorClass } from '@/lib/tag-categories';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GameCardProps {
  game: BoardGame;
  showCreateSessionButton?: boolean;
}

export function GameCard({ 
    game, 
    showCreateSessionButton = false,
}: GameCardProps) {
  
  const { userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const isOwned = useMemo(() => userProfile?.ownedGames?.includes(game.name) ?? false, [userProfile?.ownedGames, game.name]);
  const isInWishlist = useMemo(() => userProfile?.wishlist?.includes(game.name) ?? false, [userProfile?.wishlist, game.name]);

  const handleToggleList = async (listName: 'ownedGames' | 'wishlist') => {
    if (!userProfile) { toast({ title: "Connexion requise", variant: "destructive" }); return; }
    setIsProcessing(true);
    
    const userDocRef = doc(db, 'users', userProfile.uid);
    const isInList = listName === 'ownedGames' ? isOwned : isInWishlist;
    
    try {
      // --- DÉBUT DE LA LOGIQUE AMÉLIORÉE ---
      if (listName === 'ownedGames') {
        if (isOwned) {
          // Retirer de la collection
          await updateDoc(userDocRef, { ownedGames: arrayRemove(game.name) });
          toast({ title: 'Retiré de la collection' });
        } else {
          // Ajouter à la collection
          const updates: { ownedGames: any; wishlist?: any } = {
            ownedGames: arrayUnion(game.name)
          };
          // Si le jeu est dans la wishlist, on le retire en même temps
          if (isInWishlist) {
            updates.wishlist = arrayRemove(game.name);
            toast({ title: 'Jeu ajouté !', description: 'Il a aussi été retiré de votre wishlist.'});
          } else {
            toast({ title: 'Ajouté à la collection !' });
          }
          await updateDoc(userDocRef, updates);
        }
      } else { // C'est pour la wishlist
        const operation = isInWishlist ? arrayRemove : arrayUnion;
        await updateDoc(userDocRef, { wishlist: operation(game.name) });
        toast({ title: isInWishlist ? 'Retiré de la wishlist' : 'Ajouté à la wishlist' });
      }
      // --- FIN DE LA LOGIQUE AMÉLIORÉE ---
      
      // On rafraîchit le profil dans toute l'application
      await refreshUserProfile();

    } catch(error) {
      toast({ title: "Erreur", description: "La mise à jour du profil a échoué.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Le JSX reste identique
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="relative w-full aspect-[4/3] bg-muted rounded-md overflow-hidden flex items-center justify-center">
          {userProfile && (
            <TooltipProvider delayDuration={200}>
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                {!isOwned && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleList('wishlist')} disabled={isProcessing} className={cn("hover:bg-pink-500/20", isInWishlist ? "text-pink-500 hover:text-pink-600" : "text-muted-foreground hover:text-pink-500")}>
                        {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{isInWishlist ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}</p></TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleList('ownedGames')} disabled={isProcessing} className={cn(isOwned ? "text-destructive hover:text-destructive/80" : "text-primary hover:text-primary/80")}>
                        {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (isOwned ? <ArchiveX className="h-5 w-5" /> : <Archive className="h-5 w-5" />)}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{isOwned ? 'Retirer de ma collection' : 'Ajouter à ma collection'}</p></TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}
          {game.imageUrl ? ( <Image src={game.imageUrl} alt={`Boîte du jeu ${game.name}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain" /> ) : ( <Gamepad2 className="h-16 w-16 text-muted-foreground" /> )}
        </div>
        <div>
          <CardTitle className="text-xl flex items-center gap-2 mt-4">{game.name}</CardTitle>
          {game.tags && game.tags.length > 0 && ( <div className="flex flex-wrap gap-1 mt-2">{game.tags.slice(0, 3).map(tag => (<Badge key={tag.name} variant="customColor" className={cn("font-normal", getTagCategoryColorClass(tag.categoryKey))}>{tag.name}</Badge>))}</div> )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <p className="text-sm text-foreground line-clamp-3 flex-grow">{game.description}</p>
        {showCreateSessionButton && userProfile && ( <Button asChild className="w-full mt-4"><Link href={`/sessions/create?gameName=${encodeURIComponent(game.name)}`}><CalendarPlus className="mr-2 h-4 w-4" />Créer une session</Link></Button> )}
      </CardContent>
    </Card>
  );
}

'use client';

import type { BoardGame } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2 } from 'lucide-react';
import { getTranslatedCategory } from '@/lib/category-translations';

interface GameCardProps {
  game: BoardGame;
}

export function GameCard({ game }: GameCardProps) {
  const translatedCategory = getTranslatedCategory(game.category);

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
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
        <CardTitle className="text-xl flex items-center gap-2">
          {game.name}
        </CardTitle>
        {translatedCategory && <Badge variant="outline" className="mt-1 w-fit">{translatedCategory}</Badge>}
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {game.description && (
            <p className="text-sm text-foreground line-clamp-3">{game.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

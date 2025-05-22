
'use client';

import type { BoardGame } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gamepad2, CalendarPlus } from 'lucide-react';

interface GameCardProps {
  game: BoardGame;
}

export function GameCard({ game }: GameCardProps) {
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
          <Link href={`/sessions/create?gameName=${encodeURIComponent(game.name)}`} passHref legacyBehavior>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:text-primary/80 shrink-0"
              aria-label={`Créer une session pour ${game.name}`}
              title={`Créer une session pour ${game.name}`}
            >
              <CalendarPlus className="h-5 w-5" />
            </Button>
          </Link>
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

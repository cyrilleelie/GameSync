import type { GameSession } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, Gamepad2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale'; // Import French locale

interface SessionCardProps {
  session: GameSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const formattedDate = format(session.dateTime, 'd MMM yyyy', { locale: fr });
  const formattedTime = format(session.dateTime, 'HH:mm', { locale: fr });

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        {session.gameImageUrl && (
          <div className="relative h-40 w-full mb-4 rounded-t-md overflow-hidden">
            <Image
              src={session.gameImageUrl}
              alt={session.gameName}
              layout="fill"
              objectFit="cover"
              data-ai-hint="board game art"
            />
          </div>
        )}
        <CardTitle className="text-2xl flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-primary shrink-0" />
          {session.gameName}
        </CardTitle>
        <CardDescription>Organisé par {session.host.name}</CardDescription>
        {session.category && <Badge variant="outline" className="mt-1 w-fit">{session.category}</Badge>}
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4 text-primary" />
          <span>{formattedDate} à {formattedTime}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4 text-primary" />
          <span>{session.location}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4 text-primary" />
          <span>
            {session.currentPlayers.length} / {session.maxPlayers} joueurs
          </span>
        </div>
        {session.description && (
            <p className="text-sm text-foreground line-clamp-2 pt-2">{session.description}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/sessions/${session.id}`} prefetch>
            Voir les Détails
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

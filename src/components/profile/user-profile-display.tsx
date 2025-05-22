
'use client';

import type { Player } from '@/lib/types';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, CalendarDays, Gamepad2, Edit3, ShieldCheck, Archive } from 'lucide-react'; 
import Link from 'next/link'; 

interface UserProfileDisplayProps {
  user: Player;
}

export function UserProfileDisplay({ user }: UserProfileDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-background ring-offset-2">
          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile avatar" />
          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {user.name}
          </h2>
          <p className="text-muted-foreground flex items-center gap-1 text-sm justify-center sm:justify-start">
            <ShieldCheck className="h-4 w-4 text-primary" /> 
            <span className="capitalize">{user.role}</span>
          </p>
          {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
        </div>
        <Button variant="outline" size="sm" asChild className="sm:ml-auto mt-4 sm:mt-0">
          <Link href="/profile/edit">
            <Edit3 className="mr-2 h-4 w-4" />
            Modifier le Profil
          </Link>
        </Button>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          Jeux Favoris
        </h3>
        {user.gamePreferences && user.gamePreferences.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.gamePreferences.map((game) => (
              <Badge key={game} variant="secondary" className="text-sm px-3 py-1">
                {game}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Aucune préférence de jeu définie.</p>
        )}
      </div>

      <Separator />

       <div>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <Archive className="h-5 w-5 text-primary" />
          Ma Collection de Jeux
        </h3>
        {user.ownedGames && user.ownedGames.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.ownedGames.map((game) => (
              <Badge key={game} variant="outline" className="text-sm px-3 py-1">
                {game}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Aucun jeu ajouté à votre collection.</p>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Disponibilité
        </h3>
        <p className="text-foreground whitespace-pre-wrap">
          {user.availability || "Aucune information de disponibilité fournie."}
        </p>
      </div>
    </div>
  );
}

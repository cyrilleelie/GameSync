// Fichier : src/components/sessions/session-card.tsx (MIS À JOUR)

import Image from 'next/image';
import Link from 'next/link';
import { GameSession } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Imports UI et icônes
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, Gamepad2 } from 'lucide-react';

export const SessionCard = ({ session }: { session: GameSession }) => {

  // Logique de formatage de la date (conservée)
  let formattedDate = 'Date non définie';
  let formattedTime = 'Heure non définie';
  if (session.dateTime) {
      const dateObject = new Date(session.dateTime);
      if (!isNaN(dateObject.valueOf())) {
          formattedDate = format(dateObject, 'd MMMM yy', { locale: fr });
          formattedTime = format(dateObject, 'HH:mm', { locale: fr });
      }
  }
  
  // Utilisation de la nouvelle propriété `gameImageUrl`
  const imageUrl = session.gameImageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(session.gameName)}`;

  return (
    <Link href={`/sessions/${session.id}`} legacyBehavior>
        <a className="block bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 duration-300 h-full">
            {/* === DÉBUT DE LA MODIFICATION === */}
            <div className="relative w-full aspect-[4/3] bg-muted flex items-center justify-center">
                <Image
                    src={imageUrl}
                    alt={`Image pour ${session.gameName}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain" // On utilise object-contain ici
                />
            </div>
            {/* === FIN DE LA MODIFICATION === */}

            <div className="p-4">
                <Badge variant="secondary" className="mb-2 font-normal">{session.gameName}</Badge>
                <h3 className="text-lg font-bold truncate" title={session.gameName}>
                    {session.gameName}
                </h3>
                <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span>{formattedDate}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-primary" />
                        <span>{formattedTime}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-primary" />
                        <span className="truncate">{session.location}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-primary" />
                        <span>{session.currentPlayers?.length || 0} / {session.maxPlayers} participants</span>
                    </p>
                </div>
            </div>
        </a>
    </Link>
  );
};
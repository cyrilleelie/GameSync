// Fichier : src/components/sessions/session-card.tsx (VERSION FINALE)

import Image from 'next/image';
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Session } from '@/types'; // Gardons votre type Session pour l'instant
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

export const SessionCard = ({ session }: { session: Session }) => {

  // --- "TRADUCTION" DES DONNÉES ---
  // On s'adapte à la nouvelle structure tout en restant compatible avec l'ancienne
  const title = session.title || session.gameName || 'Session sans titre';
  const gameName = session.game || session.gameName || 'Jeu non spécifié';
  const imageUrl = session.imageUrl || session.gameImageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(gameName)}`;
  const location = session.location || 'Lieu non spécifié';
  const slots = session.slots || session.maxPlayers || 0;
  
  // Le nombre de participants vient de la longueur du tableau `currentPlayers` ou `participants`
  const participantCount = session.currentPlayers?.length || session.participants?.length || 0;

  // --- GESTION DE LA DATE (LA PARTIE LA PLUS IMPORTANTE) ---
  let formattedDate = 'Date invalide';
  let formattedTime = 'Heure invalide';

  try {
    let dateObject: Date | null = null;
    
    // Cas 1: La date est un objet Timestamp de Firebase (la nouvelle méthode)
    // C'est le format que votre formulaire crée.
    if (session.dateTime && typeof (session.dateTime as any).toDate === 'function') {
      dateObject = (session.dateTime as any).toDate();
    } 
    // Cas 2: La date est déjà un objet Date JavaScript
    else if (session.dateTime instanceof Date) {
      dateObject = session.dateTime;
    }
    // Cas 3: La date est une chaîne de caractères (ancienne méthode)
    else if (typeof session.date === 'string') {
      dateObject = new Date(session.date);
    }

    // Si on a réussi à créer un objet Date valide, on le formate
    if (dateObject && !isNaN(dateObject.valueOf())) {
      formattedDate = format(dateObject, 'd MMMM yyyy', { locale: fr });
      formattedTime = format(dateObject, 'HH:mm', { locale: fr });
    }
  } catch (error) {
    console.error("Erreur de formatage de date pour la session:", session.id, error);
  }

  return (
    <Link href={`/sessions/${session.id}`} legacyBehavior>
        <a className="block bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 duration-300">
            <div className="relative h-48 w-full">
                <Image
                src={imageUrl}
                alt={`Image pour le jeu ${gameName}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold truncate" title={title}>{title}</h3>
                <p className="text-sm text-gray-600 mb-2">{gameName}</p>
                <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formattedDate}</span>
                </p>
                <p className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formattedTime}</span>
                </p>
                <p className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{location}</span>
                </p>
                <p className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{`${participantCount} / ${slots} participants`}</span>
                </p>
                </div>
            </div>
        </a>
    </Link>
  );
};
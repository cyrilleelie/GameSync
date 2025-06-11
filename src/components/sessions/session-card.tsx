// Fichier : app/components/sessions/session-card.tsx (MIS À JOUR)

import Image from 'next/image';
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Session } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// L'export est bien nommé, donc on garde `export const`
export const SessionCard = ({ session }: { session: Session }) => {
  
  // --- DÉBUT DE LA CORRECTION DE LA DATE ---
  let formattedDate = 'Date invalide';
  try {
    let dateObject;
    // Cas 1: La date est un objet Timestamp de Firebase (recommandé)
    if (session.date && typeof (session.date as any).toDate === 'function') {
      dateObject = (session.date as any).toDate();
    } else {
      // Cas 2: La date est une chaîne de caractères (ex: "2024-07-20")
      dateObject = new Date(session.date);
    }
    
    // On vérifie que la date créée est valide avant de la formater
    if (dateObject instanceof Date && !isNaN(dateObject.valueOf())) {
      formattedDate = format(dateObject, 'd MMMM yyyy', { locale: fr });
    }
  } catch (error) {
    console.error("Erreur de formatage de date pour la session:", session.id, error);
  }
  // --- FIN DE LA CORRECTION DE LA DATE ---

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="relative h-48 w-full">
        {/* --- DÉBUT DE LA CORRECTION DE L'IMAGE --- */}
        <Image
          src={session.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(session.game)}`}
          alt={`Image pour le jeu ${session.game}`}
          fill // Remplace layout="fill" et objectFit="cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Aide Next.js à optimiser l'image
          className="object-cover" // Assure que l'image couvre la zone
        />
        {/* --- FIN DE LA CORRECTION DE L'IMAGE --- */}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold truncate">{session.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{session.game}</p>
        <div className="space-y-2 text-sm text-gray-700">
          <p className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {/* On utilise notre date formatée et sécurisée */}
            {formattedDate} 
          </p>
          <p className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-2" />
            {session.time}
          </p>
          <p className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-2" />
            {session.location}
          </p>
          <p className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2" />
            {session.participants ? `${session.participants.length} / ${session.slots} participants` : `0 / ${session.slots} participants`}
          </p>
        </div>
      </div>
    </div>
  );
};
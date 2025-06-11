// Fichier : app/components/sessions/sessions-page-client.tsx (NOUVEAU FICHIER)

'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { SessionCard } from './session-card'; // Le chemin est maintenant './session-card'
import { Session } from '@/types';

const SessionsPageClient = () => { // Renommé pour plus de clarté
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        console.log("CLIENT: 1. Lancement de la récupération Firebase...");
        const sessionsQuery = query(collection(db, 'sessions'), orderBy('date'));
        const querySnapshot = await getDocs(sessionsQuery);

        const sessionsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Session[];

        console.log("CLIENT: 2. Données formatées:", sessionsList);
        setSessions(sessionsList);

      } catch (error) {
        console.error("CLIENT: ERREUR Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // La logique d'affichage est la même, mais sans le titre principal
  if (loading) {
    return <p className="text-center text-gray-500 mt-8">Chargement des sessions...</p>;
  }

  if (sessions.length === 0) {
    return <p className="text-center text-gray-500 mt-8">Aucune session trouvée dans Firebase.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
};

export default SessionsPageClient;
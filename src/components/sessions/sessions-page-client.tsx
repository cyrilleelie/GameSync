// Fichier : src/components/sessions/sessions-page-client.tsx (AMÉLIORÉ)

'use client';

import { useState, useEffect } from 'react';
// === NOUVEAU : On importe la fonction "limit" de firestore ===
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'; 
import { SessionCard } from './session-card';
import { GameSession } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// === NOUVEAU : On définit les props que le composant peut recevoir ===
interface SessionsPageClientProps {
  limit?: number; // Le '?' signifie que la prop est optionnelle
}

// === NOUVEAU : On accepte les props, en particulier "limit" ===
const SessionsPageClient = ({ limit: queryLimit }: SessionsPageClientProps) => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionsFromFirebase = async () => {
      try {
        console.log(`DÉBUT: Récupération de ${queryLimit ? queryLimit : 'toutes les'} sessions...`);

        // On construit la requête de base
        const baseQuery = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'));
        
        // === NOUVEAU : On applique la limite seulement si elle est fournie ===
        const finalQuery = queryLimit ? query(baseQuery, limit(queryLimit)) : baseQuery;

        const querySnapshot = await getDocs(finalQuery);
        
        const sessionsList = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                dateTime: data.dateTime?.toDate ? data.dateTime.toDate() : new Date(),
            } as GameSession;
        });
        
        console.log("SUCCÈS: Sessions récupérées :", sessionsList);
        setSessions(sessionsList);

      } catch (err) {
        console.error("ERREUR Firestore:", err);
        setError("Impossible de charger les sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionsFromFirebase();
  }, []); // Le useEffect ne change pas

  // Le reste du composant (affichage du chargement, erreurs, etc.) est identique
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des sessions...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive p-8">{error}</p>;
  }

  if (sessions.length === 0) {
    return <p className="text-center text-muted-foreground p-8">Aucune session de jeu n'a été trouvée.</p>
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
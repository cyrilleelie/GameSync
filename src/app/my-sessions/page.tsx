// Fichier : src/app/my-sessions/page.tsx (FINAL AVEC LE BON COMPOSANT)

'use client';

import { useState, useMemo, useEffect } from 'react';
import type { GameSession } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Imports Firebase
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, or } from 'firebase/firestore';

// Imports UI (on importe bien SessionCard)
import { SessionCard } from '@/components/sessions/session-card';
import { Button } from '@/components/ui/button';
import { Loader2, ClipboardList, Frown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MySessionsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [mySessions, setMySessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const fetchMySessions = async () => {
      setIsLoading(true);
      try {
        const sessionsCollection = collection(db, 'sessions');
        const q = query(
          sessionsCollection,
          or(
            where('host.uid', '==', currentUser.uid),
            where('participantIds', 'array-contains', currentUser.uid)
          )
        );
        const querySnapshot = await getDocs(q);
        const sessionsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id, ...data,
            dateTime: data.dateTime?.toDate(), createdAt: data.createdAt?.toDate(),
          } as GameSession;
        });
        setMySessions(sessionsList);
      } catch (err) {
        console.error("Erreur lors de la récupération de vos sessions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMySessions();
  }, [currentUser, authLoading]);

  const myUpcomingSessions = useMemo(() => {
    const now = new Date();
    return mySessions
      .filter(session => new Date(session.dateTime) >= now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [mySessions]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback si l'utilisateur arrive ici sans être connecté
  if (!currentUser) {
    return (
        <div className="container mx-auto py-8 text-center">
             <Alert className="max-w-xl mx-auto">
                <Frown className="h-4 w-4" />
                <AlertTitle>Connectez-vous</AlertTitle>
                <AlertDescription>
                    Vous devez être connecté pour voir cette page.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            Mes Sessions à Venir
          </h1>
          <p className="text-muted-foreground">Les sessions que vous avez créées ou rejointes.</p>
        </div>
      </div>
      {myUpcomingSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myUpcomingSessions.map((session) => (
            // === LA CORRECTION EST ICI ===
            // On utilise le bon composant, sans "as any" car les types correspondent
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center">
          <Frown className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">
            Vous n'êtes inscrit(e) à aucune session à venir.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Pourquoi ne pas explorer les sessions disponibles ou en créer une nouvelle ?
          </p>
          <div className="flex gap-4">
            <Button asChild><Link href="/sessions">Parcourir les Sessions</Link></Button>
            <Button asChild variant="outline"><Link href="/sessions/create">Créer une Session</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
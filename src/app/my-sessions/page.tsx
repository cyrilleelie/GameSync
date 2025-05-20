
'use client';

import { useState, useMemo, useEffect } from 'react';
import { SessionCard } from '@/components/sessions/session-card';
import type { GameSession } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, ClipboardList, Frown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const LOCALSTORAGE_SESSIONS_KEY = 'gameSessions';

export default function MySessionsPage() {
  const [allSessions, setAllSessions] = useState<GameSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!authLoading && !currentUser) {
        router.push('/login');
        return;
      }

      if (currentUser) { // Only load sessions if user is available
        const storedSessionsString = localStorage.getItem(LOCALSTORAGE_SESSIONS_KEY);
        if (storedSessionsString) {
          try {
            const parsedSessions = JSON.parse(storedSessionsString);
            if (Array.isArray(parsedSessions)) {
              const sessionsWithParsedDates = parsedSessions.map((session: any) => ({
                ...session,
                dateTime: new Date(session.dateTime),
                host: session.host || { id: 'unknown', name: 'Hôte inconnu'},
                currentPlayers: Array.isArray(session.currentPlayers) ? session.currentPlayers.map((p: any) => p || {id: 'unknown', name: 'Joueur inconnu'}) : [],
              }));
              setAllSessions(sessionsWithParsedDates);
            } else {
              // Should not happen if create session page saves correctly
              localStorage.setItem(LOCALSTORAGE_SESSIONS_KEY, JSON.stringify([]));
              setAllSessions([]);
            }
          } catch (e) {
            console.error("Failed to parse sessions from localStorage", e);
            localStorage.setItem(LOCALSTORAGE_SESSIONS_KEY, JSON.stringify([]));
            setAllSessions([]);
          }
        } else {
          // Initialize if not present, though ideally create session page handles this
           localStorage.setItem(LOCALSTORAGE_SESSIONS_KEY, JSON.stringify([]));
           setAllSessions([]);
        }
        setIsLoadingSessions(false);
      } else if (!authLoading && !currentUser) {
        // If auth loading is done and still no current user, sessions won't load
        setIsLoadingSessions(false);
      }
    }
  }, [currentUser, authLoading, router, isMounted]);

  const myUpcomingSessions = useMemo(() => {
    if (isLoadingSessions || authLoading || !currentUser) return [];
    const now = new Date();
    return allSessions.filter(session => {
      const isUserRegistered = session.currentPlayers.some(player => player.id === currentUser.id);
      const isUpcoming = new Date(session.dateTime) >= now;
      return isUserRegistered && isUpcoming;
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()); // Sort by date
  }, [allSessions, currentUser, isLoadingSessions, authLoading]);

  if (!isMounted || authLoading || (isLoadingSessions && currentUser)) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-primary" />
              Mes Sessions à Venir
            </h1>
            <p className="text-muted-foreground">Les sessions auxquelles vous êtes inscrit(e) et qui n'ont pas encore eu lieu.</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[calc(100vh-15rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!currentUser && !authLoading) {
     // This case should be handled by the redirect, but as a fallback
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Veuillez vous connecter pour voir vos sessions.</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            Mes Sessions à Venir
          </h1>
          <p className="text-muted-foreground">Les sessions auxquelles vous êtes inscrit(e) et qui n'ont pas encore eu lieu.</p>
        </div>
      </div>

      {myUpcomingSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myUpcomingSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center">
          <Frown className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">
            Vous n'êtes inscrit(e) à aucune session à venir pour le moment.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Pourquoi ne pas explorer les sessions disponibles ou en créer une nouvelle ?
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/sessions" prefetch>Parcourir les Sessions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sessions/create" prefetch>Créer une Session</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

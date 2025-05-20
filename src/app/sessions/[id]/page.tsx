
'use client'; // Required for using hooks like useAuth

import { SessionDetailClient } from '@/components/sessions/session-detail-client';
// Removed: import { getMockSessionById } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import { notFound, useParams } from 'next/navigation'; // Use useParams for client components
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { useEffect, useState } from 'react';
import type { GameSession } from '@/lib/types';

const LOCALSTORAGE_SESSIONS_KEY = 'gameSessions';

export default function SessionDetailPage() {
  const params = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  const [session, setSession] = useState<GameSession | null | undefined>(undefined); // undefined for initial, null if not found
  const [loadingSession, setLoadingSession] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const sessionId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !sessionId) {
      if (isMounted && !sessionId) { // If mounted but no session ID, it's a "not found" case.
        setSession(null);
        setLoadingSession(false);
      }
      return;
    }

    setLoadingSession(true);
    const storedSessionsString = localStorage.getItem(LOCALSTORAGE_SESSIONS_KEY);
    if (storedSessionsString) {
      try {
        const parsedSessions: GameSession[] = JSON.parse(storedSessionsString);
        const foundSession = parsedSessions.find(s => s.id === sessionId);

        if (foundSession) {
          // Ensure dateTime is a Date object and players/host are properly formed
          const processedSession: GameSession = {
            ...foundSession,
            dateTime: new Date(foundSession.dateTime),
            host: foundSession.host || { id: 'unknown', name: 'Hôte Inconnu'},
            currentPlayers: Array.isArray(foundSession.currentPlayers) 
              ? foundSession.currentPlayers.map(p => p || { id: 'unknown', name: 'Joueur Inconnu' }) 
              : [],
          };
          setSession(processedSession);
        } else {
          setSession(null); // Session not found in localStorage
        }
      } catch (e) {
        console.error("Failed to parse sessions from localStorage", e);
        setSession(null); // Error parsing, treat as not found
      }
    } else {
      setSession(null); // No sessions in localStorage
    }
    setLoadingSession(false);
  }, [sessionId, isMounted]);

  if (!isMounted || authLoading || loadingSession || session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    notFound(); // Triggers the not-found UI
  }
  
  if (!currentUser) {
     return (
      <Alert variant="destructive" className="mt-8 max-w-xl mx-auto">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Accès Restreint</AlertTitle>
        <AlertDescription>
          Vous devez être connecté pour voir les détails de la session.
        </AlertDescription>
      </Alert>
    );
  }

  return <SessionDetailClient session={session} currentUser={currentUser} />;
}

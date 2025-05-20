
'use client'; // Required for using hooks like useAuth

import { SessionDetailClient } from '@/components/sessions/session-detail-client';
import { getMockSessionById } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import { notFound, useParams } from 'next/navigation'; // Use useParams for client components
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { useEffect, useState } from 'react';
import type { GameSession } from '@/lib/types';

// Removed generateStaticParams as this page is now dynamic based on auth state and client-side fetching

export default function SessionDetailPage() {
  const params = useParams();
  const { currentUser, loading: authLoading } = useAuth(); // Get currentUser from context
  const [session, setSession] = useState<GameSession | null | undefined>(undefined); // undefined for initial, null if not found
  const [loadingSession, setLoadingSession] = useState(true);

  const sessionId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (sessionId) {
      // Simulate fetching session data. In a real app, this could be an API call.
      // Or, if sessions are globally available and small, you could filter them client-side.
      // For this mock, we'll stick to getMockSessionById for simplicity.
      const fetchedSession = getMockSessionById(sessionId);
      setSession(fetchedSession);
      setLoadingSession(false);
    } else {
      setSession(null); // No ID, so no session
      setLoadingSession(false);
    }
  }, [sessionId]);

  if (authLoading || loadingSession || session === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

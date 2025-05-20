
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { GameSession } from '@/lib/types';
import { CreateSessionForm } from '@/components/sessions/create-session-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ArrowLeft, Edit } from 'lucide-react';

const LOCALSTORAGE_SESSIONS_KEY = 'gameSessions';

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  
  const [session, setSession] = useState<GameSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const sessionId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !sessionId || authLoading) return;

    if (!currentUser) {
      router.push('/login');
      return;
    }

    const storedSessionsString = localStorage.getItem(LOCALSTORAGE_SESSIONS_KEY);
    if (storedSessionsString) {
      try {
        const parsedSessions: GameSession[] = JSON.parse(storedSessionsString).map((s: any) => ({
            ...s,
            dateTime: new Date(s.dateTime) // Ensure dateTime is a Date object
        }));
        const foundSession = parsedSessions.find(s => s.id === sessionId);

        if (foundSession) {
          if (foundSession.host.id === currentUser.id) {
            setSession(foundSession);
          } else {
            setError("Vous n'êtes pas autorisé à modifier cette session.");
          }
        } else {
          setError("Session non trouvée.");
        }
      } catch (e) {
        console.error("Failed to parse sessions from localStorage", e);
        setError("Erreur lors du chargement des sessions.");
      }
    } else {
      setError("Aucune session trouvée dans le stockage local.");
    }
    setLoadingSession(false);
  }, [sessionId, currentUser, authLoading, router, isMounted]);

  if (!isMounted || authLoading || loadingSession) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
         <Button variant="outline" onClick={() => router.back()} size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Card className="max-w-md mx-auto shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-6 w-6"/> Erreur
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
     // Should be caught by error state, but as a fallback
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Session non trouvée ou chargement en cours.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Edit className="h-7 w-7 text-primary" />
            Modifier la Session
          </CardTitle>
          <CardDescription>Mettez à jour les détails de votre session de jeu.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <CreateSessionForm sessionToEdit={session} />
        </CardContent>
      </Card>
    </div>
  );
}

// Fichier : src/app/sessions/[id]/page.tsx (MIS À JOUR AVEC FIREBASE)

'use client'; 

// Imports existants
import { SessionDetailClient } from '@/components/sessions/session-detail-client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import type { GameSession } from '@/lib/types';

// === NOUVEAUX IMPORTS POUR FIREBASE ===
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// La constante pour localStorage n'est plus nécessaire
// const LOCALSTORAGE_SESSIONS_KEY = 'gameSessions';

export default function SessionDetailPage() {
  const params = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  const [session, setSession] = useState<GameSession | null | undefined>(undefined);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const sessionId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ===================================================================
  // === DÉBUT DE LA MODIFICATION : ON REMPLACE localStorage PAR FIREBASE ===
  // ===================================================================
  useEffect(() => {
    // Si on n'est pas encore monté ou qu'il n'y a pas d'ID, on ne fait rien
    if (!isMounted || !sessionId) {
      if (isMounted && !sessionId) {
        setLoadingSession(false);
        setSession(null);
      }
      return;
    }

    // On crée une fonction asynchrone pour pouvoir utiliser await
    const fetchSessionFromFirebase = async () => {
      setLoadingSession(true);
      try {
        console.log(`Récupération de la session avec l'ID: ${sessionId}`);
        
        // 1. On crée une référence directe au document dans Firestore
        const sessionDocRef = doc(db, 'sessions', sessionId);

        // 2. On récupère le document
        const sessionDocSnap = await getDoc(sessionDocRef);

        // 3. On vérifie si le document existe
        if (sessionDocSnap.exists()) {
          const data = sessionDocSnap.data();
          // On formate les données pour qu'elles correspondent à notre type GameSession
          const processedSession: GameSession = {
            id: sessionDocSnap.id,
            ...data,
            // On convertit les Timestamps de Firebase en objets Date JavaScript
            dateTime: data.dateTime?.toDate(),
            createdAt: data.createdAt?.toDate(),
          } as GameSession;
          setSession(processedSession);
        } else {
          // Si le document n'existe pas dans Firebase
          console.warn("Session non trouvée dans Firestore pour l'ID:", sessionId);
          setSession(null);
        }
      } catch (e) {
        console.error("Erreur lors de la récupération de la session depuis Firebase", e);
        setSession(null); // En cas d'erreur, on considère que la session n'est pas trouvée
      } finally {
        setLoadingSession(false);
      }
    };

    fetchSessionFromFirebase();
  }, [sessionId, isMounted]); // Ce useEffect se relance si l'ID de la session change
  // ============================================================
  // === FIN DE LA MODIFICATION ===
  // ============================================================


  // Le reste de votre logique d'affichage est parfaitement conservé
  if (!isMounted || authLoading || loadingSession || session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    notFound();
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
// Fichier : src/app/my-sessions/page.tsx (MIS À JOUR AVEC FIREBASE)

'use client';

// Imports de React et Next.js
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Imports de vos composants UI, types, et contexte (inchangés)
import { SessionCard } from '@/components/sessions/session-card';
import type { GameSession } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Loader2, ClipboardList, Frown } from 'lucide-react';

// === NOUVEAUX IMPORTS POUR FIREBASE ===
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';


export default function MySessionsPage() {
  // Vos états existants sont conservés
  const [allSessions, setAllSessions] = useState<GameSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // =========================================================
  // === DÉBUT DE LA MODIFICATION : ON REMPLACE localStorage ===
  // =========================================================
  useEffect(() => {
    // Si l'authentification est en cours ou si l'utilisateur n'est pas encore chargé, on attend.
    if (!isMounted || authLoading) return;

    // Si le chargement est terminé et qu'il n'y a pas d'utilisateur, on le redirige.
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const fetchAllSessions = async () => {
      setIsLoadingSessions(true);
      
      // --- AVERTISSEMENT DE PERFORMANCE ---
      // Pour trouver les sessions d'un participant, la méthode actuelle charge TOUTES les
      // sessions et les filtre côté client. C'est acceptable pour quelques centaines
      // de sessions, mais ce n'est pas idéal pour une application à grande échelle.
      // Une meilleure approche serait d'ajouter un tableau `participantIds: ['id1', 'id2']`
      // à chaque session pour permettre une requête beaucoup plus efficace.
      console.warn("Chargement de toutes les sessions pour filtrage côté client. À optimiser pour la mise à l'échelle.");

      try {
        const sessionsCollectionRef = collection(db, 'sessions');
        const querySnapshot = await getDocs(sessionsCollectionRef);
        const sessionsFromDb = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            dateTime: doc.data().dateTime?.toDate(),
        })) as GameSession[];
        setAllSessions(sessionsFromDb);
      } catch (e) {
        console.error("Erreur lors du chargement des sessions depuis Firebase", e);
      } finally {
        setIsLoadingSessions(false);
      }
    };
    
    fetchAllSessions();
  }, [currentUser, authLoading, router, isMounted]);
  // =======================================================
  // === FIN DE LA MODIFICATION ===
  // =======================================================


  // Votre logique de filtrage `useMemo` est conservée et parfaitement fonctionnelle
  const myUpcomingSessions = useMemo(() => {
    if (isLoadingSessions || authLoading || !currentUser) return [];
    
    const now = new Date();
    return allSessions.filter(session => {
        // Condition 1 : L'utilisateur est l'hôte OU est dans la liste des joueurs
        const isUserInvolved = 
            session.host.id === currentUser.uid || 
            session.currentPlayers.some(player => player.id === currentUser.uid);

        // Condition 2 : La session n'a pas encore eu lieu
        const isUpcoming = new Date(session.dateTime) >= now;

        return isUserInvolved && isUpcoming;
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [allSessions, currentUser, isLoadingSessions, authLoading]);

  // Votre JSX de chargement est conservé
  if (!isMounted || authLoading || isLoadingSessions) {
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

  // Tout le reste de votre JSX est conservé à l'identique
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
          <p className="text-xl text-muted-foreground mb-2">Vous n'êtes inscrit(e) à aucune session à venir pour le moment.</p>
          <p className="text-sm text-muted-foreground mb-6">Pourquoi ne pas explorer les sessions disponibles ou en créer une nouvelle ?</p>
          <div className="flex gap-4">
            <Button asChild><Link href="/sessions">Parcourir les Sessions</Link></Button>
            <Button asChild variant="outline"><Link href="/sessions/create">Créer une Session</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import type { GameSession, Player } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, MapPin, Users, Info, LogIn, LogOut, Edit, Trash2, Gamepad2, ArrowLeft, Timer, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';

interface SessionDetailClientProps {
  session: GameSession;
  currentUser: Player;
}

export function SessionDetailClient({ session: initialSession, currentUser }: SessionDetailClientProps) {
  const { toast } = useToast();
  const router = useRouter(); 
  const [session, setSession] = useState<GameSession>(initialSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);


  if (!isMounted) {
    return null;
  }
  
  // Correction: Utiliser currentUser.uid de Firebase Auth
  const isUserHost = session.host.id === currentUser.uid;
  const isUserJoined = session.currentPlayers.some(player => player.id === currentUser.uid);
  const canJoin = !isUserJoined && session.currentPlayers.length < session.maxPlayers;

  const formattedDate = format(new Date(session.dateTime), 'd MMMM yy', { locale: fr });
  const formattedTime = format(new Date(session.dateTime), 'HH:mm', { locale: fr });

  const handleJoinSession = async () => {
    setIsSubmitting(true);
    const playerToAdd = {
      id: currentUser.uid,
      name: currentUser.displayName || currentUser.email,
      avatarUrl: currentUser.photoURL || '',
    };

    setSession(prevSession => ({
      ...prevSession,
      currentPlayers: [...prevSession.currentPlayers, playerToAdd]
    }));

    const sessionRef = doc(db, 'sessions', session.id);
    try {
      await updateDoc(sessionRef, { currentPlayers: arrayUnion(playerToAdd) });
      toast({ title: 'Rejoint avec succès !', description: `Vous avez rejoint la session pour ${session.gameName}.` });
      router.refresh(); 
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de rejoindre la session.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveSession = async () => {
    setIsSubmitting(true);
    const playerToRemove = session.currentPlayers.find(p => p.id === currentUser.uid);
    if (!playerToRemove) {
      setIsSubmitting(false);
      return;
    }

    const originalPlayers = session.currentPlayers;
    setSession(prevSession => ({
        ...prevSession,
        currentPlayers: prevSession.currentPlayers.filter(p => p.id !== currentUser.uid)
    }));

    const sessionRef = doc(db, 'sessions', session.id);
    try {
      await updateDoc(sessionRef, { currentPlayers: arrayRemove(playerToRemove) });
      toast({ title: 'Session quittée', description: `Vous avez quitté la session pour ${session.gameName}.` });
      router.refresh();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de quitter la session.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteSession = async () => {
    setIsSubmitting(true);
    const sessionRef = doc(db, 'sessions', session.id);
    try {
      await deleteDoc(sessionRef);
      toast({ title: 'Session supprimée', description: `La session pour ${session.gameName} a été supprimée.` });
      router.push('/sessions');
      router.refresh();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer la session.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="relative">
          {session.gameImageUrl ? (
            <div className="relative h-72 w-full mb-4 rounded-t-md overflow-hidden bg-muted">
              {/* LA CORRECTION EST ICI */}
              <Image
                src={session.gameImageUrl}
                alt={`Boîte du jeu ${session.gameName}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="relative h-72 w-full mb-4 rounded-t-md overflow-hidden bg-muted flex items-center justify-center">
              <Gamepad2 className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2 mb-1">
                <Gamepad2 className="h-8 w-8 text-primary shrink-0" />
                {session.gameName}
              </CardTitle>
              <CardDescription>Organisé par : <span className="font-medium text-primary">{session.host.name}</span></CardDescription>
            </div>
            {isUserHost ? (
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/sessions/${session.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Modifier
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle><AlertDialogDescription>Cette action ne peut pas être annulée. Cela supprimera définitivement la session.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSession} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : isUserJoined ? (
              <Button variant="destructive" onClick={handleLeaveSession} disabled={isSubmitting} size="sm">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogOut className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Départ...' : 'Quitter la Session'}
              </Button>
            ) : canJoin ? (
              <Button onClick={handleJoinSession} disabled={isSubmitting} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogIn className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Adhésion...' : 'Rejoindre la Session'}
              </Button>
            ) : (
              <Badge variant="destructive">Session Complète</Badge>
            )}
          </div>
        </CardHeader>
        <Separator/>
        <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/>Date & Heure</h3><p>{formattedDate} à {formattedTime}</p></div>
                <div><h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/>Lieu</h3><p>{session.location}</p></div>
                {session.duration && (<div><h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Timer className="h-5 w-5 text-primary"/>Durée Estimée</h3><p>{session.duration}</p></div>)}
            </div>
            {session.description && (<div><h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Description</h3><p className="whitespace-pre-wrap">{session.description}</p></div>)}
            <Separator/>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Users className="h-5 w-5 text-primary"/>Joueurs ({session.currentPlayers.length}/{session.maxPlayers})</h3>
              {session.currentPlayers.length > 0 ? (<ul className="space-y-3">{session.currentPlayers.map(player => (<li key={player.id} className="flex items-center gap-3 p-2 rounded-md border bg-card"><Avatar className="h-8 w-8"><AvatarImage src={player.avatarUrl} alt={player.name} /><AvatarFallback>{player.name.substring(0,1)}</AvatarFallback></Avatar><span className="font-medium">{player.name}</span>{player.id === session.host.id && <Badge variant="outline">Hôte</Badge>}</li>))}</ul>) : (<p className="text-muted-foreground">Aucun joueur n'a encore rejoint.</p>)}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
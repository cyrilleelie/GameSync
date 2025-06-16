// Fichier : src/components/sessions/session-interaction-buttons.tsx (NOUVEAU)

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { GameSession } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// Imports UI
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, LogIn, LogOut, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface SessionInteractionButtonsProps {
  session: GameSession;
}

export function SessionInteractionButtons({ session }: SessionInteractionButtonsProps) {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUserHost = useMemo(() => session.host?.uid === currentUser?.uid, [session.host, currentUser]);
  const isUserJoined = useMemo(() => session.currentPlayers?.some(p => p.uid === currentUser?.uid), [session.currentPlayers, currentUser]);
  const canJoin = useMemo(() => !isUserJoined && session.currentPlayers.length < session.maxPlayers, [isUserJoined, session.currentPlayers, session.maxPlayers]);

  const handleJoinOrLeave = async (action: 'join' | 'leave') => {
    if (!currentUser) return;
    setIsSubmitting(true);
    const playerObject = { uid: currentUser.uid, name: currentUser.displayName || '', avatarUrl: currentUser.photoURL || '' };
    const sessionRef = doc(db, 'sessions', session.id);
    const operation = action === 'join' ? arrayUnion(playerObject) : arrayRemove(playerObject);
    
    try {
      await updateDoc(sessionRef, { currentPlayers: operation });
      await refreshUserProfile();
      toast({ title: action === 'join' ? 'Rejoint avec succès !' : 'Session quittée' });
      router.refresh();
    } catch (error) { toast({ title: "Erreur", variant: "destructive" }); } 
    finally { setIsSubmitting(false); }
  };

  const handleDeleteSession = async () => {
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'sessions', session.id));
      toast({ title: 'Session supprimée' });
      router.push('/sessions');
    } catch (error) {
      toast({ title: 'Erreur de suppression', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
        <div className="mt-8 pt-6 border-t text-center">
            <p className="text-muted-foreground mb-4">Connectez-vous pour rejoindre cette session.</p>
            <Button asChild><Link href="/login">Se connecter</Link></Button>
        </div>
    )
  }

  return (
    <div className="mt-8 pt-6 border-t text-center">
      {isUserHost ? (
        <div className="flex justify-center gap-2">
          <Button variant="outline" asChild><Link href={`/sessions/${session.id}/edit`}><Edit className="mr-2 h-4 w-4"/>Modifier</Link></Button>
          <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/>Supprimer</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSession} className="bg-destructive hover:bg-destructive/90">Confirmer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </div>
      ) : isUserJoined ? (
        <Button variant="destructive" onClick={() => handleJoinOrLeave('leave')} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogOut className="mr-2 h-4 w-4"/>}Quitter la session</Button>
      ) : !canJoin ? (
        <Button disabled>Session complète</Button>
      ) : (
        <Button onClick={() => handleJoinOrLeave('join')} disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-bold">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogIn className="mr-2 h-4 w-4"/>}Rejoindre la session</Button>
      )}
    </div>
  );
}
// Fichier : src/app/sessions/[id]/page.tsx (FINAL ET SYNCHRONISÉ)

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import type { GameSession, Player } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Imports UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Users, Info, Gamepad2, Timer, Clock, ArrowLeft } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// On importe notre composant client pour les boutons
import { SessionInteractionButtons } from '@/components/sessions/session-interaction-buttons';

// La fonction getSessionData est correcte et sérialise bien les dates
async function getSessionData(id: string): Promise<GameSession | null> {
  const sessionDocRef = doc(db, 'sessions', id);
  const sessionDocSnap = await getDoc(sessionDocRef);
  if (!sessionDocSnap.exists()) return null;
  
  const data = sessionDocSnap.data();
  return { 
    id: sessionDocSnap.id, 
    ...data,
    dateTime: data.dateTime?.toDate().toISOString(),
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),
  } as GameSession;
}

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const session = await getSessionData(params.id);

  if (!session) {
    notFound();
  }

  const formattedDate = format(new Date(session.dateTime), 'PPP', { locale: fr });
  const formattedTime = format(new Date(session.dateTime), 'HH:mm', { locale: fr });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" asChild size="sm">
            <Link href="/sessions"><ArrowLeft className="mr-2 h-4 w-4" />Retour aux sessions</Link>
        </Button>
      </div>
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="relative">
            <div className="relative h-72 w-full mb-4 rounded-t-md overflow-hidden bg-muted">
                <Image src={session.gameImageUrl || 'https://placehold.co/600x300.png'} alt={`Boîte du jeu ${session.gameName}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" priority/>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <CardTitle className="text-3xl font-bold flex items-center gap-2 mb-1"><Gamepad2 className="h-8 w-8 text-primary shrink-0" />{session.gameName}</CardTitle>
                    {/* === CORRECTION ICI === */}
                    <CardDescription>Organisée par : <span className="font-medium text-primary">{session.host.displayName}</span></CardDescription>
                </div>
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
                {session.currentPlayers.length > 0 ? (
                  <ul className="space-y-3">
                    {/* === CORRECTION DANS LA LISTE DES JOUEURS === */}
                    {session.currentPlayers.map(player => (
                      <li key={player.uid} className="flex items-center gap-3 p-2 rounded-md border bg-card">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={player.photoURL || undefined} alt={player.displayName || 'Avatar'} />
                          <AvatarFallback>{(player.displayName || 'P').substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.displayName}</span>
                        {player.uid === session.host.uid && <Badge variant="outline">Hôte</Badge>}
                      </li>
                    ))}
                  </ul>
                ) : (<p className="text-muted-foreground">Aucun joueur n'a encore rejoint.</p>)}
            </div>
            
            <SessionInteractionButtons session={session} />
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import type { GameSession, Player } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, MapPin, Users, Info, LogIn, LogOut, Edit, Trash2, UserCircle, Gamepad2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SessionDetailClientProps {
  session: GameSession;
  currentUser: Player;
}

export function SessionDetailClient({ session: initialSession, currentUser }: SessionDetailClientProps) {
  const { toast } = useToast();
  const [session, setSession] = useState<GameSession>(initialSession);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
     // Render nothing or a placeholder until client-side hydration is complete
    return null;
  }

  const isUserHost = session.host.id === currentUser.id;
  const isUserJoined = session.currentPlayers.some(player => player.id === currentUser.id);
  const canJoin = !isUserJoined && session.currentPlayers.length < session.maxPlayers;

  const formattedDate = format(new Date(session.dateTime), 'MMMM d, yyyy');
  const formattedTime = format(new Date(session.dateTime), 'h:mm a');

  const handleJoinSession = async () => {
    setIsJoining(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSession(prev => ({
      ...prev,
      currentPlayers: [...prev.currentPlayers, currentUser],
    }));
    toast({ title: 'Successfully Joined!', description: `You've joined the session for ${session.gameName}.` });
    setIsJoining(false);
  };

  const handleLeaveSession = async () => {
    setIsLeaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSession(prev => ({
      ...prev,
      currentPlayers: prev.currentPlayers.filter(p => p.id !== currentUser.id),
    }));
    toast({ title: 'Session Left', description: `You've left the session for ${session.gameName}.`, variant: 'destructive' });
    setIsLeaving(false);
  };
  
  const handleDeleteSession = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: 'Session Deleted', description: `The session for ${session.gameName} has been deleted. (Mocked)`, variant: 'destructive' });
    // In a real app, redirect or update UI to reflect deletion
    // router.push('/sessions'); 
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="relative">
          {session.gameImageUrl && (
            <div className="relative h-60 w-full mb-4 rounded-t-md overflow-hidden">
              <Image
                src={session.gameImageUrl}
                alt={session.gameName}
                layout="fill"
                objectFit="cover"
                data-ai-hint="board game box"
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2 mb-1">
                <Gamepad2 className="h-8 w-8 text-primary shrink-0" />
                {session.gameName}
              </CardTitle>
              <CardDescription>Hosted by: <span className="font-medium text-primary">{session.host.name}</span></CardDescription>
              {session.category && <Badge variant="secondary" className="mt-2">{session.category}</Badge>}
            </div>
            {isUserHost ? (
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the session.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSession} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : isUserJoined ? (
              <Button variant="destructive" onClick={handleLeaveSession} disabled={isLeaving} size="sm">
                <LogOut className="mr-2 h-4 w-4" /> {isLeaving ? 'Leaving...' : 'Leave Session'}
              </Button>
            ) : canJoin ? (
              <Button onClick={handleJoinSession} disabled={isJoining} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <LogIn className="mr-2 h-4 w-4" /> {isJoining ? 'Joining...' : 'Join Session'}
              </Button>
            ) : (
              <Badge variant="destructive">Session Full</Badge>
            )}
          </div>
        </CardHeader>
        <Separator/>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/>Date & Time</h3>
              <p>{formattedDate} at {formattedTime}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/>Location</h3>
              <p>{session.location}</p>
            </div>
          </div>
          
          {session.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Description</h3>
              <p className="whitespace-pre-wrap">{session.description}</p>
            </div>
          )}
          
          <Separator/>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary"/>
              Players ({session.currentPlayers.length}/{session.maxPlayers})
            </h3>
            {session.currentPlayers.length > 0 ? (
              <ul className="space-y-3">
                {session.currentPlayers.map(player => (
                  <li key={player.id} className="flex items-center gap-3 p-2 rounded-md border bg-card">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint="player avatar" />
                      <AvatarFallback>{player.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{player.name}</span>
                    {player.id === session.host.id && <Badge variant="outline">Host</Badge>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No players have joined yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

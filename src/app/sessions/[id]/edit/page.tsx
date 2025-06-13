// Fichier : src/app/sessions/[id]/edit/page.tsx (CORRIGÉ)

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import type { GameSession } from '@/lib/types';

// Imports UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { CreateSessionForm } from '@/components/sessions/create-session-form';

async function getSessionData(id: string): Promise<GameSession | null> {
  const sessionDocRef = doc(db, 'sessions', id);
  const sessionDocSnap = await getDoc(sessionDocRef);

  if (!sessionDocSnap.exists()) {
    return null;
  }
  
  const data = sessionDocSnap.data();

  // === LA CORRECTION EST ICI ===
  // On s'assure que TOUS les champs de type date sont convertis en chaînes de caractères.
  return { 
    id: sessionDocSnap.id, 
    ...data,
    dateTime: data.dateTime?.toDate().toISOString(),
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(), // On ajoute la conversion pour updatedAt
  } as GameSession;
}

export default async function EditSessionPage({ params }: { params: { id: string } }) {
  const session = await getSessionData(params.id);

  if (!session) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Modifier la Session</CardTitle>
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
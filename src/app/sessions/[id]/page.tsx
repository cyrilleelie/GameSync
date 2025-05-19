import { SessionDetailClient } from '@/components/sessions/session-detail-client';
import { getMockSessionById, getMockPlayerById } from '@/lib/data'; // Assuming mock data for now
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { notFound } from 'next/navigation';

interface SessionDetailPageProps {
  params: { id: string };
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  // In a real app, you'd fetch this data from your backend
  const session = getMockSessionById(params.id);
  
  // For demo purposes, assume a logged-in user. In a real app, this would come from auth.
  const loggedInUser = getMockPlayerById('1'); 

  if (!session) {
    notFound();
  }

  if (!loggedInUser) {
     return (
      <Alert variant="destructive" className="mt-8">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Erreur d'authentification</AlertTitle>
        <AlertDescription>
          Impossible de déterminer l'utilisateur connecté. Veuillez réessayer de vous connecter.
        </AlertDescription>
      </Alert>
    );
  }

  return <SessionDetailClient session={session} currentUser={loggedInUser} />;
}

export async function generateStaticParams() {
  // In a real app, fetch all session IDs
  // For now, using mock data directly for build time generation if needed
  const { mockSessions } = await import('@/lib/data');
  return mockSessions.map((session) => ({
    id: session.id,
  }));
}

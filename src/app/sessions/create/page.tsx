
'use client';

import { CreateSessionForm } from '@/components/sessions/create-session-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function CreateSessionPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (isMounted && !authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router, isMounted]);

  if (!isMounted || authLoading || (!currentUser && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Créer une Nouvelle Session de Jeu</CardTitle>
          <CardDescription>Remplissez les détails ci-dessous pour planifier votre prochaine aventure de jeu de société.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <CreateSessionForm />
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { SmartSchedulerForm } from '@/components/smart-scheduler/smart-scheduler-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Wand2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SmartSchedulerPage() {
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
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
             <Wand2 className="h-8 w-8 text-primary" />
            Planificateur de Session Intelligent
          </CardTitle>
          <CardDescription>
            Laissez notre assistant IA vous aider à trouver le moment et le lieu parfaits pour votre prochaine session de jeu en fonction des préférences de chacun.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <SmartSchedulerForm />
        </CardContent>
      </Card>
    </div>
  );
}

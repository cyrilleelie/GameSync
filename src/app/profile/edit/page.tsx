
'use client';

import { useAuth } from '@/contexts/auth-context';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, Edit3, ArrowLeft } from 'lucide-react'; // Ajout de ArrowLeft
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EditProfilePage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Edit3 className="h-8 w-8 text-primary" />
            Modifier Mon Profil
          </CardTitle>
          <CardDescription>Mettez à jour vos informations personnelles et vos préférences.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <EditProfileForm user={currentUser} />
        </CardContent>
      </Card>
    </div>
  );
}

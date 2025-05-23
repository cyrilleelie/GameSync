
'use client'; // Convert to client component to use context

import { UserProfileDisplay } from '@/components/profile/user-profile-display';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, loading } = useAuth(); // Get currentUser from context

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center min-h-[calc(100vh-8rem)]">
        <p className="text-xl mb-4">Veuillez vous connecter pour voir votre profil.</p>
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Mon Profil</CardTitle>
          {/* <CardDescription>Consultez et gérez les détails de votre profil GameSync.</CardDescription> */}
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <UserProfileDisplay user={currentUser} />
        </CardContent>
      </Card>
    </div>
  );
}


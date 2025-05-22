
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ShieldAlert, ShieldCheck, ListOrdered, Tags, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading) {
      if (!currentUser) {
        router.push('/login');
      } else if (currentUser.role !== 'Administrateur') {
        setAccessDenied(true);
      }
    }
  }, [currentUser, authLoading, router, isMounted]);

  if (!isMounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <ShieldAlert className="h-8 w-8" /> Accès Refusé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <Button onClick={() => router.push('/')} className="mt-6">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentUser || currentUser.role !== 'Administrateur') {
    // This case should ideally be caught by the redirect or accessDenied state,
    // but it's a fallback.
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Vérification des permissions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Panneau d'Administration
          </CardTitle>
          <CardDescription>
            Gérez les données de l'application GameSync.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
              <TabsTrigger value="games" className="text-base py-2 sm:text-sm">
                <ListOrdered className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Gérer les Jeux
              </TabsTrigger>
              <TabsTrigger value="tags" className="text-base py-2 sm:text-sm">
                <Tags className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Gérer les Tags
              </TabsTrigger>
              <TabsTrigger value="users" className="text-base py-2 sm:text-sm">
                <Users className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Gérer les Utilisateurs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="games">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Jeux</CardTitle>
                  <CardDescription>CRUD pour les jeux de société.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">Fonctionnalité à venir...</p>
                  {/* TODO: Implement CRUD table for games */}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tags">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Tags</CardTitle>
                  <CardDescription>CRUD pour les tags et leurs catégories.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">Fonctionnalité à venir...</p>
                  {/* TODO: Implement CRUD table for tags */}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Utilisateurs</CardTitle>
                  <CardDescription>Visualiser et gérer les utilisateurs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">Fonctionnalité à venir...</p>
                  {/* TODO: Implement CRUD table for users */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

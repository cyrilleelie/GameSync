// Fichier : src/app/admin/page.tsx (VERSION FINALE FINALE)

'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ShieldAlert, ShieldCheck, ListOrdered, Tags, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// On importe nos 3 composants d'onglets
import { UsersTab } from '@/components/admin/users-tab';
import { GamesTab } from '@/components/admin/games-tab';
import { TagsTab } from '@/components/admin/tags-tab';

export default function AdminPage() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-full min-h-[calc(100vh-8rem)]"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  if (userProfile?.role !== 'Administrateur') {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="max-w-xl mx-auto">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Accès Refusé</AlertTitle>
            <AlertDescription>Vous n'avez pas les droits nécessaires.</AlertDescription>
        </Alert>
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
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="games"><ListOrdered className="mr-2 h-4 w-4" />Jeux</TabsTrigger>
              <TabsTrigger value="tags"><Tags className="mr-2 h-4 w-4" />Tags</TabsTrigger>
              <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Utilisateurs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="games">
              <GamesTab />
            </TabsContent>
            
            <TabsContent value="tags">
              <TagsTab />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
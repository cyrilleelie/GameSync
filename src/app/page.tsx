
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, PlusCircle, Users, LogIn, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="text-center space-y-6">
        <Image 
          src="/banner.jpg" 
          alt="Collage de jeux de société" 
          width={640} 
          height={480} 
          className="rounded-lg shadow-xl mx-auto"
          priority
        />
        <h1 className="text-5xl font-bold tracking-tight text-primary">Bienvenue sur GameSync !</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          La plateforme ultime pour les passionnés de jeux de société pour se connecter, planifier et jouer.
          Découvrez de nouveaux jeux, trouvez d'autres joueurs et organisez facilement votre prochaine soirée jeux épique.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentUser ? (
            <>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" prefetch>
                <Link href="/sessions">
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Parcourir les Sessions
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" prefetch>
                <Link href="/sessions/create">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Créer une Session
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" prefetch>
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5" />
                Se connecter pour commencer
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              Découvrez des Jeux
            </CardTitle>
            <CardDescription>Trouvez des sessions de jeu à venir pour vos jeux de société préférés ou explorez-en de nouveaux.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Parcourez une liste variée de sessions, filtrez par jeu, lieu ou date.</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Connectez-vous avec des Joueurs
            </CardTitle>
            <CardDescription>Rencontrez de nouvelles personnes qui partagent votre passion pour les jeux de société.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Rejoignez des sessions, créez les vôtres et construisez votre communauté de joueurs.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
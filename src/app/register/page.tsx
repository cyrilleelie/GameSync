
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
       toast({ title: "Mot de passe trop court", description: "Le mot de passe doit comporter au moins 6 caractères.", variant: "destructive" });
      return;
    }
    const success = await register(name, email, password);
    if (success) {
      toast({ title: "Inscription réussie", description: "Votre compte a été créé. Bienvenue !" });
      // router.push('/'); // Redirect is handled in AuthContext now
    } else {
      toast({ title: "Échec de l'inscription", description: "Un compte avec cet email existe déjà ou une erreur est survenue.", variant: "destructive" });
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <UserPlus className="h-8 w-8 text-primary" />
            Inscription
          </CardTitle>
          <CardDescription>Créez votre compte GameSync pour commencer.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Votre nom et prénom" 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                required 
                disabled={authLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="vous@exemple.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={authLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Au moins 6 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={authLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {authLoading ? 'Création en cours...' : 'S\'inscrire'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/login">Connectez-vous</Link>
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

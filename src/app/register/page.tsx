// Fichier : src/app/register/page.tsx

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

const GoogleIcon = () => ( <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="mr-2"><path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.2.84-.84 2.48-1.77 3.28v2.24h2.55C16.58 14.82 17.64 12.28 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.46-.8 5.95-2.18l-2.55-2.25c-.8.54-1.83.87-2.9.87-2.91 0-5.36-1.96-6.24-4.6H.2v2.26C1.88 15.59 5.16 18 9 18z" fill="#34A853"/><path d="M2.76 7.9c-.2-.61-.32-1.25-.32-1.91s.12-1.3.32-1.91V1.83H.2C.07 2.42 0 3.05 0 3.7c0 .65.07 1.28.2 1.87l2.56 2.33z" fill="#FBBC05"/><path d="M9 3.5c1.31 0 2.5.45 3.43 1.34l2.27-2.27C13.46.97 11.43 0 9 0 5.16 0 1.88 2.41.2 5.73l2.56 2.17C3.64 5.46 6.09 3.5 9 3.5z" fill="#EA4335"/></svg> );

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loginWithGoogle, loading: authLoading, currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) router.push('/');
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }
    // On appelle bien avec 3 arguments
    await register(name, email, password);
  };

  const handleGoogleLogin = async () => { await loginWithGoogle(); };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2"><UserPlus className="h-8 w-8 text-primary" />Inscription</CardTitle>
          <CardDescription>Créez votre compte pour rejoindre la communauté.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom ou pseudo</Label>
              <Input id="name" type="text" placeholder="Votre nom d'affichage" value={name} onChange={(e) => setName(e.target.value)} required disabled={authLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={authLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" placeholder="Votre mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={authLoading} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={authLoading}>{authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Créer mon compte'}</Button>
          </CardFooter>
        </form>
        <div className="px-6 pb-4">
          <div className="relative my-3"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Ou</span></div></div>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={authLoading}><GoogleIcon />S'inscrire avec Google</Button>
          <p className="mt-4 text-sm text-center text-muted-foreground">Déjà un compte ? <Button variant="link" asChild className="p-0 h-auto"><Link href="/login">Connectez-vous</Link></Button></p>
        </div>
      </Card>
    </div>
  );
}
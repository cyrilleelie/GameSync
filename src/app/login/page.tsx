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
import { Loader2, LogIn } from 'lucide-react';

// Icône Google SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <path d="M17.64,9.2045c0-.6382-.0573-1.2518-.1646-1.8409H9V10.84h4.8436c-.2086,1.3418-.8409,2.4818-1.7673,3.2836V16.36h2.5536C16.58,14.82,17.64,12.28,17.64,9.2045Z" fill="#4285F4"/>
    <path d="M9,18c2.43,0,4.4618-.8018,5.9491-2.1818l-2.5536-2.25C11.64,14.09,10.4073,14.5,9,14.5c-2.91,0-5.3618-1.96-6.24-4.6H.1964V12.16C1.88,15.59,5.16,18,9,18Z" fill="#34A853"/>
    <path d="M2.76,7.9c-.2086-.6109-.3273-1.2518-.3273-1.91S2.5514,4.6909,2.76,4.08V1.83H.1964C.07,2.42,0,3.05,0,3.7A10.52,10.52,0,0,0,.1964,5.97L2.76,7.9Z" fill="#FBBC05"/>
    <path d="M9,3.5c1.3118,0,2.5009.45,3.4309,1.3418l2.2718-2.2718C13.4618.9727,11.43,0,9,0,5.16,0,1.88,2.41, .1964,5.73L2.76,7.9C3.6382,5.23,6.09,3.5,9,3.5Z" fill="#EA4335"/>
  </svg>
);

// Icône Facebook SVG
// const FacebookIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 fill-current">
//     <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" fill="#1877F2"/>
//   </svg>
// );


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // On récupère toutes les fonctions du contexte, y compris `loading`
  const { login, loginWithGoogle, loginWithFacebook, loading: authLoading, currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Redirige si l'utilisateur est déjà connecté
  useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  // Fonction pour la soumission du formulaire email/mot de passe (simulée)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  // Fonction pour la connexion Google (réelle)
  const handleGoogleLogin = async () => {
    console.log('--- BOUTON GOOGLE CLIQUÉ --- Le gestionnaire d\'événement fonctionne.');
    await loginWithGoogle();
  };
  
  // Fonction pour la connexion Facebook (simulée)
  // const handleFacebookLogin = async () => {
  //   await loginWithFacebook();
  // };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <LogIn className="h-8 w-8 text-primary" />
            Connexion
          </CardTitle>
          <CardDescription>Accédez à votre compte GameSync.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
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
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={authLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              {authLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </CardFooter>
        </form>

        <div className="px-6 pb-4">
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={authLoading}>
              {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
              {authLoading ? 'Connexion...' : 'Se connecter avec Google'}
            </Button>
            {/* <Button variant="outline" className="w-full text-[#1877F2] hover:text-[#1877F2]/90 hover:bg-accent" onClick={handleFacebookLogin} disabled={authLoading}>
              {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FacebookIcon />}
              {authLoading ? 'Connexion...' : 'Se connecter avec Facebook'}
            </Button> */}
          </div>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Pas encore de compte ?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/register">Inscrivez-vous</Link>
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
}
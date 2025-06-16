// Fichier : src/app/layout.tsx (CORRIGÉ POUR LA POLICE GEIST)

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context'; 
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar'; 
import Link from 'next/link';
import { Boxes } from 'lucide-react'; 

// === DÉBUT DE LA CORRECTION ===
// On importe les polices directement depuis le paquet 'geist'
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
// === FIN DE LA CORRECTION ===


export const metadata: Metadata = {
  title: 'GameSync - Organisez Vos Sessions de Jeux de Société',
  description: 'GameSync vous aide à trouver et organiser des sessions de jeux de société avec des joueurs autour de vous.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      {/* On applique les polices en utilisant leurs variables CSS */}
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <AuthProvider> 
          <SidebarProvider defaultOpen>
            <AppSidebar /> 
            <SidebarInset>
              <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2 md:hidden">
                <SidebarTrigger className="md:hidden" />
                <Link href="/" className="flex items-center gap-2 group" prefetch>
                  <Boxes className="h-7 w-7 text-primary group-hover:text-primary/90 transition-colors" /> 
                  <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text group-hover:opacity-90 transition-opacity">
                    <h1 className="text-lg font-semibold">GameSync</h1>
                  </span>
                </Link>
              </header>
              <main className="flex-1 p-4 md:p-6 overflow-auto">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
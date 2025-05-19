import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { GameSyncLogo } from '@/components/icons/game-sync-logo';
import { navItems } from '@/components/layout/sidebar-nav-items';
import { Button } from '@/components/ui/button';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="p-4">
              <Link href="/" className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-primary-foreground transition-colors">
                <GameSyncLogo className="h-8 w-8" />
                <h1 className="text-xl font-semibold">GameSync</h1>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </Button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2 md:hidden">
              {/* Mobile Sidebar Trigger */}
              <SidebarTrigger className="md:hidden" />
              <Link href="/" className="flex items-center gap-2 text-primary hover:text-foreground transition-colors">
                <GameSyncLogo className="h-7 w-7" />
                <h1 className="text-lg font-semibold">GameSync</h1>
              </Link>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}

// Fichier : app-sidebar.tsx (CORRIGÉ ET ROBUSTE)

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { navItems } from '@/components/layout/sidebar-nav-items';
import type { NavItem } from '@/components/layout/sidebar-nav-items';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarFooter } from '@/components/ui/sidebar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Loader2, Boxes } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function AppSidebar() {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [activeAccordionValue, setActiveAccordionValue] = useState<string | undefined>(undefined);
  const prevPathname = usePrevious(pathname);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayedNavItems = useMemo(() => {
    if (!isMounted || authLoading) return [];
    
    return navItems
      .filter(item => {
        if (item.requiresAuth && !currentUser) return false;
        if (item.requiresGuest && currentUser) return false;
        // CORRECTION : La notion de "rôle" n'existe pas par défaut dans Firebase Auth.
        // Nous la désactivons pour l'instant. Gérer les rôles est une étape avancée
        // qui nécessite une base de données de profils utilisateurs.
        // if (item.requiresAdmin && (!currentUser || currentUser.role !== 'Administrateur')) return false;
        return true;
      })
      .map(item => {
        if (item.children) {
          const visibleChildren = item.children.filter(child => {
            if (child.requiresAuth && !currentUser) return false;
            if (child.requiresGuest && currentUser) return false;
            // MÊME CORRECTION ICI
            // if (child.requiresAdmin && (!currentUser || currentUser.role !== 'Administrateur')) return false;
            return true;
          });
          if (visibleChildren.length > 0 || item.href) { 
            return { ...item, children: visibleChildren.length > 0 ? visibleChildren : undefined };
          }
          return null; 
        }
        return item;
      }).filter(Boolean) as NavItem[];
  }, [isMounted, authLoading, currentUser]);

  useEffect(() => {
    if (pathname === prevPathname && prevPathname !== undefined) return;
    const activeParent = displayedNavItems.find(item => item.children?.some(child => child.href === pathname));
    if (activeParent && activeParent.id) {
      setActiveAccordionValue(activeParent.id);
    } else {
      const isNonAccordionLinkActive = displayedNavItems.some(item => !item.children && item.href === pathname);
      if (isNonAccordionLinkActive || prevPathname === undefined) {
        setActiveAccordionValue(undefined);
      }
    }
  }, [pathname, displayedNavItems, prevPathname]);

  const handleLogout = async () => {
    await logout();
  };
  
  const renderHeaderContent = () => (
    <Link href="/" className="flex items-center gap-2 group" prefetch>
        <Boxes className="h-8 w-8 text-primary group-hover:text-primary/90 transition-colors" /> 
        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text group-hover:opacity-90 transition-opacity">
            <h1 className="text-xl font-semibold">GameSync</h1>
        </span>
    </Link>
  );

  if (!isMounted) {
    // Le code pour l'état non monté est conservé
    return (<Sidebar collapsible="icon" className="border-r"><SidebarHeader className="p-4"><div className="flex items-center gap-2 text-sidebar-primary"><Boxes className="h-8 w-8" /><h1 className="text-xl font-semibold">GameSync</h1></div></SidebarHeader><SidebarContent className="flex items-center justify-center flex-grow"><Loader2 className="h-8 w-8 animate-spin text-primary" /></SidebarContent></Sidebar>);
  }
  
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        {renderHeaderContent()}
      </SidebarHeader>
      <SidebarContent>
        {authLoading ? (
          <div className="flex items-center justify-center flex-grow"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <SidebarMenu className="flex-grow px-2 py-0">
            {/* Le code d'affichage de la navigation est conservé et devrait fonctionner */}
            {displayedNavItems.map((item) => { if (item.children && item.children.length > 0 && item.id) { return ( <Accordion type="single" collapsible className="w-full" key={item.id} value={activeAccordionValue} onValueChange={setActiveAccordionValue}><AccordionItem value={item.id} className="border-b-0"><AccordionTrigger className={cn("flex items-center w-full justify-between rounded-md px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",activeAccordionValue === item.id && "bg-sidebar-accent text-sidebar-accent-foreground")}><div className="flex items-center gap-3"><item.icon className="h-5 w-5" /><span>{item.title}</span></div></AccordionTrigger><AccordionContent className="pt-1 pb-0 pl-5"><SidebarMenu className="!gap-0.5">{item.children.map((child) => (<SidebarMenuItem key={child.href} data-active={pathname === child.href}><Button variant={pathname === child.href ? "secondary" : "ghost"} className="w-full justify-start h-auto py-[6px] px-2 text-sidebar-foreground/90" asChild><Link href={child.href!} className="flex items-center gap-2.5" prefetch={child.href?.startsWith('/')}><child.icon className="h-4 w-4" /><span className="text-sm font-normal">{child.title}</span></Link></Button></SidebarMenuItem>))}</SidebarMenu></AccordionContent></AccordionItem></Accordion>); } else if (item.href) { return ( <SidebarMenuItem key={item.href} data-active={pathname === item.href}><Button variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start text-sidebar-foreground" asChild><Link href={item.href} className="flex items-center gap-3" prefetch={item.href.startsWith('/')}><item.icon className="h-5 w-5" /><span className="text-sm font-medium">{item.title}</span></Link></Button></SidebarMenuItem> ); } return null; })}
          </SidebarMenu>
        )}
      </SidebarContent>
      {/* On n'affiche le pied de page que si le chargement est terminé */}
      {!authLoading && (
        <SidebarFooter className="p-2 border-t">
          {currentUser ? (
            // --- DÉBUT DE LA LOGIQUE CORRIGÉE POUR L'UTILISATEUR CONNECTÉ ---
            <div className="flex flex-col items-center gap-2 p-2 mb-2 text-center">
                <Avatar>
                    {/* On utilise photoURL et on fournit une alternative si elle est nulle */}
                    <AvatarImage src={currentUser.photoURL ?? undefined} alt={currentUser.displayName ?? 'Avatar'} />
                    <AvatarFallback>
                        {/* On crée les initiales de manière sécurisée */}
                        {(currentUser.displayName ?? currentUser.email ?? 'U').substring(0,2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    {/* On utilise displayName et on fournit l'email comme alternative */}
                    <p className="text-sm font-medium text-sidebar-foreground">{currentUser.displayName ?? currentUser.email}</p>
                    {/* On affiche l'email seulement s'il est différent du nom affiché */}
                    {currentUser.email && currentUser.displayName && <p className="text-xs text-sidebar-foreground/70">{currentUser.email}</p>}
                    {/* La notion de rôle est retirée pour l'instant */}
                </div>
                <Button variant="outline" className="w-full justify-start mt-2" onClick={handleLogout}>
                    <LogOut className="mr-2 h-5 w-5" />
                    Déconnexion
                </Button>
            </div>
          ) : (
            // --- AFFICHAGE POUR L'UTILISATEUR NON CONNECTÉ ---
            <div className="p-2">
                 <Button asChild className="w-full">
                    <Link href="/login">Se connecter</Link>
                </Button>
            </div>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
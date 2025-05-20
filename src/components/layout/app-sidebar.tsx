
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { navItems } from '@/components/layout/sidebar-nav-items';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { GameSyncLogo } from '@/components/icons/game-sync-logo';
import { LogOut, Loader2 } from 'lucide-react';

export function AppSidebar() {
  const { currentUser, logout, loading } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    // Toast or further redirection can be handled by the logout function itself or here
  };

  const displayedNavItems = navItems.filter(item => {
    if (item.requiresAuth && !currentUser) return false;
    if (item.requiresGuest && currentUser) return false;
    return true;
  });

  if (loading) {
    return (
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-primary-foreground transition-colors" prefetch>
            <GameSyncLogo className="h-8 w-8" />
            <h1 className="text-xl font-semibold">GameSync</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </SidebarContent>
      </Sidebar>
    );
  }
  

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-primary-foreground transition-colors" prefetch>
          <GameSyncLogo className="h-8 w-8" />
          <h1 className="text-xl font-semibold">GameSync</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="flex-grow">
          {displayedNavItems.map((item) => (
            <SidebarMenuItem key={item.href} data-active={pathname === item.href}>
              <Button 
                variant={pathname === item.href ? "secondary" : "ghost"} 
                className="w-full justify-start" 
                asChild
              >
                <Link href={item.href} className="flex items-center gap-3" prefetch={item.href.startsWith('/')}>
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </Button>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {currentUser && (
        <SidebarFooter className="p-2 border-t">
            <div className="p-2 mb-2 text-center">
                <p className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
                <p className="text-xs text-sidebar-foreground/70">{currentUser.email}</p>
            </div>
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-5 w-5" />
            Déconnexion
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}


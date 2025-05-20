
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
import { LogOut, Loader2, Boxes } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export function AppSidebar() {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const displayedNavItems = useMemo(() => {
    // Ensure navItems are only computed when fully ready to avoid mismatches
    if (!isMounted || authLoading) return [];
    return navItems.filter(item => {
      if (item.requiresAuth && !currentUser) return false;
      if (item.requiresGuest && currentUser) return false;
      return true;
    });
  }, [isMounted, authLoading, currentUser]);

  // Helper function to determine header content
  const renderHeaderContent = () => {
    // Only render the Link when fully mounted and authentication is complete
    if (isMounted && !authLoading) {
      return (
        <Link href="/" className="flex items-center gap-2 text-sidebar-primary" prefetch>
          <Boxes className="h-8 w-8" />
          <h1 className="text-xl font-semibold">GameSync</h1>
        </Link>
      );
    }
    // For SSR, initial client render before mount, or while auth is loading after mount, render a simple div
    return (
      <div className="flex items-center gap-2 text-sidebar-primary">
        <Boxes className="h-8 w-8" />
        <h1 className="text-xl font-semibold">GameSync</h1>
      </div>
    );
  };

  if (!isMounted) {
    // This block is for Server-Side Rendering and the very first client render pass before useEffect runs.
    // It should be as simple as possible and match what the server sends.
    return (
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          {/* Render the div version, consistent with renderHeaderContent's logic for !isMounted */}
          <div className="flex items-center gap-2 text-sidebar-primary">
            <Boxes className="h-8 w-8" />
            <h1 className="text-xl font-semibold">GameSync</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex items-center justify-center flex-grow">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </SidebarContent>
      </Sidebar>
    );
  }

  // If we reach here, isMounted is true.
  // The main sidebar structure is rendered, and internal parts become dynamic.
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        {renderHeaderContent()}
      </SidebarHeader>
      <SidebarContent>
        {authLoading ? (
          <div className="flex items-center justify-center flex-grow">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
        )}
      </SidebarContent>
      {currentUser && !authLoading && ( // Ensure user details in footer only render when auth is complete
        <SidebarFooter className="p-2 border-t">
            <div className="p-2 mb-2 text-center">
                <p className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
                {currentUser.email && <p className="text-xs text-sidebar-foreground/70">{currentUser.email}</p>}
                <p className="text-xs text-sidebar-foreground/70 capitalize">{currentUser.role}</p>
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

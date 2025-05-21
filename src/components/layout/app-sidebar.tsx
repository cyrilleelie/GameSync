
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { navItems } from '@/components/layout/sidebar-nav-items';
import type { NavItem } from '@/components/layout/sidebar-nav-items';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LogOut, Loader2, Boxes } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [activeAccordionValue, setActiveAccordionValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayedNavItems = useMemo(() => {
    if (!isMounted) return [];
    
    return navItems
      .filter(item => {
        if (item.requiresAuth && !currentUser) return false;
        if (item.requiresGuest && currentUser) return false;
        return true;
      })
      .map(item => {
        if (item.children) {
          const visibleChildren = item.children.filter(child => {
            if (child.requiresAuth && !currentUser) return false;
            if (child.requiresGuest && currentUser) return false;
            return true;
          });
          return { ...item, children: visibleChildren };
        }
        return item;
      });
  }, [isMounted, authLoading, currentUser]);

  useEffect(() => {
    const activeParent = displayedNavItems.find(item => 
      item.children?.some(child => child.href === pathname)
    );
    if (activeParent && activeParent.id) {
      setActiveAccordionValue(activeParent.id);
    }
  }, [pathname, displayedNavItems]);


  const handleLogout = async () => {
    await logout();
  };

  // This function defines how the header (logo + title) is rendered based on mount and auth state
  const renderHeaderContent = () => {
    if (!isMounted || authLoading) {
      // SSR and initial client render / auth loading: Simple div, no Link to avoid hydration mismatch
      return (
        <div className="flex items-center gap-2">
          <Boxes className="h-8 w-8 text-sidebar-primary" /> {/* Icon with a solid color */}
          <h1 className="text-xl font-semibold text-sidebar-primary">GameSync</h1>
        </div>
      );
    }
    // Mounted and auth is complete: render the Link with gradient
    return (
      <Link href="/" className="flex items-center gap-2 group" prefetch>
        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text group-hover:opacity-90 transition-opacity">
          <Boxes className="h-8 w-8 inline-block align-middle" /> {/* Icon will attempt to use text gradient */}
          <h1 className="text-xl font-semibold inline-block align-middle">GameSync</h1>
        </span>
      </Link>
    );
  };

  if (!isMounted) {
    return (
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          {/* Render the div version, consistent with renderHeaderContent's logic for !isMounted */}
          <div className="flex items-center gap-2">
            <Boxes className="h-8 w-8 text-sidebar-primary" />
            <h1 className="text-xl font-semibold text-sidebar-primary">GameSync</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex items-center justify-center flex-grow">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        {renderHeaderContent()}
      </SidebarHeader>
      <SidebarContent>
        {authLoading && isMounted ? ( // Show loader only if mounted and auth is still loading
          <div className="flex items-center justify-center flex-grow">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <SidebarMenu className="flex-grow px-2 py-0">
            {displayedNavItems.map((item) => {
              if (item.children && item.children.length > 0 && item.id) {
                return (
                  <Accordion 
                    type="single" 
                    collapsible 
                    className="w-full" 
                    key={item.id}
                    value={activeAccordionValue}
                    onValueChange={setActiveAccordionValue}
                  >
                    <AccordionItem value={item.id} className="border-b-0">
                      <AccordionTrigger 
                        className={cn(
                          "flex items-center w-full justify-between rounded-md px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0 pl-5">
                        <SidebarMenu className="!gap-0.5">
                          {item.children.map((child) => (
                            <SidebarMenuItem key={child.href} data-active={pathname === child.href}>
                              <Button
                                variant={pathname === child.href ? "secondary" : "ghost"}
                                className="w-full justify-start h-auto py-[6px] px-2 text-sidebar-foreground/90"
                                asChild
                              >
                                <Link href={child.href!} className="flex items-center gap-2.5" prefetch={child.href?.startsWith('/')}>
                                  <child.icon className="h-4 w-4" />
                                  <span className="text-sm font-normal">{child.title}</span>
                                </Link>
                              </Button>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                );
              } else if (item.href) {
                return (
                  <SidebarMenuItem key={item.href} data-active={pathname === item.href}>
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start text-sidebar-foreground"
                      asChild
                    >
                      <Link href={item.href} className="flex items-center gap-3" prefetch={item.href.startsWith('/')}>
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </Button>
                  </SidebarMenuItem>
                );
              }
              return null;
            })}
          </SidebarMenu>
        )}
      </SidebarContent>
      {currentUser && !authLoading && ( 
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

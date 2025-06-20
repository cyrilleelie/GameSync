
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  PlusCircle,
  LogIn,
  ClipboardList,
  LibraryBig,
  LayoutList, 
  Archive,
  Gift,
  ShieldCheck,
  Home, // Added Home icon
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id?: string; // Pour l'Accordion
  title: string;
  href?: string; // Optionnel pour les parents
  icon: LucideIcon;
  label?: string; 
  disabled?: boolean;
  requiresAuth?: boolean;
  requiresGuest?: boolean;
  requiresAdmin?: boolean;
  children?: NavItem[]; 
}

export const navItems: NavItem[] = [
  {
    id: 'home',
    title: 'Accueil',
    href: '/',
    icon: Home, // Changed from LayoutDashboard
  },
  {
    id: 'sessions-accordion',
    title: 'Sessions',
    icon: Gamepad2,
    requiresAuth: true,
    children: [
      {
        id: 'all-sessions',
        title: 'Toutes les Sessions',
        href: '/sessions',
        icon: LayoutList, 
        requiresAuth: true,
      },
      {
        id: 'my-sessions',
        title: 'Mes Sessions',
        href: '/my-sessions',
        icon: ClipboardList, 
        requiresAuth: true,
      },
      {
        id: 'create-session',
        title: 'Nouvelle Session',
        href: '/sessions/create',
        icon: PlusCircle, 
        requiresAuth: true,
      },
    ],
  },
  {
    id: 'games-accordion', 
    title: 'Jeux', 
    icon: LibraryBig, 
    requiresAuth: true,
    children: [
       {
        id: 'all-games', 
        title: 'Tous les Jeux', 
        href: '/games', 
        icon: LayoutList,
        requiresAuth: true,
      },
      {
        id: 'my-wishlist',
        title: 'Ma Wishlist',
        href: '/my-wishlist',
        icon: Gift,
        requiresAuth: true,
      },
      {
        id: 'my-owned-games', 
        title: 'Mes Jeux', 
        href: '/my-games', 
        icon: Archive, 
        requiresAuth: true,
      },
    ],
  },
  {
    id: 'profile',
    title: 'Profil',
    href: '/profile',
    icon: Users,
    requiresAuth: true,
  },
  {
    id: 'admin',
    title: 'Administration',
    href: '/admin',
    icon: ShieldCheck,
    requiresAuth: true,
    requiresAdmin: true,
  },
  {
    id: 'login',
    title: 'Connexion',
    href: '/login',
    icon: LogIn,
    requiresGuest: true,
  },
];

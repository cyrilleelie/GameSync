
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  PlusCircle,
  // Map, // Supprimé
  LogIn,
  ClipboardList,
  LibraryBig,
  LayoutList, // Ajout pour "Toutes les Sessions"
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id?: string; // Pour l'Accordion
  title: string;
  href?: string; // Optionnel pour les parents
  icon: LucideIcon;
  label?: string; // Utilisé pour les tooltips en mode icône, moins pertinent pour les sous-menus
  disabled?: boolean;
  requiresAuth?: boolean;
  requiresGuest?: boolean;
  children?: NavItem[]; // Pour les sous-menus
}

export const navItems: NavItem[] = [
  {
    id: 'home',
    title: 'Accueil',
    href: '/',
    icon: LayoutDashboard,
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
        icon: LayoutList, // Icône pour le sous-menu
        requiresAuth: true,
      },
      {
        id: 'my-sessions',
        title: 'Mes Sessions',
        href: '/my-sessions',
        icon: ClipboardList, // Icône pour le sous-menu
        requiresAuth: true,
      },
      {
        id: 'create-session',
        title: 'Nouvelle Session',
        href: '/sessions/create',
        icon: PlusCircle, // Icône pour le sous-menu
        requiresAuth: true,
      },
    ],
  },
  {
    id: 'games',
    title: 'Jeux', // Renommé depuis "Bibliothèque de Jeux"
    href: '/games',
    icon: LibraryBig,
    requiresAuth: true,
  },
  // "Vue Carte" a été supprimé
  {
    id: 'profile',
    title: 'Profil',
    href: '/profile',
    icon: Users,
    requiresAuth: true,
  },
  {
    id: 'login',
    title: 'Connexion',
    href: '/login',
    icon: LogIn,
    requiresGuest: true,
  },
];

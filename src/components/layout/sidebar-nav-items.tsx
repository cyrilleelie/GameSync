
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  PlusCircle,
  Map,
  LogIn,
  ClipboardList, // Ajout de l'icône
  LibraryBig, // Ajout de l'icône pour la bibliothèque de jeux
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  requiresAuth?: boolean; // Afficher si authentifié
  requiresGuest?: boolean; // Afficher si non authentifié (invité)
}

export const navItems: NavItem[] = [
  {
    title: 'Accueil',
    href: '/',
    icon: LayoutDashboard,
    label: 'Accueil',
  },
  {
    title: 'Sessions',
    href: '/sessions',
    icon: Gamepad2,
    label: 'Voir les Sessions',
    requiresAuth: true,
  },
  {
    title: 'Mes Sessions', // Nouvelle page
    href: '/my-sessions',
    icon: ClipboardList,
    label: 'Mes Sessions Inscrites',
    requiresAuth: true,
  },
  {
    title: 'Créer Session',
    href: '/sessions/create',
    icon: PlusCircle,
    label: 'Nouvelle Session',
    requiresAuth: true,
  },
  {
    title: 'Bibliothèque de Jeux',
    href: '/games',
    icon: LibraryBig,
    label: 'Tous les jeux',
    requiresAuth: true, // Modification: Ajout de requiresAuth
  },
  {
    title: 'Vue Carte',
    href: '/map',
    icon: Map,
    label: 'Sessions à Proximité',
    requiresAuth: true,
  },
  {
    title: 'Profil',
    href: '/profile',
    icon: Users,
    label: 'Mon Profil',
    requiresAuth: true,
  },
  {
    title: 'Connexion',
    href: '/login',
    icon: LogIn,
    label: 'Se connecter',
    requiresGuest: true,
  },
];

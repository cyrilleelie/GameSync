
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  PlusCircle,
  Wand2,
  Map,
  LogIn,
  LogOut,
  UserPlus,
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
    title: 'Tableau de Bord',
    href: '/',
    icon: LayoutDashboard,
    label: 'Accueil',
  },
  {
    title: 'Sessions',
    href: '/sessions',
    icon: Gamepad2,
    label: 'Voir les Sessions',
  },
  {
    title: 'Créer Session',
    href: '/sessions/create',
    icon: PlusCircle,
    label: 'Nouvelle Session',
    requiresAuth: true,
  },
  {
    title: 'Planif. Intelligent',
    href: '/smart-scheduler',
    icon: Wand2,
    label: 'Planificateur IA',
    requiresAuth: true,
  },
  {
    title: 'Vue Carte',
    href: '/map',
    icon: Map,
    label: 'Sessions à Proximité',
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
  // Le lien de déconnexion sera géré différemment, typiquement un bouton avec une action.
];


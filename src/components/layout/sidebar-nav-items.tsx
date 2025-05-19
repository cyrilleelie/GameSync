import {
  LayoutDashboard,
  Users,
  Gamepad2,
  PlusCircle,
  Wand2,
  Map,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
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
  },
  {
    title: 'Planif. Intelligent',
    href: '/smart-scheduler',
    icon: Wand2,
    label: 'Planificateur IA',
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
  },
];

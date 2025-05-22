
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  PlusCircle,
  LogIn,
  ClipboardList,
  LibraryBig,
  LayoutList, // Déjà présent, utilisé pour "Toutes les Sessions"
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
  children?: NavItem[]; 
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
    id: 'games-accordion', // Nouvel ID pour l'accordéon
    title: 'Jeux', // Titre de la catégorie parente
    icon: LibraryBig, // Icône pour la catégorie parente
    requiresAuth: true,
    children: [
      {
        id: 'all-games', // ID pour le sous-menu
        title: 'Tous les Jeux', // Nouveau libellé
        href: '/games', // Pointe vers la page existante
        icon: LayoutList, // Ou LibraryBig si vous préférez pour le sous-menu
        requiresAuth: true,
      },
      // Vous pourriez ajouter d'autres sous-menus liés aux jeux ici à l'avenir
      // par exemple: "Mes Jeux Préférés", "Demander un Jeu" (si vous voulez une page dédiée)
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
    id: 'login',
    title: 'Connexion',
    href: '/login',
    icon: LogIn,
    requiresGuest: true,
  },
];

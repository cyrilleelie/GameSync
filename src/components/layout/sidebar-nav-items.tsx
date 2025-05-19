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
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    label: 'Home',
  },
  {
    title: 'Sessions',
    href: '/sessions',
    icon: Gamepad2,
    label: 'View Sessions',
  },
  {
    title: 'Create Session',
    href: '/sessions/create',
    icon: PlusCircle,
    label: 'New Session',
  },
  {
    title: 'Smart Scheduler',
    href: '/smart-scheduler',
    icon: Wand2,
    label: 'AI Scheduler',
  },
  {
    title: 'Map View',
    href: '/map',
    icon: Map,
    label: 'Nearby Sessions',
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: Users,
    label: 'My Profile',
  },
];

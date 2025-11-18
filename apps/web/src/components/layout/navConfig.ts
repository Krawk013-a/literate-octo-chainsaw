import { Compass, GraduationCap, Home, Layers, Settings } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Lessons', path: '/lessons', icon: GraduationCap },
  { label: 'Challenges', path: '/challenges', icon: Layers, badge: 'soon' },
  { label: 'Adventure', path: '/playground', icon: Compass },
  { label: 'Admin', path: '/admin', icon: Settings },
];

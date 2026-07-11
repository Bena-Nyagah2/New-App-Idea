import { Gift, Snowflake, Egg, GraduationCap, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  bannerText: string;
  bannerSubtext: string;
  discountPercent: number;
  icon: LucideIcon;
  seasonIcons: string[];
  featuredLabel: string;
}

export const themes: Record<string, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'The classic Shoe Store look',
    primary: '#ed8914',
    secondary: '#E11D48',
    accent: '#2563EB',
    bannerText: '',
    bannerSubtext: '',
    discountPercent: 0,
    icon: ShoppingBag,
    seasonIcons: [],
    featuredLabel: 'Featured',
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    description: 'Festive holiday vibes with red and green',
    primary: '#dc2626',
    secondary: '#16a34a',
    accent: '#f59e0b',
    bannerText: 'Holiday Sale',
    bannerSubtext: 'Gift the perfect pair this season',
    discountPercent: 15,
    icon: Snowflake,
    seasonIcons: ['🎄', '🎁', '⭐', '❄️'],
    featuredLabel: 'Holiday Picks',
  },
  easter: {
    id: 'easter',
    name: 'Easter',
    description: 'Springtime pastels and fresh styles',
    primary: '#a855f7',
    secondary: '#f472b6',
    accent: '#facc15',
    bannerText: 'Easter Deals',
    bannerSubtext: 'Hop into savings this spring',
    discountPercent: 10,
    icon: Egg,
    seasonIcons: ['🐣', '🌸', '🐰', '🌷'],
    featuredLabel: 'Spring Collection',
  },
  'back-to-school': {
    id: 'back-to-school',
    name: 'Back to School',
    description: 'Fresh kicks for the new term',
    primary: '#2563EB',
    secondary: '#f59e0b',
    accent: '#059669',
    bannerText: 'Back to School',
    bannerSubtext: 'Step into the new term in style',
    discountPercent: 20,
    icon: GraduationCap,
    seasonIcons: ['📚', '🎒', '✏️', '🎓'],
    featuredLabel: 'Student Picks',
  },
  'black-friday': {
    id: 'black-friday',
    name: 'Black Friday',
    description: 'Biggest deals of the year',
    primary: '#111827',
    secondary: '#E11D48',
    accent: '#facc15',
    bannerText: 'Black Friday',
    bannerSubtext: 'Massive savings — limited time only',
    discountPercent: 30,
    icon: Gift,
    seasonIcons: ['🖤', '💰', '🔥', '⚡'],
    featuredLabel: 'Deal of the Day',
  },
};

export const themeList = Object.values(themes);

export function getTheme(id: string): ThemeConfig {
  return themes[id] || themes.default;
}

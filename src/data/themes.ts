import { ThemeConfig, ThemeId } from '../types/crm';

export const availableThemes: ThemeConfig[] = [
  {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    tagline: 'Default refined Claude-style midnight blue with soft periwinkle blue triggers and high-contrast white text.',
    category: 'Dark',
    primaryHex: '#0B1224',
    accentHex: '#819BFF',
    cardHex: '#141E35',
    borderHex: '#283653',
  },
  {
    id: 'charcoal-amber',
    name: 'Charcoal Amber',
    tagline: 'Deep matte charcoal surfaces accented with vibrant warm amber triggers and razor-sharp borders.',
    category: 'Dark',
    primaryHex: '#121316',
    accentHex: '#F59E0B',
    cardHex: '#1A1C22',
    borderHex: '#2A2D36',
  },
  {
    id: 'slate-executive',
    name: 'Slate Executive',
    tagline: 'Premium slate grey with muted sky blue accents engineered for enterprise analytics.',
    category: 'Dark',
    primaryHex: '#0F172A',
    accentHex: '#38BDF8',
    cardHex: '#1E293B',
    borderHex: '#334155',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    tagline: 'Ultra-dark OLED stealth background paired with luminous emerald conversion indicators.',
    category: 'Dark',
    primaryHex: '#09090B',
    accentHex: '#10B981',
    cardHex: '#141417',
    borderHex: '#27272A',
  },
  {
    id: 'clean-light',
    name: 'Clean Light',
    tagline: 'Airy daylight palette with crisp white data cards, steel slate lines, and authoritative royal blue accents.',
    category: 'Light',
    primaryHex: '#F8FAFC',
    accentHex: '#4F46E5',
    cardHex: '#FFFFFF',
    borderHex: '#E2E8F0',
  },
];

export const AVAILABLE_THEMES = availableThemes;
export const defaultThemeId: ThemeId = 'midnight-navy';

export const applyThemeToDocument = (themeId: ThemeId) => {
  document.documentElement.setAttribute('data-theme', themeId);
  document.body.className = `theme-${themeId} antialiased selection:bg-[var(--crm-primary)] selection:text-white min-h-screen`;
  try {
    localStorage.setItem('dealdeck_theme', themeId);
  } catch {
    // ignore
  }
};

// Legacy shim exports to support any old components if referenced
export interface ThemeDefinition {
  id: string;
  name: string;
  tagline: string;
  type: 'dark' | 'light';
  colors: Record<string, string>;
  typography: Record<string, string>;
}

export const originalTheme: ThemeDefinition = {
  id: 'midnight-navy',
  name: 'Midnight Navy',
  tagline: 'Refined deep navy SaaS theme',
  type: 'dark',
  colors: {
    bg: '#0B1224',
    panel: '#141E35',
    panelSecondary: '#182440',
    ink: '#F8FAFC',
    mute: '#CBD5E1',
    line: '#283653',
    acc: '#819BFF',
    accSoft: '#819BFF15',
    accInk: '#FFFFFF',
    ok: '#10B981',
    okSoft: '#10B98115',
    warn: '#F59E0B',
    warnSoft: '#F59E0B15',
    bad: '#F87171',
    badSoft: '#F8717115',
  },
  typography: {
    displayFamily: "'Inter', sans-serif",
    bodyFamily: "'Inter', sans-serif",
    numberFamily: "'Inter', sans-serif",
  },
};

export const allThemes: ThemeDefinition[] = [originalTheme];

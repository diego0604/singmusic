export type AppThemeId = 'paper' | 'warm' | 'graphite' | 'slate';

export interface AppThemeOption {
  id: AppThemeId;
  label: string;
  shortLabel: string;
  description: string;
  isDark: boolean;
  icon: string;
  swatches: readonly [string, string, string];
}

export const THEME_STORAGE_KEY = 'enciclopedia_theme_v1';
export const DEFAULT_APP_THEME: AppThemeId = 'paper';

export const APP_THEME_PRESETS: readonly AppThemeOption[] = [
  {
    id: 'paper',
    label: 'Claro · Papel',
    shortLabel: 'Papel',
    description: 'Limpio, editorial y descansado',
    isDark: false,
    icon: '☀️',
    swatches: ['#f5f6f8', '#ffffff', '#1d4ed8'],
  },
  {
    id: 'warm',
    label: 'Claro · Marfil',
    shortLabel: 'Marfil',
    description: 'Papel cálido con verde bosque',
    isDark: false,
    icon: '🌿',
    swatches: ['#f4f2ec', '#fcfbf8', '#0f766e'],
  },
  {
    id: 'graphite',
    label: 'Oscuro · Grafito',
    shortLabel: 'Grafito',
    description: 'Estudio neutro sin azul frío',
    isDark: true,
    icon: '🌑',
    swatches: ['#111113', '#1c1c20', '#eab308'],
  },
  {
    id: 'slate',
    label: 'Oscuro · Noche',
    shortLabel: 'Noche',
    description: 'Pizarra profunda con azul cielo',
    isDark: true,
    icon: '🌊',
    swatches: ['#0b101b', '#131b2b', '#38bdf8'],
  },
] as const;

export function resolveThemeId(raw: unknown): AppThemeId {
  if (typeof raw === 'string') {
    const found = APP_THEME_PRESETS.find((t) => t.id === raw);
    if (found) return found.id;
  }
  return DEFAULT_APP_THEME;
}

export function getThemePreset(id: AppThemeId): AppThemeOption {
  return APP_THEME_PRESETS.find((t) => t.id === id) ?? APP_THEME_PRESETS[0];
}

export function getNextThemeId(current: AppThemeId): AppThemeId {
  const idx = APP_THEME_PRESETS.findIndex((t) => t.id === current);
  if (idx < 0) return APP_THEME_PRESETS[0].id;
  return APP_THEME_PRESETS[(idx + 1) % APP_THEME_PRESETS.length].id;
}

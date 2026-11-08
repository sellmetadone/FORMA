/** FORMA Theme Engine — 11 built-in themes. Each defines the full color system. */

export type ThemeId =
  | 'winter'
  | 'summer'
  | 'autumn'
  | 'spring'
  | 'halloween'
  | 'newyear'
  | 'easter'
  | 'white'
  | 'dark'
  | 'pink'
  | 'golden';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  danger: string;
  success: string;
  warning: string;
  shadowSm: string;
  shadowMd: string;
  isDark: boolean;
}

export interface FormaTheme {
  id: ThemeId;
  nameKey: string;
  colors: ThemeColors;
  preview: [string, string, string];
}

export const THEMES: Record<ThemeId, FormaTheme> = {
  winter: {
    id: 'winter',
    nameKey: 'themes.winter',
    preview: ['#e8f1f8', '#3d6b8c', '#1a3a4a'],
    colors: {
      bg: '#f0f5f9',
      surface: '#e4eef5',
      surfaceHover: '#d4e4f0',
      border: '#b8cddc',
      borderSubtle: '#d0e0ec',
      text: '#1a2f3d',
      textSecondary: '#4a6a7a',
      textMuted: '#7a9aaa',
      accent: '#3d6b8c',
      accentHover: '#2d5570',
      accentMuted: '#d0e4f0',
      danger: '#c0392b',
      success: '#1e7a5a',
      warning: '#c07820',
      shadowSm: '0 1px 2px rgba(26, 47, 61, 0.06)',
      shadowMd: '0 4px 16px rgba(26, 47, 61, 0.08)',
      isDark: false,
    },
  },
  summer: {
    id: 'summer',
    nameKey: 'themes.summer',
    preview: ['#fff8e7', '#e8a838', '#f5f0e0'],
    colors: {
      bg: '#fffbf0',
      surface: '#fff5e0',
      surfaceHover: '#ffecc8',
      border: '#e8d4a8',
      borderSubtle: '#f0e4c8',
      text: '#3d2e14',
      textSecondary: '#7a6230',
      textMuted: '#a89060',
      accent: '#d4920a',
      accentHover: '#b07808',
      accentMuted: '#fff0d0',
      danger: '#c0392b',
      success: '#2d8a4e',
      warning: '#d4920a',
      shadowSm: '0 1px 2px rgba(61, 46, 20, 0.05)',
      shadowMd: '0 4px 16px rgba(61, 46, 20, 0.08)',
      isDark: false,
    },
  },
  autumn: {
    id: 'autumn',
    nameKey: 'themes.autumn',
    preview: ['#f5ebe0', '#c45c26', '#8b3a1a'],
    colors: {
      bg: '#faf4ee',
      surface: '#f2e6d8',
      surfaceHover: '#e8d8c4',
      border: '#d4bca0',
      borderSubtle: '#e8dcc8',
      text: '#3d2814',
      textSecondary: '#7a5530',
      textMuted: '#a88060',
      accent: '#c45c26',
      accentHover: '#a04818',
      accentMuted: '#f5e0d0',
      danger: '#b03020',
      success: '#4a7a30',
      warning: '#c45c26',
      shadowSm: '0 1px 2px rgba(61, 40, 20, 0.05)',
      shadowMd: '0 4px 16px rgba(61, 40, 20, 0.08)',
      isDark: false,
    },
  },
  spring: {
    id: 'spring',
    nameKey: 'themes.spring',
    preview: ['#f0f8f0', '#5a9a6a', '#e8f5e8'],
    colors: {
      bg: '#f5faf5',
      surface: '#e8f5e8',
      surfaceHover: '#d8eed8',
      border: '#b8d8b8',
      borderSubtle: '#d0e8d0',
      text: '#1a3d24',
      textSecondary: '#4a7a55',
      textMuted: '#7aaa85',
      accent: '#3d8a50',
      accentHover: '#2d7040',
      accentMuted: '#d8f0dc',
      danger: '#c0392b',
      success: '#3d8a50',
      warning: '#c09020',
      shadowSm: '0 1px 2px rgba(26, 61, 36, 0.05)',
      shadowMd: '0 4px 16px rgba(26, 61, 36, 0.08)',
      isDark: false,
    },
  },
  halloween: {
    id: 'halloween',
    nameKey: 'themes.halloween',
    preview: ['#1a1210', '#e07020', '#3d2010'],
    colors: {
      bg: '#14100e',
      surface: '#1e1814',
      surfaceHover: '#2a221c',
      border: '#3d3028',
      borderSubtle: '#2a221c',
      text: '#f0e4d8',
      textSecondary: '#b0a090',
      textMuted: '#807060',
      accent: '#e07020',
      accentHover: '#f08830',
      accentMuted: '#2a1c10',
      danger: '#e04030',
      success: '#50a040',
      warning: '#e07020',
      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      shadowMd: '0 4px 16px rgba(0, 0, 0, 0.4)',
      isDark: true,
    },
  },
  newyear: {
    id: 'newyear',
    nameKey: 'themes.newyear',
    preview: ['#0e1420', '#c0a040', '#1a2438'],
    colors: {
      bg: '#0c1018',
      surface: '#141c28',
      surfaceHover: '#1c2838',
      border: '#2a3848',
      borderSubtle: '#1c2838',
      text: '#e8ecf4',
      textSecondary: '#90a0b8',
      textMuted: '#607088',
      accent: '#c0a040',
      accentHover: '#d4b450',
      accentMuted: '#1c2010',
      danger: '#e05050',
      success: '#40a070',
      warning: '#c0a040',
      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      shadowMd: '0 4px 16px rgba(0, 0, 0, 0.4)',
      isDark: true,
    },
  },
  easter: {
    id: 'easter',
    nameKey: 'themes.easter',
    preview: ['#f8f0f8', '#9a70b8', '#e8e0f0'],
    colors: {
      bg: '#faf6fc',
      surface: '#f2ecf8',
      surfaceHover: '#e8e0f4',
      border: '#d0c4e0',
      borderSubtle: '#e4dcf0',
      text: '#2e1e3d',
      textSecondary: '#6a5580',
      textMuted: '#9880a8',
      accent: '#8a60b0',
      accentHover: '#704898',
      accentMuted: '#efe8f8',
      danger: '#c04050',
      success: '#50a070',
      warning: '#c09040',
      shadowSm: '0 1px 2px rgba(46, 30, 61, 0.05)',
      shadowMd: '0 4px 16px rgba(46, 30, 61, 0.08)',
      isDark: false,
    },
  },
  white: {
    id: 'white',
    nameKey: 'themes.white',
    preview: ['#ffffff', '#2d5a4a', '#f5f5f5'],
    colors: {
      bg: '#ffffff',
      surface: '#f7f7f7',
      surfaceHover: '#eeeeee',
      border: '#e2e2e2',
      borderSubtle: '#eeeeee',
      text: '#1a1a1a',
      textSecondary: '#5c5c5c',
      textMuted: '#949494',
      accent: '#2d5a4a',
      accentHover: '#234a3c',
      accentMuted: '#e6f0ec',
      danger: '#c0392b',
      success: '#27ae60',
      warning: '#d68910',
      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      shadowMd: '0 4px 16px rgba(0, 0, 0, 0.08)',
      isDark: false,
    },
  },
  dark: {
    id: 'dark',
    nameKey: 'themes.dark',
    preview: ['#1a1a1a', '#4a8a72', '#242424'],
    colors: {
      bg: '#141414',
      surface: '#1e1e1e',
      surfaceHover: '#2a2a2a',
      border: '#333333',
      borderSubtle: '#262626',
      text: '#f0f0f0',
      textSecondary: '#a0a0a0',
      textMuted: '#6e6e6e',
      accent: '#4a8a72',
      accentHover: '#5aa082',
      accentMuted: '#1a2e26',
      danger: '#e74c3c',
      success: '#2ecc71',
      warning: '#f39c12',
      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      shadowMd: '0 4px 16px rgba(0, 0, 0, 0.4)',
      isDark: true,
    },
  },
  pink: {
    id: 'pink',
    nameKey: 'themes.pink',
    preview: ['#fff0f5', '#d06090', '#fce4ec'],
    colors: {
      bg: '#fff5f8',
      surface: '#fce8f0',
      surfaceHover: '#f8d8e4',
      border: '#e8c0d0',
      borderSubtle: '#f4dce6',
      text: '#3d1a2a',
      textSecondary: '#8a5068',
      textMuted: '#b08098',
      accent: '#c05080',
      accentHover: '#a04068',
      accentMuted: '#fce0ec',
      danger: '#c03040',
      success: '#40a070',
      warning: '#d08040',
      shadowSm: '0 1px 2px rgba(61, 26, 42, 0.05)',
      shadowMd: '0 4px 16px rgba(61, 26, 42, 0.08)',
      isDark: false,
    },
  },
  golden: {
    id: 'golden',
    nameKey: 'themes.golden',
    preview: ['#1a1610', '#d4a830', '#2a2418'],
    colors: {
      bg: '#12100c',
      surface: '#1c1810',
      surfaceHover: '#282218',
      border: '#3a3220',
      borderSubtle: '#282218',
      text: '#f4ecd8',
      textSecondary: '#b0a080',
      textMuted: '#807060',
      accent: '#d4a830',
      accentHover: '#e8bc40',
      accentMuted: '#2a2410',
      danger: '#e05040',
      success: '#50a060',
      warning: '#d4a830',
      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      shadowMd: '0 4px 16px rgba(0, 0, 0, 0.4)',
      isDark: true,
    },
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
export const DEFAULT_THEME_ID: ThemeId = 'white';

/** Apply theme colors as CSS custom properties on document root. */
export function applyTheme(themeId: ThemeId): void {
  if (typeof document === 'undefined') return;
  const theme = THEMES[themeId] ?? THEMES[DEFAULT_THEME_ID];
  const root = document.documentElement;
  const c = theme.colors;

  root.style.setProperty('--forma-bg', c.bg);
  root.style.setProperty('--forma-surface', c.surface);
  root.style.setProperty('--forma-surface-hover', c.surfaceHover);
  root.style.setProperty('--forma-border', c.border);
  root.style.setProperty('--forma-border-subtle', c.borderSubtle);
  root.style.setProperty('--forma-text', c.text);
  root.style.setProperty('--forma-text-secondary', c.textSecondary);
  root.style.setProperty('--forma-text-muted', c.textMuted);
  root.style.setProperty('--forma-accent', c.accent);
  root.style.setProperty('--forma-accent-hover', c.accentHover);
  root.style.setProperty('--forma-accent-muted', c.accentMuted);
  root.style.setProperty('--forma-danger', c.danger);
  root.style.setProperty('--forma-success', c.success);
  root.style.setProperty('--forma-warning', c.warning);
  root.style.setProperty('--forma-shadow-sm', c.shadowSm);
  root.style.setProperty('--forma-shadow-md', c.shadowMd);

  root.setAttribute('data-theme', themeId);
  root.setAttribute('data-theme-mode', c.isDark ? 'dark' : 'light');
}

/** Preview theme without persisting (temporary apply). */
export function previewTheme(themeId: ThemeId): void {
  applyTheme(themeId);
}

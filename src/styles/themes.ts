/**
 * Built-in themes. Each one sets every color token for light and dark mode, and
 * global-styles turns them into `:root[data-theme][data-bs-theme]` rules, so adding a theme
 * is adding an entry here.
 */
export type ColorTokens = Record<
  | 'bg'
  | 'surface'
  | 'surface-muted'
  | 'border'
  | 'border-strong'
  | 'text'
  | 'text-muted'
  | 'heading'
  | 'accent'
  | 'accent-hover'
  | 'accent-soft'
  | 'on-accent'
  | 'leaf'
  | 'leaf-soft'
  | 'skeleton'
  | 'code-bg'
  | 'header-bg',
  string
>;

export interface Theme {
  id: string;
  label: string;
  light: ColorTokens;
  dark: ColorTokens;
}

export const DEFAULT_THEME = 'indigo';

export const themes: Theme[] = [
  {
    id: 'indigo',
    label: 'Indigo',
    light: {
      bg: '#f7f6f3',
      surface: '#ffffff',
      'surface-muted': '#f1efea',
      border: '#e6e2da',
      'border-strong': '#d6d1c6',
      text: '#1d1c21',
      'text-muted': '#6b6a73',
      heading: '#121116',
      accent: '#4f46e5',
      'accent-hover': '#4338ca',
      'accent-soft': 'rgb(79 70 229 / 0.1)',
      'on-accent': '#ffffff',
      leaf: '#2f8f4e',
      'leaf-soft': 'rgb(47 143 78 / 0.12)',
      skeleton: '#e8e4dc',
      'code-bg': '#f2efe9',
      'header-bg': 'rgb(247 246 243 / 0.82)',
    },
    dark: {
      bg: '#111114',
      surface: '#18181c',
      'surface-muted': '#1f1f24',
      border: '#2a2a31',
      'border-strong': '#3b3b44',
      text: '#d6d5dc',
      'text-muted': '#9998a4',
      heading: '#f4f3f8',
      accent: '#8f89ff',
      'accent-hover': '#a9a4ff',
      'accent-soft': 'rgb(143 137 255 / 0.15)',
      'on-accent': '#13112a',
      leaf: '#5fcf87',
      'leaf-soft': 'rgb(95 207 135 / 0.15)',
      skeleton: '#27272e',
      'code-bg': '#1c1c22',
      'header-bg': 'rgb(17 17 20 / 0.8)',
    },
  },
  {
    id: 'sepia',
    label: 'Sepia',
    light: {
      bg: '#f3ead7',
      surface: '#fbf6eb',
      'surface-muted': '#ece1cb',
      border: '#e0d3b8',
      'border-strong': '#cdbd9c',
      text: '#3d3122',
      'text-muted': '#76644e',
      heading: '#2a2016',
      accent: '#a8551c',
      'accent-hover': '#8d4515',
      'accent-soft': 'rgb(168 85 28 / 0.12)',
      'on-accent': '#ffffff',
      leaf: '#5a7d2a',
      'leaf-soft': 'rgb(90 125 42 / 0.14)',
      skeleton: '#e6dac2',
      'code-bg': '#efe4cf',
      'header-bg': 'rgb(243 234 215 / 0.85)',
    },
    dark: {
      bg: '#1a1510',
      surface: '#221c15',
      'surface-muted': '#29221a',
      border: '#3a3024',
      'border-strong': '#4d4031',
      text: '#e2d4bc',
      'text-muted': '#a8977d',
      heading: '#f3e8d4',
      accent: '#e3a462',
      'accent-hover': '#efbb84',
      'accent-soft': 'rgb(227 164 98 / 0.15)',
      'on-accent': '#23160a',
      leaf: '#a3c46b',
      'leaf-soft': 'rgb(163 196 107 / 0.15)',
      skeleton: '#2f271e',
      'code-bg': '#261f17',
      'header-bg': 'rgb(26 21 16 / 0.82)',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    light: {
      bg: '#f2f6f7',
      surface: '#ffffff',
      'surface-muted': '#e7eef0',
      border: '#d8e3e6',
      'border-strong': '#c0d0d5',
      text: '#18262b',
      'text-muted': '#56696f',
      heading: '#0d1a1e',
      accent: '#0e7c86',
      'accent-hover': '#0a646c',
      'accent-soft': 'rgb(14 124 134 / 0.11)',
      'on-accent': '#ffffff',
      leaf: '#2a8a57',
      'leaf-soft': 'rgb(42 138 87 / 0.12)',
      skeleton: '#dde7ea',
      'code-bg': '#e9f0f2',
      'header-bg': 'rgb(242 246 247 / 0.82)',
    },
    dark: {
      bg: '#0c1416',
      surface: '#111c1f',
      'surface-muted': '#152226',
      border: '#20323a',
      'border-strong': '#2d454e',
      text: '#cfdfe3',
      'text-muted': '#8ea7ae',
      heading: '#ecf6f8',
      accent: '#3cc8c8',
      'accent-hover': '#6ad8d8',
      'accent-soft': 'rgb(60 200 200 / 0.14)',
      'on-accent': '#04191b',
      leaf: '#5ed39a',
      'leaf-soft': 'rgb(94 211 154 / 0.15)',
      skeleton: '#1b2b30',
      'code-bg': '#142226',
      'header-bg': 'rgb(12 20 22 / 0.82)',
    },
  },
  {
    id: 'contrast',
    label: 'High contrast',
    light: {
      bg: '#ffffff',
      surface: '#ffffff',
      'surface-muted': '#f0f0f0',
      border: '#8a8a8a',
      'border-strong': '#4d4d4d',
      text: '#000000',
      'text-muted': '#2e2e2e',
      heading: '#000000',
      accent: '#0033cc',
      'accent-hover': '#00258f',
      'accent-soft': 'rgb(0 51 204 / 0.14)',
      'on-accent': '#ffffff',
      leaf: '#006b2b',
      'leaf-soft': 'rgb(0 107 43 / 0.14)',
      skeleton: '#d9d9d9',
      'code-bg': '#f0f0f0',
      'header-bg': 'rgb(255 255 255 / 0.96)',
    },
    dark: {
      bg: '#000000',
      surface: '#0a0a0a',
      'surface-muted': '#161616',
      border: '#8c8c8c',
      'border-strong': '#c4c4c4',
      text: '#ffffff',
      'text-muted': '#e0e0e0',
      heading: '#ffffff',
      accent: '#ffd400',
      'accent-hover': '#ffe14d',
      'accent-soft': 'rgb(255 212 0 / 0.2)',
      'on-accent': '#000000',
      leaf: '#6dff9b',
      'leaf-soft': 'rgb(109 255 155 / 0.2)',
      skeleton: '#262626',
      'code-bg': '#161616',
      'header-bg': 'rgb(0 0 0 / 0.95)',
    },
  },
];

export function tokensToCss(tokens: ColorTokens): string {
  return Object.entries(tokens)
    .map(([name, value]) => `--db-${name}: ${value};`)
    .join('\n');
}

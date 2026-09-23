import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import type { SeverityBandKey } from './uas';

const FONT_FAMILY = "'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Apply a single coherent font stack to every MD3 type variant. */
function stackFonts(theme: MD3Theme): MD3Theme {
  const fonts: Record<string, object> = {};
  for (const [k, v] of Object.entries(theme.fonts)) {
    fonts[k] = { ...v, fontFamily: FONT_FAMILY };
  }
  return { ...theme, fonts: fonts as MD3Theme['fonts'] };
}

const lightColors = {
  primary: '#1d4ed8',
  onPrimary: '#ffffff',
  primaryContainer: '#dbe5ff',
  onPrimaryContainer: '#001a44',
  secondary: '#7c3aed',
  onSecondary: '#ffffff',
  secondaryContainer: '#ece6ff',
  onSecondaryContainer: '#22005c',
  tertiary: '#be2875',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffd8e4',
  onTertiaryContainer: '#3e0020',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#410002',
  background: '#f6f7f9',
  onBackground: '#1a1c1e',
  surface: '#ffffff',
  onSurface: '#1a1c1e',
  surfaceVariant: '#e2e4ea',
  onSurfaceVariant: '#45474e',
  outline: '#76787f',
  outlineVariant: '#c5c7cd',
  inverseSurface: '#2f3136',
  inverseOnSurface: '#f1f2f5',
};

const darkColors = {
  primary: '#93c5fd',
  onPrimary: '#0a2840',
  primaryContainer: '#1e3a5f',
  onPrimaryContainer: '#d7e5ff',
  secondary: '#c4b5fd',
  onSecondary: '#302253',
  secondaryContainer: '#402e61',
  onSecondaryContainer: '#e8ddff',
  tertiary: '#f1a9cd',
  onTertiary: '#481f3c',
  tertiaryContainer: '#7c2f58',
  onTertiaryContainer: '#ffd8e4',
  error: '#f2b8b5',
  onError: '#601410',
  errorContainer: '#8c1d18',
  onErrorContainer: '#f9dedc',
  background: '#0f1215',
  onBackground: '#e3e5e9',
  surface: '#141719',
  onSurface: '#e3e5e9',
  surfaceVariant: '#40444a',
  onSurfaceVariant: '#c5c8ce',
  outline: '#8f939b',
  outlineVariant: '#40444a',
  inverseSurface: '#e3e5e9',
  inverseOnSurface: '#141719',
};

export const lightTheme: MD3Theme = stackFonts({
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...lightColors },
});

export const darkTheme: MD3Theme = stackFonts({
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...darkColors },
});

export interface Tone {
  bg: string;
  fg: string;
}

/**
 * 0–3 score severity tones, tuned for readable contrast in each mode.
 * 0 neutral · 1 pink/rose · 2 red · 3 violet.
 */
export const SCORE_TONES: Record<'light' | 'dark', Tone[]> = {
  light: [
    { bg: '#eceff3', fg: '#1a1d21' },
    { bg: '#f9a8d4', fg: '#3b0a2c' },
    { bg: '#ef4444', fg: '#ffffff' },
    { bg: '#8b5cf6', fg: '#ffffff' },
  ],
  dark: [
    { bg: '#262a30', fg: '#d4d8de' },
    { bg: '#a4496f', fg: '#ffffff' },
    { bg: '#ef4444', fg: '#ffffff' },
    { bg: '#8b5cf6', fg: '#ffffff' },
  ],
};

/** Legible label color on each severity band chip (bands keep their accent bg). */
export const BAND_TEXT: Record<SeverityBandKey, string> = {
  free: '#ffffff',
  'well-controlled': '#ffffff',
  mild: '#fff3cd',
  moderate: '#ffffff',
  severe: '#ffffff',
};

/** The chart consumes these semantic roles directly from the active MD3 theme. */
export interface Palette {
  card: string;
  text: string;
  faint: string;
  barFill: string;
  barFillSelected: string;
  barEmptyBorder: string;
}
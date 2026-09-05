export interface Palette {
  mode: 'light' | 'dark';
  background: string;
  card: string;
  text: string;
  subtext: string;
  faint: string;
  border: string;
  inputBg: string;
  chipBg: string;
  chipText: string;
  activeChipBg: string;
  activeChipText: string;
  optionActiveBg: string;
  optionActiveText: string;
  primaryBtnBg: string;
  primaryBtnText: string;
  dangerBg: string;
  dangerText: string;
  barTrack: string;
  barFill: string;
  barFillSelected: string;
  barEmptyBorder: string;
  progressTrack: string;
  shadow: string;
  statusBar: 'auto' | 'light' | 'dark';
}

export const LightPalette: Palette = {
  mode: 'light',
  background: '#f1f5f9',
  card: '#ffffff',
  text: '#0f172a',
  subtext: '#475569',
  faint: '#64748b',
  border: '#e2e8f0',
  inputBg: '#f8fafc',
  chipBg: '#f1f5f9',
  chipText: '#334155',
  activeChipBg: '#0f172a',
  activeChipText: '#ffffff',
  optionActiveBg: '#eff6ff',
  optionActiveText: '#1d4ed8',
  primaryBtnBg: '#0f172a',
  primaryBtnText: '#ffffff',
  dangerBg: '#fee2e2',
  dangerText: '#b91c1c',
  barTrack: '#f1f5f9',
  barFill: '#2563eb',
  barFillSelected: '#7c3aed',
  barEmptyBorder: '#cbd5e1',
  progressTrack: '#e2e8f0',
  shadow: '0 2px 6px rgba(0,0,0,0.05)',
  statusBar: 'dark',
};

export const DarkPalette: Palette = {
  mode: 'dark',
  background: '#0b1220',
  card: '#16202f',
  text: '#f1f5f9',
  subtext: '#cbd5e1',
  faint: '#94a3b8',
  border: '#2b3a4f',
  inputBg: '#0f1929',
  chipBg: '#223047',
  chipText: '#e2e8f0',
  activeChipBg: '#e2e8f0',
  activeChipText: '#0f172a',
  optionActiveBg: '#1e3a5f',
  optionActiveText: '#93c5fd',
  primaryBtnBg: '#e2e8f0',
  primaryBtnText: '#0f172a',
  dangerBg: '#450a0a',
  dangerText: '#fca5a5',
  barTrack: '#223047',
  barFill: '#60a5fa',
  barFillSelected: '#a78bfa',
  barEmptyBorder: '#475569',
  progressTrack: '#2b3a4f',
  shadow: '0 2px 6px rgba(0,0,0,0.4)',
  statusBar: 'light',
};

export function resolvePalette(pref: 'system' | 'light' | 'dark', systemDark: boolean): Palette {
  if (pref === 'light') return LightPalette;
  if (pref === 'dark') return DarkPalette;
  return systemDark ? DarkPalette : LightPalette;
}

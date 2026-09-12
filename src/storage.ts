import AsyncStorage from '@react-native-async-storage/async-storage';
import { SETTINGS_KEY, type Settings } from './i18n';
import type { DailyEntry } from './uas';

const KEY = '@uas7_entries_v1';

export async function loadEntries(): Promise<Record<string, DailyEntry>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DailyEntry>;
    // Basic hygiene: drop malformed rows.
    const clean: Record<string, DailyEntry> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (
        v &&
        typeof v.date === 'string' &&
        [0, 1, 2, 3].includes(v.wheals) &&
        [0, 1, 2, 3].includes(v.itch)
      ) {
        const row: DailyEntry = { ...v, date: k, total: v.wheals + v.itch };
        // Keep notes as trimmed strings; drop empty / non-string values.
        if (typeof v.note === 'string') {
          const trimmed = v.note.trim().slice(0, 500);
          if (trimmed) row.note = trimmed;
          else delete row.note;
        }
        clean[k] = row;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export async function saveEntries(byDate: Record<string, DailyEntry>): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(byDate));
}

export async function clearEntries(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

const DEFAULT_SETTINGS: Settings = { lang: 'system', theme: 'system' };

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      lang: parsed.lang === 'en' || parsed.lang === 'zh-Hant' ? parsed.lang : 'system',
      theme: parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : 'system',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

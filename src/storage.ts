import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_NICKNAME_LENGTH, SETTINGS_KEY, type Settings } from './i18n';
import { isValidDateKey, isValidScore, makeEntry, type DailyEntry } from './uas';

const KEY = '@uas7_entries_v1';

export async function loadEntries(): Promise<Record<string, DailyEntry>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    // Basic hygiene: drop malformed rows and strip unexpected fields.
    const clean: Record<string, DailyEntry> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!isValidDateKey(k) || !v || typeof v !== 'object' || Array.isArray(v)) continue;
      const rec = v as Record<string, unknown>;
      if (isValidScore(rec.wheals) && isValidScore(rec.itch)) {
        clean[k] = makeEntry(
          k,
          rec.wheals,
          rec.itch,
          typeof rec.note === 'string' ? rec.note : undefined,
        );
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export async function saveEntries(byDate: Record<string, DailyEntry>): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(byDate));
  } catch {
    // Ignore storage write errors (e.g. private browsing / quota exceeded)
  }
}

export async function clearEntries(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Ignore storage errors
  }
}

const DEFAULT_SETTINGS: Settings = { lang: 'system', theme: 'system', nickname: '', nicknameAsked: false };

export function cleanNickname(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().slice(0, MAX_NICKNAME_LENGTH) : '';
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return DEFAULT_SETTINGS;
    const rec = parsed as Partial<Settings>;
    return {
      lang: rec.lang === 'en' || rec.lang === 'zh-Hant' ? rec.lang : 'system',
      theme: rec.theme === 'light' || rec.theme === 'dark' ? rec.theme : 'system',
      nickname: cleanNickname(rec.nickname),
      nicknameAsked: rec.nicknameAsked === true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // Ignore storage write errors (e.g. private browsing / quota exceeded)
  }
}

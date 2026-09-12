/**
 * UAS7 domain logic (pure, testable, no React Native dependencies).
 *
 * Daily UAS = wheals (0-3) + itch (0-3) => 0-6.
 * UAS7 = sum of daily UAS over the last 7 days => 0-42.
 *
 * Standard severity bands used in clinical practice:
 *   0        = Urticaria-free
 *   1-6      = Well controlled
 *   7-15     = Mild
 *   16-27    = Moderate
 *   28-42    = Severe
 */

export type Score0to3 = 0 | 1 | 2 | 3;

export interface DailyEntry {
  /** Local calendar date key: YYYY-MM-DD */
  date: string;
  wheals: Score0to3;
  itch: Score0to3;
  /** Cached sum wheals + itch (0-6) */
  total: number;
  /** Optional free-text note for the day (triggers, meds, sleep, …) */
  note?: string;
}

export interface DayScore {
  date: string;
  /** Short label for charts, e.g. "Mon 1" */
  label: string;
  entry: DailyEntry | null;
  total: number | null;
}

export interface UAS7Result {
  sum: number;
  recordedDays: number;
  complete: boolean;
  band: SeverityBand;
}

export type SeverityBandKey =
  | 'free'
  | 'well-controlled'
  | 'mild'
  | 'moderate'
  | 'severe';

export interface SeverityBand {
  key: SeverityBandKey;
  title: string;
  range: string;
  description: string;
  color: string;
}

export const WHEALS_OPTIONS: { value: Score0to3; title: string; detail: string }[] = [
  { value: 0, title: '0 — None', detail: 'No wheals in the last 24h' },
  { value: 1, title: '1 — Mild', detail: '< 20 wheals / 24h' },
  { value: 2, title: '2 — Moderate', detail: '20–50 wheals / 24h' },
  { value: 3, title: '3 — Intense', detail: '> 50 wheals / 24h or large confluent areas' },
];

export const ITCH_OPTIONS: { value: Score0to3; title: string; detail: string }[] = [
  { value: 0, title: '0 — None', detail: 'No itch in the last 24h' },
  { value: 1, title: '1 — Mild', detail: 'Present but not annoying' },
  { value: 2, title: '2 — Moderate', detail: 'Troublesome but does not interfere with sleep/activity' },
  { value: 3, title: '3 — Intense', detail: 'Severe, interferes with sleep/activity' },
];

export function dailyTotal(wheals: Score0to3, itch: Score0to3): number {
  return wheals + itch;
}

export const MAX_NOTE_LENGTH = 500;

export function makeEntry(
  date: string,
  wheals: Score0to3,
  itch: Score0to3,
  note?: string,
): DailyEntry {
  const entry: DailyEntry = { date, wheals, itch, total: dailyTotal(wheals, itch) };
  const trimmed = (note ?? '').trim().slice(0, MAX_NOTE_LENGTH);
  if (trimmed) entry.note = trimmed;
  return entry;
}

/** True when the entry carries a non-empty note. */
export function hasNote(entry: DailyEntry | null | undefined): boolean {
  return !!entry?.note?.trim();
}

export function isValidScore(n: unknown): n is Score0to3 {
  return n === 0 || n === 1 || n === 2 || n === 3;
}

/** Local YYYY-MM-DD key (avoids UTC-shift bugs from toISOString). */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** 7 keys ending today (or ending at `ref`), oldest first. */
export function last7Keys(ref: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
}

const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_ZH = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

export type LabelLang = 'en' | 'zh-Hant';

/** Fixed "MM/dd DDD" label (locale-independent) for charts and date chips. */
export function shortLabel(dateStr: string, lang: LabelLang = 'en'): string {
  const d = parseDateKey(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const wd = lang === 'zh-Hant' ? WEEKDAYS_ZH[d.getDay()] : WEEKDAYS_EN[d.getDay()];
  return `${mm}/${dd} ${wd}`;
}

/** Join stored entries with the last-7 calendar, oldest first. Missing days => null. */
export function buildLast7(
  byDate: Record<string, DailyEntry>,
  ref: Date = new Date(),
  lang: LabelLang = 'en',
): DayScore[] {
  return last7Keys(ref).map((date) => ({
    date,
    label: shortLabel(date, lang),
    entry: byDate[date] ?? null,
    total: byDate[date] ? byDate[date].total : null,
  }));
}

export function calcUAS7(days: DayScore[]): UAS7Result {
  const recorded = days.filter((d) => d.total !== null);
  const sum = recorded.reduce((acc, d) => acc + (d.total ?? 0), 0);
  const recordedDays = recorded.length;
  return {
    sum,
    recordedDays,
    complete: recordedDays === 7,
    band: severityFor(sum),
  };
}

export function severityFor(uas7: number): SeverityBand {  if (uas7 <= 0) {
    return {
      key: 'free',
      title: 'Urticaria-free',
      range: 'UAS7 = 0',
      description: 'No disease activity recorded in the last 7 days.',
      color: '#15803d',
    };
  }
  if (uas7 <= 6) {
    return {
      key: 'well-controlled',
      title: 'Well controlled',
      range: 'UAS7 1–6',
      description: 'Minimal activity. Maintain current management.',
      color: '#16a34a',
    };
  }
  if (uas7 <= 15) {
    return {
      key: 'mild',
      title: 'Mild',
      range: 'UAS7 7–15',
      description: 'Mild activity over the past week.',
      color: '#ca8a04',
    };
  }
  if (uas7 <= 27) {
    return {
      key: 'moderate',
      title: 'Moderate',
      range: 'UAS7 16–27',
      description: 'Moderate activity — consider discussing with your clinician.',
      color: '#ea580c',
    };
  }
  return {
    key: 'severe',
    title: 'Severe',
    range: 'UAS7 28–42',
    description: 'Severe activity — please contact your clinician.',
    color: '#dc2626',
  };
}

export interface WeeklySum {
  /** First day key (YYYY-MM-DD) of the 7-day block. */
  start: string;
  /** Last day key (YYYY-MM-DD) of the 7-day block. */
  end: string;
  /** Human label, e.g. "08/10 – 08/16". */
  label: string;
  sum: number;
  recordedDays: number;
  complete: boolean;
  band: SeverityBand;
}

/**
 * Accumulated UAS7 for each of the past 4 weeks, newest first.
 * Week 0 = last 7 days (same window as the UAS7 summary),
 * week 1 = days 8–14 ago, and so on.
 */
export function calcPast4Weeks(
  byDate: Record<string, DailyEntry>,
  ref: Date = new Date(),
  lang: LabelLang = 'en',
): WeeklySum[] {
  const out: WeeklySum[] = [];
  for (let w = 0; w < 4; w++) {
    const end = new Date(ref);
    end.setDate(end.getDate() - w * 7);
    const start = new Date(ref);
    start.setDate(start.getDate() - w * 7 - 6);
    const startKey = dateKey(start);
    const endKey = dateKey(end);
    let sum = 0;
    let recordedDays = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const entry = byDate[dateKey(d)];
      if (entry) {
        sum += entry.total;
        recordedDays++;
      }
    }
    out.push({
      start: startKey,
      end: endKey,
      label: `${shortLabel(startKey, lang)} – ${shortLabel(endKey, lang)}`,
      sum,
      recordedDays,
      complete: recordedDays === 7,
      band: severityFor(sum),
    });
  }
  return out;
}

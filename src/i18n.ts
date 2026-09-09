import * as Localization from 'expo-localization';
import type { Score0to3, SeverityBandKey } from './uas';

export type Lang = 'en' | 'zh-Hant';
export type LangPref = 'system' | Lang;
export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
  lang: LangPref;
  theme: ThemePref;
}

export const SETTINGS_KEY = '@uas7_settings_v1';

export function deviceLang(): Lang {
  try {
    const locales = Localization.getLocales();
    const first = locales[0];
    if (first && first.languageCode === 'zh') return 'zh-Hant';
    return 'en';
  } catch {
    return 'en';
  }
}

export function resolveLang(pref: LangPref): Lang {
  return pref === 'system' ? deviceLang() : pref;
}

export interface ScoreOption {
  value: Score0to3;
  title: string;
  detail: string;
}

export interface Strings {
  appName: string;
  subtitle: string;
  sectionEntry: string;
  whichDay: string;
  today: string;
  recordingFor: string;
  whealsLabel: string;
  whealsHint: string;
  itchLabel: string;
  itchHint: string;
  whealsOptions: ScoreOption[];
  itchOptions: ScoreOption[];
  dailyUas: (date: string, total: number) => string;
  saveHintUpdate: string;
  saveHintRecord: string;
  save: string;
  delete: string;
  deleteTitle: string;
  deleteMessage: (date: string) => string;
  cancel: string;
  sectionSummary: string;
  recordedDays: (n: number) => string;
  provisional: string;
  sectionTrend: string;
  chartHint: string;
  history: string;
  noEntry: string;
  entrySub: (wheals: number, itch: number) => string;
  missing: string;
  settings: string;
  done: string;
  language: string;
  theme: string;
  optSystem: string;
  optLight: string;
  optDark: string;
  optEnglish: string;
  optChinese: string;
  bands: Record<SeverityBandKey, { title: string; description: string }>;
  footer: string;
}

const en: Strings = {
  appName: 'UAS7 Diary',
  subtitle: 'Record wheals + itch (0–3 each) every day. Daily UAS 0–6, weekly UAS7 0–42.',
  sectionEntry: '1 · Daily entry',
  whichDay: 'Which day?',
  today: 'Today',
  recordingFor: 'Recording for:',
  whealsLabel: 'Wheals (hives) — 0 to 3',
  whealsHint: 'Amount of wheals in the last 24 hours',
  itchLabel: 'Itch (pruritus) — 0 to 3',
  itchHint: 'Level of itch in the last 24 hours',
  whealsOptions: [
    { value: 0, title: '0 — None', detail: 'No wheals in the last 24h' },
    { value: 1, title: '1 — Mild', detail: '< 20 wheals / 24h' },
    { value: 2, title: '2 — Moderate', detail: '20–50 wheals / 24h' },
    { value: 3, title: '3 — Intense', detail: '> 50 wheals / 24h or large confluent areas' },
  ],
  itchOptions: [
    { value: 0, title: '0 — None', detail: 'No itch in the last 24h' },
    { value: 1, title: '1 — Mild', detail: 'Present but not annoying' },
    { value: 2, title: '2 — Moderate', detail: 'Troublesome but does not interfere with sleep/activity' },
    { value: 3, title: '3 — Intense', detail: 'Severe, interferes with sleep/activity' },
  ],
  dailyUas: (date, total) => `Daily UAS for ${date}: ${total} / 6`,
  saveHintUpdate: 'tap Save to update.',
  saveHintRecord: 'tap Save to record.',
  save: 'Save entry',
  delete: 'Delete',
  deleteTitle: 'Delete entry?',
  deleteMessage: (date) => `Remove the entry for ${date}?`,
  cancel: 'Cancel',
  sectionSummary: '2 · UAS7 summary (last 7 days)',
  recordedDays: (n) => `${n} of 7 days recorded`,
  provisional: ' — sum is provisional until all 7 days are entered.',
  sectionTrend: '3 · 7-day trend',
  chartHint: 'Line = daily UAS (0–6). Hollow markers = missing days.',
  history: 'History',
  noEntry: 'No entry — tap to add',
  entrySub: (w, i) => `Wheals ${w} · Itch ${i}`,
  missing: '–',
  settings: 'Settings',
  done: 'Done',
  language: 'Language',
  theme: 'Theme',
  optSystem: 'System',
  optLight: 'Light',
  optDark: 'Dark',
  optEnglish: 'English',
  optChinese: '繁體中文',
  bands: {
    free: { title: 'Urticaria-free', description: 'No disease activity recorded in the last 7 days.' },
    'well-controlled': { title: 'Well controlled', description: 'Minimal activity. Maintain current management.' },
    mild: { title: 'Mild', description: 'Mild activity over the past week.' },
    moderate: { title: 'Moderate', description: 'Moderate activity — consider discussing with your clinician.' },
    severe: { title: 'Severe', description: 'Severe activity — please contact your clinician.' },
  },
  footer:
    'Bands: 0 free · 1–6 well controlled · 7–15 mild · 16–27 moderate · 28–42 severe.\nThis app is a diary aid, not medical advice.',
};

const zhHant: Strings = {
  appName: '蕁麻疹日記',
  subtitle: '每天記錄風疹塊＋搔癢（各 0–3 分）。每日 UAS 0–6，每週 UAS7 0–42。',
  sectionEntry: '1 · 每日紀錄',
  whichDay: '選擇日期',
  today: '今天',
  recordingFor: '紀錄日期：',
  whealsLabel: '風疹塊 — 0 至 3',
  whealsHint: '過去 24 小時內的風疹塊數量',
  itchLabel: '搔癢 — 0 至 3',
  itchHint: '過去 24 小時內的搔癢程度',
  whealsOptions: [
    { value: 0, title: '0 — 無', detail: '過去 24 小時無風疹塊' },
    { value: 1, title: '1 — 輕度', detail: '24 小時內少於 20 顆' },
    { value: 2, title: '2 — 中度', detail: '24 小時內 20–50 顆' },
    { value: 3, title: '3 — 嚴重', detail: '24 小時內超過 50 顆或大片融合' },
  ],
  itchOptions: [
    { value: 0, title: '0 — 無', detail: '過去 24 小時無搔癢' },
    { value: 1, title: '1 — 輕度', detail: '有搔癢但不困擾' },
    { value: 2, title: '2 — 中度', detail: '會困擾，但不影響睡眠／日常活動' },
    { value: 3, title: '3 — 嚴重', detail: '嚴重搔癢，影響睡眠／日常活動' },
  ],
  dailyUas: (date, total) => `${date} 每日 UAS：${total} / 6`,
  saveHintUpdate: '點「儲存」以更新。',
  saveHintRecord: '點「儲存」以紀錄。',
  save: '儲存紀錄',
  delete: '刪除',
  deleteTitle: '刪除紀錄？',
  deleteMessage: (date) => `要刪除 ${date} 的紀錄嗎？`,
  cancel: '取消',
  sectionSummary: '2 · UAS7 總結（過去 7 天）',
  recordedDays: (n) => `已紀錄 ${n}／7 天`,
  provisional: ' — 集滿 7 天前總分僅供參考。',
  sectionTrend: '3 · 7 天趨勢',
  chartHint: '折線＝每日 UAS（0–6）。空心點＝缺漏日期。',
  history: '歷史紀錄',
  noEntry: '尚無紀錄 — 點選以新增',
  entrySub: (w, i) => `風疹塊 ${w} · 搔癢 ${i}`,
  missing: '–',
  settings: '設定',
  done: '完成',
  language: '語言',
  theme: '主題',
  optSystem: '跟隨系統',
  optLight: '淺色',
  optDark: '深色',
  optEnglish: 'English',
  optChinese: '繁體中文',
  bands: {
    free: { title: '無蕁麻疹', description: '過去 7 天無疾病活動。' },
    'well-controlled': { title: '控制良好', description: '疾病活動極輕微，請維持目前處置。' },
    mild: { title: '輕度', description: '過去一週為輕度活動。' },
    moderate: { title: '中度', description: '中度活動 — 建議與醫師討論。' },
    severe: { title: '重度', description: '重度活動 — 請聯繫醫師。' },
  },
  footer: '分級：0 無 · 1–6 控制良好 · 7–15 輕度 · 16–27 中度 · 28–42 重度。\n本 App 為日記輔助工具，非醫療建議。',
};

export const STRINGS: Record<Lang, Strings> = { en, 'zh-Hant': zhHant };

export function getStrings(lang: Lang): Strings {
  return STRINGS[lang];
}

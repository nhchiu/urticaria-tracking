import type { Score0to3, SeverityBandKey } from '../uas';

export type Lang = 'en' | 'zh-Hant';
export type LangPref = 'system' | Lang;
export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
  lang: LangPref;
  theme: ThemePref;
  /** Optional user nickname, shown in the page title when non-empty. */
  nickname: string;
  /** True once the first-run nickname prompt has been shown. */
  nicknameAsked: boolean;
}

export const SETTINGS_KEY = '@uas7_settings_v1';

/** Max nickname characters (enforced on save). */
export const MAX_NICKNAME_LENGTH = 30;

export interface ScoreOption {
  value: Score0to3;
  title: string;
  detail: string;
}

/**
 * Every string used by the app. Add fields here when a new UI string is needed;
 * every language module must then provide it (the type enforces this).
 */
export interface Strings {
  appName: string;
  subtitle: string;
  sectionEntry: string;
  whichDay: string;
  today: string;
  recordingFor: string;
  firstRecord: (date: string) => string;
  noRecordsYet: string;
  whealsLabel: string;
  whealsHint: string;
  itchLabel: string;
  itchHint: string;
  whealsOptions: ScoreOption[];
  itchOptions: ScoreOption[];
  noteLabel: string;
  notePlaceholder: string;
  dailyUas: (date: string, total: number) => string;
  dailyUasEmpty: (date: string) => string;
  saveHintUpdate: string;
  saveHintRecord: string;
  scoreRequired: string;
  save: string;
  delete: string;
  deleteTitle: string;
  deleteMessage: (date: string) => string;
  cancel: string;
  skip: string;
  saveButton: string;
  welcomeTitle: string;
  welcomeMessage: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  pageTitle: (nickname: string) => string;
  sectionSummary: string;
  recordedDays: (n: number) => string;
  trend7: string;
  trend28: string;
  sectionWeeks: string;
  thisWeek: string;
  chartHint: string;
  chartNoteHint: string;
  missing: string;
  settings: string;
  done: string;
  tabs: { entry: string; summary: string; trend: string; weeks: string };
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
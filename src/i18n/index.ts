import * as Localization from 'expo-localization';
import { en } from './en';
import { zhHant } from './zh-Hant';
import type { Lang, LangPref, Strings } from './types';

export type { Lang, LangPref, ThemePref, Settings, ScoreOption, Strings } from './types';
export { SETTINGS_KEY, MAX_NICKNAME_LENGTH } from './types';

/**
 * Registry of every available language. To add a language:
 *   1. create src/i18n/<code>.ts exporting `const <code>: Strings`;
 *   2. extend the `Lang` union in types.ts;
 *   3. import it below and add it to STRINGS and to the device detection in deviceLang().
 * The compiler enforces that every language supplies every key.
 */
export const STRINGS: Record<Lang, Strings> = { en, 'zh-Hant': zhHant };

export function getStrings(lang: Lang): Strings {
  return STRINGS[lang];
}

function deviceLang(): Lang {
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
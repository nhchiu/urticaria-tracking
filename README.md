# Urticaria UAS7 Tracker

UAS7 urticaria diary for Android and iOS, built with Expo React Native. Record daily wheals + itch scores, compute the weekly UAS7, and visualize the 7-day trend.

## Features

- Daily entry: wheals (0–3) + itch (0–3) → daily UAS 0–6
- UAS7 summary: sum over last 7 days → 0–42, with standard severity band + progress bar
- 7-day trend chart (react-native-svg, gap-aware: missing days break the line)
- History list for the last 7 days, tap to edit
- 14-day date picker (today + previous 13 days)
- Bilingual UI: English / 繁體中文 (follows system locale, overridable)
- Light / dark / system theme (Material 3 via react-native-paper)
- Local persistence with AsyncStorage (no backend, works offline)
- Responsive layout: single column on phones, two columns ≥960px (web/tablet)

## UAS7 scoring reference

Daily UAS = wheals + itch.

| Score | Wheals (24h) | Itch (24h) |
| ----- | ------------ | ---------- |
| 0 | None | None |
| 1 | Mild: < 20 wheals | Mild: present, not annoying |
| 2 | Moderate: 20–50 wheals | Moderate: troublesome, no sleep/activity interference |
| 3 | Intense: > 50 wheals or large confluent areas | Intense: severe, interferes with sleep/activity |

UAS7 bands:

| UAS7 | Band |
| ---- | ---- |
| 0 | Urticaria-free |
| 1–6 | Well controlled |
| 7–15 | Mild |
| 16–27 | Moderate |
| 28–42 | Severe |

Incomplete weeks are summed as-is and flagged provisional until all 7 days are recorded.

## Tech stack

- Expo ~57, React 19, React Native 0.86
- react-native-paper (MD3 UI), react-native-svg (chart)
- @react-native-async-storage/async-storage, expo-localization, expo-status-bar
- TypeScript (strict-ish), pure testable domain logic in `src/uas.ts`

## Project structure

```
App.tsx               # UI: entry form, UAS7 summary, trend, history, settings
src/uas.ts            # UAS7 domain logic (daily total, last-7, bands, labels)
src/uas.run-tests.ts  # Logic self-checks (no test framework)
src/i18n.ts           # en / zh-Hant strings, language + theme prefs
src/storage.ts        # AsyncStorage load/save for entries + settings
src/TrendChart.tsx    # 7-day SVG line chart
src/theme.ts          # Chart palettes
app.json / eas.json   # Expo + EAS config
assets/               # Icons, splash, favicon
```

Storage keys: `@uas7_entries_v1`, `@uas7_settings_v1`.

## Getting started

Prerequisites: Node LTS, npm, Expo CLI / EAS CLI for device builds.

```bash
npm install
npm start
```

Then:

- `npm run android` — open on Android (emulator or Expo Go / dev client)
- `npm run ios` — open on iOS simulator/device
- `npm run web` — open in browser

Type-check and logic tests:

```bash
npm run tsc
npm run test:logic
```

## EAS builds

`eas.json` defines `development`, `preview`, and `production` profiles. `app.json` is already wired with `ios.bundleIdentifier`, `android.package`, icons, splash, and the `expo-localization` plugin.

```bash
eas build -p android --profile preview
eas build -p ios --profile preview
```

## Disclaimer

Diary aid only — not medical advice. Discuss scores and treatment with your clinician.

## License

See [LICENSE](./LICENSE).

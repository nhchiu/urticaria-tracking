# UAS7 Diary

[English](./README.md) | [繁體中文](./README.zh-Hant.md)

UAS7 urticaria diary for Android, iOS, and Web (PWA), built with Expo React Native. Record daily wheals + itch scores, compute the weekly UAS7, and visualize 7-day and 28-day trends.

## Features

- Daily entry: wheals (0–3) + itch (0–3) → daily UAS 0–6, plus optional daily notes (triggers, meds, sleep…)
- iOS-style date wheel picker with recorded-day dot indicators and quick "Today" jump
- UAS7 summary: sum over last 7 days → 0–42, with standard severity band + progress bar
- 7-day and 28-day trend charts (react-native-svg, gap-aware: missing days break the line; `★` marks days with notes; tap any day to edit)
- Complete weekly history from the earliest recorded entry to the current week
- Built-in bilingual Help & FAQ tab
- Bilingual UI: English / 繁體中文 (follows system locale, overridable)
- Optional nickname: asked once on first launch, editable in Settings, shown in the app header
- Light / dark / system theme (Material 3 via react-native-paper)
- Local persistence with AsyncStorage (no backend, works offline)

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

Incomplete weeks are summed as-is and show how many of the 7 days have been recorded.

## Tech stack

- Expo ~57, React 19, React Native 0.86
- react-native-paper (MD3 UI), react-native-svg (chart), @quidone/react-native-wheel-picker
- @react-native-async-storage/async-storage, expo-localization, expo-haptics, expo-status-bar
- TypeScript (strict), pure testable domain logic in `src/uas.ts`

## Project structure

```
App.tsx                 # UI: tabbed scenes (Entry, Summary, Trend, Weekly, Help) + Settings
src/uas.ts              # UAS7 domain logic (daily total, last-N, bands, weekly blocks)
src/uas.run-tests.ts    # Logic self-checks (no test framework required)
src/DateWheelPicker.tsx # iOS-style wheel date picker with recorded-day indicators
src/TrendChart.tsx      # 7-day / 28-day SVG line chart
src/storage.ts          # AsyncStorage load/save/validation for entries + settings
src/theme.ts            # MD3 themes, score severity tones, chart palettes
src/i18n/               # Modular en / zh-Hant strings, types, language + theme prefs
app.json / eas.json     # Expo + EAS config
assets/                 # Icons, splash, favicon
public/                 # PWA manifest, offline service worker, web icons
```

Storage keys: `@uas7_entries_v1`, `@uas7_settings_v1`.

## Getting started

Prerequisites: Node LTS + npm. `npm start` and the other Expo scripts work out of the box (Expo CLI ships with the project). Device builds need EAS CLI — see below.

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

## Web (PWA)

The web build is an installable PWA (manifest + offline service worker + icons
in `public/`; web meta in `app.json` → `expo.web`).

```bash
npm run build:web   # exports to dist/
```

Deploy the `dist/` folder to any static HTTPS host (EAS hosting, Vercel,
Netlify, Cloudflare Pages, GitHub Pages…). Visiting the HTTPS URL then offers
“Install” / “Add to Home Screen”, and the app keeps working offline after the
first visit. (`expo start --web` skips service-worker registration so local
development never serves stale cached bundles.)

Live on GitHub Pages at <https://nhchiu.github.io/urticaria-tracking/> —
every push to `main` rebuilds and redeploys via `.github/workflows/deploy-web.yml`.
(`app.json` sets `experiments.baseUrl` so bundles resolve under the
`/urticaria-tracking` subpath; `public/.nojekyll` keeps Pages from hiding the
`_expo` folder.)

## EAS builds

`eas.json` defines `development`, `preview`, and `production` profiles. `app.json` is already wired with `ios.bundleIdentifier`, `android.package`, icons, splash, and the `expo-localization` plugin.

The `eas` command comes from the `eas-cli` package, which `npm install` does not install — that's why bare `eas` says "command not found". Either install it once globally, or run it via `npx` (no install needed):

```bash
# Option A: one-time global install, then use `eas` directly
npm install -g eas-cli
eas build -p android --profile preview
eas build -p ios --profile preview
```

```bash
# Option B: no install — prefix with npx
npx eas-cli build -p android --profile preview
npx eas-cli build -p ios --profile preview
```

## Disclaimer

Diary aid only — not medical advice. Discuss scores and treatment with your clinician.

## License

See [LICENSE](./LICENSE).

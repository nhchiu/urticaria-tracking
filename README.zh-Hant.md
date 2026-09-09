# 蕁麻疹日記

以 Expo React Native 打造的 UAS7 蕁麻疹日記，支援 Android 與 iOS。每天記錄風疹塊＋搔癢分數，自動計算每週 UAS7，並以圖表呈現 7 天趨勢。

[English](./README.md) | [繁體中文](./README.zh-Hant.md)

## 功能

- 每日紀錄：風疹塊（0–3）＋搔癢（0–3）→ 每日 UAS 0–6
- UAS7 總結：加總過去 7 天 → 0–42，含標準嚴重度分級＋進度條
- 7 天趨勢圖（react-native-svg，可感知缺漏：缺漏日期折線會斷開）
- 過去 7 天歷史清單，點選即可編輯
- 14 天日期選擇器（今天＋過去 13 天）
- 雙語介面：English／繁體中文（跟隨系統語系，可手動覆寫）
- 淺色／深色／跟隨系統主題（Material 3，react-native-paper）
- 本機儲存（AsyncStorage，無後端，可離線使用）
- 響應式版面：手機單欄，≥960px（網頁／平板）雙欄

## UAS7 計分參考

每日 UAS＝風疹塊＋搔癢。

| 分數 | 風疹塊（24 小時） | 搔癢（24 小時） |
| ---- | ----------------- | --------------- |
| 0 | 無 | 無 |
| 1 | 輕度：少於 20 顆 | 輕度：有搔癢但不困擾 |
| 2 | 中度：20–50 顆 | 中度：會困擾，但不影響睡眠／日常活動 |
| 3 | 嚴重：超過 50 顆或大片融合 | 嚴重：劇烈搔癢，影響睡眠／日常活動 |

UAS7 分級：

| UAS7 | 分級 |
| ---- | ---- |
| 0 | 無蕁麻疹 |
| 1–6 | 控制良好 |
| 7–15 | 輕度 |
| 16–27 | 中度 |
| 28–42 | 重度 |

集滿 7 天前，總分按已紀錄天數加總，並標示為僅供參考。

## 技術架構

- Expo ~57、React 19、React Native 0.86
- react-native-paper（MD3 UI）、react-native-svg（圖表）
- @react-native-async-storage/async-storage、expo-localization、expo-status-bar
- TypeScript，核心計分邏輯為純函式、可測試（`src/uas.ts`）

## 專案結構

```
App.tsx               # UI：紀錄表單、UAS7 總結、趨勢圖、歷史紀錄、設定
src/uas.ts            # UAS7 領域邏輯（每日總分、過去 7 天、分級、標籤）
src/uas.run-tests.ts  # 邏輯自我檢查（無測試框架）
src/i18n.ts           # en / zh-Hant 字串、語言＋主題偏好
src/storage.ts        # AsyncStorage 讀寫（紀錄＋設定）
src/TrendChart.tsx    # 7 天 SVG 折線圖
src/theme.ts          # 圖表配色
app.json / eas.json   # Expo + EAS 設定
assets/               # 圖示、啟動畫面、favicon
```

儲存鍵：`@uas7_entries_v1`、`@uas7_settings_v1`。

## 開始使用

需求：Node LTS＋npm。`npm start` 與其他 Expo 指令開箱即用（Expo CLI 已隨專案安裝）；裝置建置需 EAS CLI，見下方。

```bash
npm install
npm start
```

接著：

- `npm run android` — 在 Android 開啟（模擬器或 Expo Go／dev client）
- `npm run ios` — 在 iOS 模擬器／實機開啟
- `npm run web` — 在瀏覽器開啟

型別檢查與邏輯測試：

```bash
npm run tsc
npm run test:logic
```

## 網頁版（PWA）

網頁建置為可安裝的 PWA（`public/` 內含 manifest、離線 service worker 與圖示；
網頁 meta 由 `app.json` → `expo.web` 設定）。

```bash
npm run build:web   # 輸出至 dist/
```

將 `dist/` 資料夾部署到任何支援 HTTPS 的靜態主機（EAS hosting、Vercel、
Netlify、Cloudflare Pages、GitHub Pages……）。以 HTTPS 網址開啟後即可「安裝」／
「加入主畫面」，首次載入後離線也能繼續使用。（`expo start --web` 會略過
service worker 註冊，本地開發不會吃到過期快取。）

GitHub Pages 線上版本：<https://nhchiu.github.io/urticaria-tracking/> ——
每次推送到 `main` 都會經由 `.github/workflows/deploy-web.yml` 重新建置部署。
（`app.json` 以 `experiments.baseUrl` 讓 bundle 在 `/urticaria-tracking`
子路徑下正確載入；`public/.nojekyll` 避免 Pages 隱藏 `_expo` 資料夾。）

## EAS 建置

`eas.json` 已定義 `development`、`preview`、`production`。`app.json` 已設定 `ios.bundleIdentifier`、`android.package`、圖示、啟動畫面與 `expo-localization` 外掛。

`eas` 指令來自 `eas-cli` 套件，`npm install` 不會安裝它——這就是直接打 `eas` 會出現 "command not found" 的原因。可二選一：全域安裝一次，或用 `npx` 免安裝執行：

```bash
# 選項 A：全域安裝一次，之後直接用 `eas`
npm install -g eas-cli
eas build -p android --profile preview
eas build -p ios --profile preview
```

```bash
# 選項 B：免安裝——用 npx 執行
npx eas-cli build -p android --profile preview
npx eas-cli build -p ios --profile preview
```

## 免責聲明

本 App 為日記輔助工具，非醫療建議。分數與治療請與醫師討論。

## 授權

見 [LICENSE](./LICENSE)。

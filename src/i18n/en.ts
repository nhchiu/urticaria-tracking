import type { Strings } from './types';

export const en: Strings = {
  appName: 'UAS7 Diary',
  subtitle: 'Record wheals + itch (0–3 each) every day. Daily UAS 0–6, weekly UAS7 0–42.',
  sectionEntry: 'Daily entry',
  whichDay: 'Which day?',
  today: 'Today',
  recordingFor: 'Recording for:',
  firstRecord: (date) => `First record: ${date}`,
  noRecordsYet: 'No entries yet.',
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
  noteLabel: 'Note (optional)',
  notePlaceholder: 'Triggers, meds, sleep, extra symptoms…',
  dailyUas: (date, total) => `Daily UAS for ${date}: ${total} / 6`,
  dailyUasEmpty: (date) => `Daily UAS for ${date}: not recorded / 6`,
  saveHintUpdate: 'tap Save to update.',
  saveHintRecord: 'tap Save to record.',
  scoreRequired: 'Select both scores to save.',
  save: 'Save entry',
  delete: 'Delete',
  deleteTitle: 'Delete entry?',
  deleteMessage: (date) => `Remove the entry for ${date}?`,
  cancel: 'Cancel',
  skip: 'Skip',
  saveButton: 'Save',
  welcomeTitle: 'Welcome!',
  welcomeMessage: 'What should we call you? (optional)',
  nicknameLabel: 'Nickname (optional)',
  nicknamePlaceholder: 'e.g. Alex',
  pageTitle: (nickname) => (nickname ? `UAS7 Diary - ${nickname}` : 'UAS7 Diary'),
  sectionSummary: 'UAS7 summary (last 7 days)',
  recordedDays: (n) => `${n} of 7 days recorded`,
  trend7: '7-day trend',
  trend28: '28-day trend',
  sectionWeeks: 'Weekly history',
  thisWeek: 'This week',
  chartHint: 'Line = daily UAS (0–6). Hollow markers = missing days.',
  chartNoteHint: '★ = day has a note.',
  missing: '–',
  settings: 'Settings',
  done: 'Done',
  tabs: { entry: 'Entry', summary: 'Summary', trend: 'Trend', weeks: 'Weekly', help: 'Help' },
  sectionHelp: 'Help & FAQ',
  openLink: 'Open link',
  faq: [
    {
      question: 'What is this app for?',
      answer:
        'UAS7 Diary is a daily diary for tracking urticaria (hives): each day you score wheals and itch (0–3 each). It totals them into a daily score (0–6) and a weekly UAS7 (0–42), with a trend chart and weekly summaries so you and your clinician can see changes at a glance.',
    },
    {
      question: 'Do I need to download it from an app store?',
      answer:
        'No. It is essentially a webpage that you can install to your phone’s home screen (see the install questions below). Once installed, it opens just like a regular app.',
    },
    {
      question: 'Does it need the internet to work?',
      answer:
        'You need to be online the first time you open or install it. After installation it keeps an offline cache, so you can open it and record entries without a connection; it updates itself automatically when you are back online.',
    },
    {
      question: 'Where is my data stored? Is it uploaded anywhere?',
      answer:
        'Only on your own phone or device, in the browser’s storage. Nothing is uploaded to any server, and there is no account or cloud sync. Note: entries will not move to a new phone automatically, so do not record in an incognito or private window (it keeps no data), and clearing browser data or removing the app deletes your entries.',
    },
    {
      question: 'Does this app use cookies or track me?',
      answer:
        'Not at all — no cookies, no trackers, no ads, no analytics. Your data lives in the browser’s local storage on your own device, like a notebook that never leaves your phone, and the offline cache uses cache storage. Neither has anything to do with cookies.',
    },
    {
      question: 'How do I install it on Android?',
      answer:
        '1. Open the site below in Chrome. 2. Tap the three-dot (⋮) menu at the top right. 3. Tap “Install” or “Add to Home screen” (wording varies by version). 4. Confirm. Some phones also show an install prompt automatically on the first visit.',
      url: 'https://nhchiu.github.io/urticaria-tracking/',
    },
    {
      question: 'How do I install it on iPhone?',
      answer:
        '1. Open the site below in Safari. 2. Tap the Share button (a square with an upward arrow) at the bottom. 3. Scroll down and tap “Add to Home Screen”. 4. Confirm the name and tap “Add”. It will then open full-screen from the home-screen icon.',
      url: 'https://nhchiu.github.io/urticaria-tracking/',
    },
    {
      question: 'Who can I ask if I have questions?',
      answer: 'Please ask your clinician.',
    },
  ],
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
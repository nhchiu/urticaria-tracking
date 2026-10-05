import type { Strings } from './types';

export const zhHant: Strings = {
  appName: '蕁麻疹日記',
  subtitle: '每天記錄風疹塊＋搔癢（各 0–3 分）。每日 UAS 0–6，每週 UAS7 0–42。',
  sectionEntry: '每日紀錄',
  whichDay: '選擇日期',
  today: '今天',
  recordingFor: '紀錄日期：',
  firstRecord: (date) => `首次紀錄：${date}`,
  noRecordsYet: '尚無紀錄。',
  whealsLabel: '風疹塊 — 0 至 3',
  whealsHint: '過去 24 小時內的風疹塊數量',
  itchLabel: '搔癢 — 0 至 3',
  itchHint: '過去 24 小時內的搔癢程度',
  whealsOptions: [
    { value: 0, title: '0 — 無', detail: '過去 24 小時無風疹塊' },
    { value: 1, title: '1 — 輕度', detail: '24 小時內少於 20 顆' },
    { value: 2, title: '2 — 中度', detail: '24 小時內 20–50 顆' },
    { value: 3, title: '3 — 嚴重', detail: '24 小時內超過 50 顆，或融合成大片區域' },
  ],
  itchOptions: [
    { value: 0, title: '0 — 無', detail: '過去 24 小時無搔癢' },
    { value: 1, title: '1 — 輕度', detail: '有搔癢但不困擾' },
    { value: 2, title: '2 — 中度', detail: '感到困擾，但不影響睡眠／日常活動' },
    { value: 3, title: '3 — 嚴重', detail: '嚴重搔癢，影響睡眠／日常活動' },
  ],
  noteLabel: '備註（選填）',
  notePlaceholder: '誘因、用藥、睡眠、其他症狀……',
  dailyUas: (date, total) => `${date} 每日 UAS：${total} / 6`,
  dailyUasEmpty: (date) => `${date} 每日 UAS：未紀錄 / 6`,
  saveHintUpdate: '點「儲存」即可更新。',
  saveHintRecord: '點「儲存」即可紀錄。',
  scoreRequired: '請先選好兩個分數。',
  save: '儲存紀錄',
  delete: '刪除',
  deleteTitle: '刪除紀錄？',
  deleteMessage: (date) => `要刪除 ${date} 的紀錄嗎？`,
  cancel: '取消',
  skip: '略過',
  saveButton: '儲存',
  welcomeTitle: '歡迎！',
  welcomeMessage: '怎麼稱呼你？（選填）',
  nicknameLabel: '暱稱（選填）',
  nicknamePlaceholder: '例如：小明',
  pageTitle: (nickname) => (nickname ? `蕁麻疹日記 - ${nickname}` : '蕁麻疹日記'),
  sectionSummary: 'UAS7 總結（過去 7 天）',
  recordedDays: (n) => `已紀錄 ${n}／7 天`,
  trend7: '7 天趨勢',
  trend28: '28 天趨勢',
  sectionWeeks: '每週紀錄',
  thisWeek: '本週',
  chartHint: '折線＝每日 UAS（0–6）。空心點＝缺漏日期。',
  chartNoteHint: '★＝該日有備註。',
  missing: '–',
  settings: '設定',
  done: '完成',
  tabs: { entry: '紀錄', summary: '總結', trend: '趨勢', weeks: '每週', help: '說明' },
  sectionHelp: '使用說明',
  openLink: '開啟連結',
  faq: [
    {
      question: '這個 app 是做什麼的？',
      answer:
        '「UAS7 Diary 蕁麻疹日記」是幫你每天追蹤蕁麻疹（風疹塊）的日記工具：每天點選記錄「風疹塊」和「搔癢」分數（各 0–3 分），自動加總成每日分數（0–6 分）和每週 UAS7（0–42 分），再用趨勢圖和每週總結，讓你和醫師一眼看出病情變化。',
    },
    {
      question: '需要到 App 商店下載嗎？',
      answer:
        '不需要。它本質上是一個網頁，可以「安裝」到手機桌面（見下方的安裝說明），安裝後打開就跟一般 app 沒兩樣。',
    },
    {
      question: '需要網路才能用嗎？',
      answer:
        '第一次打開或安裝時需要連上網路。安裝後 app 會在手機裡留下離線快取，之後沒有網路也能開啟與紀錄；連上網路時會自動更新到最新版本。',
    },
    {
      question: '我的紀錄存在哪裡？會上傳嗎？',
      answer:
        '只存在你自己的手機／裝置裡（瀏覽器的儲存空間），不會上傳到任何伺服器，也沒有帳號與雲端同步。注意：換新手機時紀錄不會自動跟過去；請不要用無痕／私密視窗紀錄（無痕模式不會留下資料）；清除瀏覽器資料或移除 app 會刪除紀錄。',
    },
    {
      question: '這個 app 會用 Cookie 或追蹤我嗎？',
      answer:
        '完全不會——沒有 Cookie、沒有追蹤程式、沒有廣告和分析工具。它記得你的資料，靠的是瀏覽器裡的本地儲存空間（就像只放在你自己手機裡的小記事本），離線快取用的是快取儲存區，都和 Cookie 無關。',
    },
    {
      question: '如何在 Android 安裝？',
      answer:
        '1. 在 Chrome 打開下方的網址。2. 點右上角的三點（⋮）選單。3. 點「安裝並建立捷徑」（部分版本顯示「安裝應用程式／加到主畫面」）。4. 點「安裝」。有些手機第一次開網頁就會自動跳出安裝提示，直接點安裝也可以。',
      url: 'https://nhchiu.github.io/urticaria-tracking/',
    },
    {
      question: '如何在 iPhone 安裝？',
      answer:
        '1. 在 Safari 打開下方的網址。2. 點下方中央的分享按鈕（向上箭頭的方形圖示）。3. 往下滑，點「加入主畫面」。4. 確認名稱後點「新增」。之後點桌面圖示會以全螢幕開啟。',
      url: 'https://nhchiu.github.io/urticaria-tracking/',
    },
    {
      question: '有問題可以問誰？',
      answer: '有任何問題，歡迎詢問你的醫師。',
    },
  ],
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
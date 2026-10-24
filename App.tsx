import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppState,
  Linking,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import {
  Appbar,
  BottomNavigation,
  Button,
  Card,
  Chip,
  Dialog,
  List,
  Menu,
  PaperProvider,
  Portal,
  ProgressBar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DateWheelPicker } from './src/DateWheelPicker';
import {
  getStrings,
  MAX_NICKNAME_LENGTH,
  resolveLang,
  type LangPref,
  type ScoreOption,
  type Strings,
  type ThemePref,
} from './src/i18n';
import { cleanNickname, loadEntries, loadSettings, saveEntries, saveSettings } from './src/storage';
import { BAND_TEXT, SCORE_TONES, darkTheme, lightTheme, type Palette, type Tone } from './src/theme';
import { TrendChart } from './src/TrendChart';
import {
  buildLast7,
  buildLastN,
  calcAllWeeks,
  calcUAS7,
  dateKey,
  earliestEntryDate,
  hasNote,
  makeEntry,
  MAX_NOTE_LENGTH,
  parseDateKey,
  type DailyEntry,
  type Score0to3,
} from './src/uas';

const MAX_UAS7 = 42;

function triggerSelectionHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

function triggerSuccessHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

const ScoreCard = memo(function ScoreCard({
  label,
  hint,
  options,
  value,
  onChange,
  tones,
}: {
  label: string;
  hint: string;
  options: ScoreOption[];
  value: Score0to3 | null;
  onChange: (v: Score0to3 | null) => void;
  tones: Tone[];
}) {
  const theme = useTheme();
  const handleToggle = (n: Score0to3) => {
    triggerSelectionHaptic();
    onChange(value === n ? null : n);
  };

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium">{label}</Text>
        <Text variant="bodySmall" style={styles.hint}>
          {hint}
        </Text>
        <View style={styles.scoreRow}>
          {([0, 1, 2, 3] as const).map((n) => {
            const active = value === n;
            const c = tones[n];
            return (
              <Button
                key={n}
                mode="contained"
                compact
                buttonColor={c.bg}
                textColor={c.fg}
                accessibilityState={{ selected: active }}
                onPress={() => handleToggle(n)}
                style={[
                  styles.scoreBtn,
                  {
                    borderWidth: 2,
                    borderColor: active ? theme.colors.primary : 'transparent',
                  },
                ]}
                contentStyle={styles.scoreContent}
                labelStyle={styles.scoreLabel}
              >
                {active ? `✓ ${n}` : String(n)}
              </Button>
            );
          })}
        </View>
        <View style={styles.legend}>
          {options.map((o) => {
            const active = value === o.value;
            return (
              <Pressable
                key={o.value}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => handleToggle(o.value)}
                style={[
                  styles.legendRow,
                  active && {
                    backgroundColor: theme.colors.primaryContainer + '66',
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    marginHorizontal: -6,
                  },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.legendTitle,
                    active && { color: theme.colors.primary, fontWeight: '700' },
                  ]}
                >
                  {o.title}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[styles.legendDetail, active && { opacity: 0.95 }]}
                >
                  {o.detail}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );
});

export default function App() {
  const systemScheme = useColorScheme();
  const [todayKey, setTodayKey] = useState<string>(() => dateKey(new Date()));
  const [byDate, setByDate] = useState<Record<string, DailyEntry>>({});
  const [selectedDate, setSelectedDate] = useState<string>(() => dateKey(new Date()));
  const [wheals, setWheals] = useState<Score0to3 | null>(null);
  const [itch, setItch] = useState<Score0to3 | null>(null);
  const [note, setNote] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [langPref, setLangPref] = useState<LangPref>('system');
  const [themePref, setThemePref] = useState<ThemePref>('system');
  const [nickname, setNickname] = useState('');
  const [nicknameAsked, setNicknameAsked] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [welcomeDraft, setWelcomeDraft] = useState('');
  const [settingsDraft, setSettingsDraft] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [langMenuVisible, setLangMenuVisible] = useState(false);
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);
  const [trendDays, setTrendDays] = useState(7);
  const [trendMenuVisible, setTrendMenuVisible] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  // Refresh todayKey when the app returns to foreground across midnight.
  useEffect(() => {
    const syncToday = () => {
      const next = dateKey(new Date());
      setTodayKey((prev) => (prev !== next ? next : prev));
    };
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncToday();
    });
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('focus', syncToday);
      return () => {
        sub.remove();
        window.removeEventListener('focus', syncToday);
      };
    }
    return () => sub.remove();
  }, []);

  useEffect(() => {
    Promise.all([loadEntries(), loadSettings()]).then(([entries, settings]) => {
      setByDate(entries);
      setLangPref(settings.lang);
      setThemePref(settings.theme);
      setNickname(settings.nickname);
      setNicknameAsked(settings.nicknameAsked);
      if (!settings.nicknameAsked) setWelcomeVisible(true);
      setLoaded(true);
    });
  }, []);

  // When the selected date changes, preload its saved scores (or reset).
  useEffect(() => {
    if (!loaded) return;
    const existing = byDate[selectedDate];
    if (existing) {
      setWheals(existing.wheals);
      setItch(existing.itch);
      setNote(existing.note ?? '');
    } else {
      setWheals(null);
      setItch(null);
      setNote('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, loaded]);

  const lang = resolveLang(langPref);
  const t: Strings = useMemo(() => getStrings(lang), [lang]);

  // Web tab title follows the effective language (nickname shows in the app header).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = t.pageTitle('');
  }, [t]);

  const langLabel =
    langPref === 'system' ? t.optSystem : langPref === 'en' ? t.optEnglish : t.optChinese;
  const themeLabel =
    themePref === 'system' ? t.optSystem : themePref === 'light' ? t.optLight : t.optDark;
  const isDark = themePref === 'dark' || (themePref === 'system' && systemScheme === 'dark');
  const paperTheme = isDark ? darkTheme : lightTheme;
  const scoreTones = SCORE_TONES[isDark ? 'dark' : 'light'];

  const chartPalette: Palette = useMemo(
    () => ({
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      faint: paperTheme.colors.onSurfaceVariant,
      barFill: paperTheme.colors.primary,
      barFillSelected: paperTheme.colors.secondary,
      barEmptyBorder: paperTheme.colors.outlineVariant,
    }),
    [paperTheme],
  );

  const todayDate = useMemo(() => parseDateKey(todayKey), [todayKey]);
  const last7 = useMemo(() => buildLast7(byDate, todayDate, lang), [byDate, todayDate, lang]);
  const uas7 = useMemo(() => calcUAS7(last7), [last7]);
  const allWeeks = useMemo(() => calcAllWeeks(byDate, todayDate, lang), [byDate, todayDate, lang]);
  const trendSeries = useMemo(
    () => buildLastN(byDate, trendDays, todayDate, lang),
    [byDate, trendDays, todayDate, lang],
  );
  const recordedKeys = useMemo(() => new Set(Object.keys(byDate)), [byDate]);
  const firstDate = useMemo(() => earliestEntryDate(byDate), [byDate]);
  const todayTotal = (wheals ?? 0) + (itch ?? 0);
  const sealed = wheals !== null && itch !== null;

  const existingForSelected = byDate[selectedDate];
  const trimmedNote = note.trim().slice(0, MAX_NOTE_LENGTH);
  const isSavedAndUnchanged =
    sealed &&
    existingForSelected !== undefined &&
    existingForSelected.wheals === wheals &&
    existingForSelected.itch === itch &&
    (existingForSelected.note ?? '') === trimmedNote;

  async function persist(next: Record<string, DailyEntry>) {
    setByDate(next);
    await saveEntries(next);
  }

  async function changeLang(v: LangPref) {
    setLangPref(v);
    await saveSettings({ lang: v, theme: themePref, nickname, nicknameAsked });
  }

  async function changeTheme(v: ThemePref) {
    setThemePref(v);
    await saveSettings({ lang: langPref, theme: v, nickname, nicknameAsked });
  }

  async function saveWelcomeNickname(draft: string) {
    const clean = cleanNickname(draft);
    setNickname(clean);
    setNicknameAsked(true);
    setWelcomeVisible(false);
    await saveSettings({ lang: langPref, theme: themePref, nickname: clean, nicknameAsked: true });
  }

  async function skipWelcomeNickname() {
    setNicknameAsked(true);
    setWelcomeVisible(false);
    await saveSettings({ lang: langPref, theme: themePref, nickname, nicknameAsked: true });
  }

  function openSettings() {
    setSettingsDraft(nickname);
    setSettingsVisible(true);
  }

  async function closeSettings() {
    const clean = cleanNickname(settingsDraft);
    if (clean !== nickname) {
      setNickname(clean);
      await saveSettings({ lang: langPref, theme: themePref, nickname: clean, nicknameAsked });
    }
    setSettingsVisible(false);
  }

  async function handleSave() {
    if (wheals === null || itch === null) return;
    const entry = makeEntry(selectedDate, wheals, itch, note);
    const next = { ...byDate, [selectedDate]: entry };
    triggerSuccessHaptic();
    await persist(next);
  }

  async function handleDeleteConfirmed() {
    const next = { ...byDate };
    delete next[selectedDate];
    await persist(next);
    setWheals(null);
    setItch(null);
    setNote('');
  }

  const handleSelectChartDate = useCallback((date: string) => {
    setSelectedDate(date);
    setTabIndex(0);
  }, []);

  const band = uas7.band;
  const bandText = t.bands[band.key];
  const progress = Math.min(1, uas7.sum / MAX_UAS7);

  const routes = useMemo(
    () => [
      { key: 'entry', title: t.tabs.entry, focusedIcon: 'pencil-plus' },
      { key: 'summary', title: t.tabs.summary, focusedIcon: 'gauge' },
      { key: 'trend', title: t.tabs.trend, focusedIcon: 'chart-line' },
      { key: 'weeks', title: t.tabs.weeks, focusedIcon: 'calendar-week' },
      { key: 'help', title: t.tabs.help, focusedIcon: 'help-circle' },
    ],
    [t],
  );

  // Horizontal swipe switches tabs. Direction-locked so vertical scrolling
  // and the horizontal date strip keep their own gestures.
  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) < 60) return;
          if (Math.abs(g.dx) < Math.abs(g.dy) * 1.5) return;
          setTabIndex((i) => {
            if (g.dx < 0) return Math.min(routes.length - 1, i + 1);
            return Math.max(0, i - 1);
          });
        },
      }),
    [routes.length],
  );

  const renderEntrySection = () => (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t.sectionEntry}
      </Text>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleSmall">{t.whichDay}</Text>
          <DateWheelPicker
            value={selectedDate}
            onChange={setSelectedDate}
            maxDate={todayKey}
            locale={lang}
            recorded={recordedKeys}
          />
          <View style={styles.wheelActions}>
            <Button
              mode="outlined"
              compact
              icon="calendar-today"
              disabled={selectedDate === todayKey}
              onPress={() => setSelectedDate(todayKey)}
            >
              {t.today}
            </Button>
          </View>
          <Text variant="bodySmall" style={styles.hint}>
            {t.recordingFor} {selectedDate}
          </Text>
        </Card.Content>
      </Card>

      <ScoreCard
        label={t.whealsLabel}
        hint={t.whealsHint}
        options={t.whealsOptions}
        value={wheals}
        onChange={setWheals}
        tones={scoreTones}
      />
      <ScoreCard
        label={t.itchLabel}
        hint={t.itchHint}
        options={t.itchOptions}
        value={itch}
        onChange={setItch}
        tones={scoreTones}
      />

      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium">{t.noteLabel}</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
            placeholder={t.notePlaceholder}
            maxLength={MAX_NOTE_LENGTH}
            style={styles.noteInput}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium">
            {sealed ? t.dailyUas(selectedDate, todayTotal) : t.dailyUasEmpty(selectedDate)}
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            {`${wheals ?? t.missing} + ${itch ?? t.missing}`} —{' '}
            {sealed
              ? existingForSelected
                ? t.saveHintUpdate
                : t.saveHintRecord
              : t.scoreRequired}
          </Text>
          <View style={styles.btnRow}>
            <Button
              mode="contained"
              icon={isSavedAndUnchanged ? 'check' : 'content-save'}
              onPress={handleSave}
              disabled={!sealed || isSavedAndUnchanged}
              style={styles.btn}
            >
              {isSavedAndUnchanged ? `✓ ${t.save}` : t.save}
            </Button>
            {existingForSelected && (
              <Button
                mode="outlined"
                icon="delete"
                onPress={() => setConfirmDelete(true)}
                style={styles.btn}
              >
                {t.delete}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <Text variant="bodySmall" style={styles.footer}>
        {firstDate ? t.firstRecord(firstDate) : t.noRecordsYet}
      </Text>
    </>
  );

  const renderSummarySection = () => (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t.sectionSummary}
      </Text>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="displaySmall">
            {uas7.sum} <Text variant="titleMedium">/ 42</Text>
          </Text>
          <Chip
            style={[styles.bandChip, { backgroundColor: band.color }]}
            textStyle={[styles.bandChipText, { color: BAND_TEXT[band.key] }]}
          >
            {bandText.title}
          </Chip>
          <Text variant="bodySmall" style={styles.hint}>
            {band.range} · {bandText.description}
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            {t.recordedDays(uas7.recordedDays)}
          </Text>
          <ProgressBar progress={progress} color={band.color} style={styles.progress} />
        </Card.Content>
      </Card>
    </>
  );

  const renderTrendSection = () => (
    <>
      <Menu
        visible={trendMenuVisible}
        onDismiss={() => setTrendMenuVisible(false)}
        anchor={
          <Button
            mode="text"
            compact
            icon="chevron-down"
            textColor={paperTheme.colors.onSurface}
            onPress={() => setTrendMenuVisible(true)}
            style={styles.trendTitle}
            contentStyle={styles.trendAnchorContent}
            labelStyle={styles.trendAnchorLabel}
          >
            {trendDays === 7 ? t.trend7 : t.trend28}
          </Button>
        }
      >
        <Menu.Item
          leadingIcon="chart-line"
          title={t.trend7}
          onPress={() => {
            setTrendDays(7);
            setTrendMenuVisible(false);
          }}
        />
        <Menu.Item
          leadingIcon="chart-multiline"
          title={t.trend28}
          onPress={() => {
            setTrendDays(28);
            setTrendMenuVisible(false);
          }}
        />
      </Menu>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <TrendChart
            days={trendSeries}
            palette={chartPalette}
            selectedDate={selectedDate}
            onSelectDate={handleSelectChartDate}
          />
          <Text variant="bodySmall" style={styles.hint}>
            {t.chartHint}
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            {t.chartNoteHint}
          </Text>
          {hasNote(existingForSelected) && (
            <Text variant="bodySmall" style={styles.selectedNotePreview}>
              ★ {selectedDate}: {existingForSelected.note}
            </Text>
          )}
        </Card.Content>
      </Card>
    </>
  );

  const renderWeeksSection = () => (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t.sectionWeeks}
      </Text>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          {allWeeks.length === 0 ? (
            <Text variant="bodyMedium">{t.noRecordsYet}</Text>
          ) : (
            allWeeks.map((w, i) => {
              const bandT = t.bands[w.band.key];
              return (
                <View key={w.start} style={i > 0 ? styles.weekBlockGap : undefined}>
                  <View style={styles.weekRow}>
                    <View style={styles.weekLabel}>
                      <Text variant="titleSmall">
                        {w.label}
                        {i === 0 ? ` · ${t.thisWeek}` : ''}
                      </Text>
                      <Text variant="bodySmall" style={styles.hint}>
                        {t.recordedDays(w.recordedDays)}
                      </Text>
                    </View>
                    <View style={styles.weekSum}>
                      <Text variant="headlineSmall">{w.sum}</Text>
                      <Text variant="bodySmall" style={styles.hint}>
                        / 42
                      </Text>
                    </View>
                  </View>
                  <Chip
                    style={[styles.bandChip, { backgroundColor: w.band.color }]}
                    textStyle={[styles.bandChipText, { color: BAND_TEXT[w.band.key] }]}
                  >
                    {bandT.title}
                  </Chip>
                  <ProgressBar
                    progress={Math.min(1, w.sum / MAX_UAS7)}
                    color={w.band.color}
                    style={styles.progress}
                  />
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>

      <Text variant="bodySmall" style={styles.footer}>
        {t.footer}
      </Text>
    </>
  );

  const renderHelpSection = () => (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t.sectionHelp}
      </Text>
      <Card style={styles.card} mode="elevated">
        {t.faq.map((item, i) => (
          <List.Accordion
            key={i}
            title={item.question}
            titleNumberOfLines={2}
            expanded={expandedFaq === i}
            onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
          >
            <View style={styles.faqBody}>
              <Text variant="bodyMedium">{item.answer}</Text>
              {item.url ? (
                <Text
                  variant="bodyMedium"
                  style={[styles.faqLink, { color: paperTheme.colors.primary }]}
                  onPress={() => {
                    if (item.url && /^https:\/\//i.test(item.url)) {
                      Linking.openURL(item.url).catch(() => {});
                    }
                  }}
                >
                  {t.openLink}: {item.url}
                </Text>
              ) : null}
            </View>
          </List.Accordion>
        ))}
      </Card>
    </>
  );

  const renderScene = ({ route }: { route: { key: string } }) => {
    const activeKey = routes[tabIndex]?.key;
    // Avoid building expensive off-screen trees while typing or interacting in the current tab
    if (route.key !== activeKey) {
      return <View style={styles.root} />;
    }
    const body = (() => {
      switch (route.key) {
        case 'summary':
          return renderSummarySection();
        case 'trend':
          return renderTrendSection();
        case 'weeks':
          return renderWeeksSection();
        case 'help':
          return renderHelpSection();
        case 'entry':
        default:
          return renderEntrySection();
      }
    })();
    return (
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>{body}</View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <View style={[styles.root, { backgroundColor: paperTheme.colors.background }]}>
          <Appbar.Header>
            <Appbar.Content title={t.pageTitle(nickname.trim())} />
            <Appbar.Action
              icon="cog"
              accessibilityLabel={t.settings}
              onPress={openSettings}
            />
          </Appbar.Header>

          <Text variant="bodyMedium" style={styles.subtitleBar}>
            {t.subtitle}
          </Text>

          <View style={styles.tabWrap} {...swipeResponder.panHandlers}>
            <BottomNavigation
              navigationState={{ index: tabIndex, routes }}
              onIndexChange={setTabIndex}
              renderScene={renderScene}
              shifting={false}
              sceneAnimationEnabled
              sceneAnimationType="shifting"
            />
          </View>

          <Portal>
            <Dialog visible={welcomeVisible} dismissable={false}>
              <Dialog.Title>{t.welcomeTitle}</Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium">{t.welcomeMessage}</Text>
                <TextInput
                  mode="outlined"
                  value={welcomeDraft}
                  onChangeText={setWelcomeDraft}
                  placeholder={t.nicknamePlaceholder}
                  maxLength={MAX_NICKNAME_LENGTH}
                  autoFocus
                  style={styles.noteInput}
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={skipWelcomeNickname}>{t.skip}</Button>
                <Button mode="contained" onPress={() => saveWelcomeNickname(welcomeDraft)}>
                  {t.saveButton}
                </Button>
              </Dialog.Actions>
            </Dialog>

            <Dialog visible={settingsVisible} onDismiss={closeSettings}>
              <Dialog.Title>{t.settings}</Dialog.Title>
              <Dialog.Content>
                <Text variant="titleSmall">{t.language}</Text>
                <Menu
                  visible={langMenuVisible}
                  onDismiss={() => setLangMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      icon="chevron-down"
                      onPress={() => setLangMenuVisible(true)}
                      style={styles.dropdown}
                      contentStyle={styles.dropdownContent}
                    >
                      {langLabel}
                    </Button>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      changeLang('system');
                      setLangMenuVisible(false);
                    }}
                    title={t.optSystem}
                  />
                  <Menu.Item
                    onPress={() => {
                      changeLang('en');
                      setLangMenuVisible(false);
                    }}
                    title={t.optEnglish}
                  />
                  <Menu.Item
                    onPress={() => {
                      changeLang('zh-Hant');
                      setLangMenuVisible(false);
                    }}
                    title={t.optChinese}
                  />
                </Menu>
                <Text variant="titleSmall" style={styles.dialogGap}>
                  {t.theme}
                </Text>
                <Menu
                  visible={themeMenuVisible}
                  onDismiss={() => setThemeMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      icon="chevron-down"
                      onPress={() => setThemeMenuVisible(true)}
                      style={styles.dropdown}
                      contentStyle={styles.dropdownContent}
                    >
                      {themeLabel}
                    </Button>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      changeTheme('system');
                      setThemeMenuVisible(false);
                    }}
                    title={t.optSystem}
                  />
                  <Menu.Item
                    onPress={() => {
                      changeTheme('light');
                      setThemeMenuVisible(false);
                    }}
                    title={t.optLight}
                  />
                  <Menu.Item
                    onPress={() => {
                      changeTheme('dark');
                      setThemeMenuVisible(false);
                    }}
                    title={t.optDark}
                  />
                </Menu>
                <Text variant="titleSmall" style={styles.dialogGap}>
                  {t.nicknameLabel}
                </Text>
                <TextInput
                  mode="outlined"
                  value={settingsDraft}
                  onChangeText={setSettingsDraft}
                  placeholder={t.nicknamePlaceholder}
                  maxLength={MAX_NICKNAME_LENGTH}
                  style={styles.noteInput}
                />
                <Text variant="bodySmall" style={styles.copyright}>
                  © 2026 nhchiu
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={closeSettings}>{t.done}</Button>
              </Dialog.Actions>
            </Dialog>

            <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
              <Dialog.Title>{t.deleteTitle}</Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium">{t.deleteMessage(selectedDate)}</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setConfirmDelete(false)}>{t.cancel}</Button>
                <Button
                  textColor={paperTheme.colors.error}
                  onPress={() => {
                    setConfirmDelete(false);
                    handleDeleteConfirmed();
                  }}
                >
                  {t.delete}
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

          <StatusBar style={isDark ? 'light' : 'dark'} />
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 720 },
  subtitleBar: { paddingHorizontal: 16, paddingTop: 8, fontSize: 15, lineHeight: 22 },
  tabWrap: { flex: 1 },
  sectionTitle: { marginTop: 24, marginBottom: 10, fontSize: 19 },
  trendTitle: { marginTop: 20, marginBottom: 6, alignSelf: 'flex-start' },
  trendAnchorContent: { flexDirection: 'row-reverse' },
  trendAnchorLabel: { fontSize: 19, fontWeight: '500', lineHeight: 24 },
  card: { marginBottom: 14 },
  hint: { marginTop: 4, opacity: 0.7, fontSize: 14, lineHeight: 20 },
  selectedNotePreview: { marginTop: 8, fontSize: 14, lineHeight: 20 },
  dropdown: { marginTop: 8, alignSelf: 'stretch' },
  dropdownContent: { justifyContent: 'space-between' },
  scoreRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  scoreBtn: { flex: 1, minWidth: 0, borderRadius: 12 },
  scoreContent: { height: 52, paddingHorizontal: 4 },
  scoreLabel: { fontSize: 20, fontWeight: '700', marginHorizontal: 0 },
  legend: { marginTop: 12 },
  legendRow: {
    marginTop: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  legendTitle: { fontWeight: '600', flexShrink: 0, fontSize: 15 },
  legendDetail: { fontSize: 15, flex: 1, textAlign: 'right', opacity: 0.7 },
  wheelActions: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  noteInput: { marginTop: 8 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1 },
  bandChip: { alignSelf: 'flex-start', marginTop: 4 },
  bandChipText: { fontWeight: '700', fontSize: 14 },
  progress: { marginTop: 8, height: 8, borderRadius: 4 },
  weekBlockGap: { marginTop: 20 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  weekLabel: { flex: 1 },
  weekSum: { alignItems: 'flex-end', marginLeft: 12 },
  faqBody: { paddingHorizontal: 16, paddingBottom: 16 },
  faqLink: { marginTop: 8, textDecorationLine: 'underline' },
  dialogGap: { marginTop: 16 },
  copyright: { marginTop: 16, opacity: 0.6, textAlign: 'center', fontSize: 13 },
  footer: { marginTop: 16, opacity: 0.6, lineHeight: 20, fontSize: 13 },
});

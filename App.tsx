import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, useColorScheme, useWindowDimensions } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  Dialog,
  List,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  Portal,
  ProgressBar,
  SegmentedButtons,
  Text,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  getStrings,
  resolveLang,
  type LangPref,
  type ScoreOption,
  type Strings,
  type ThemePref,
} from './src/i18n';
import { loadEntries, loadSettings, saveEntries, saveSettings } from './src/storage';
import { DarkPalette, LightPalette, type Palette } from './src/theme';
import { TrendChart } from './src/TrendChart';
import {
  buildLast7,
  calcUAS7,
  dateKey,
  makeEntry,
  shortLabel,
  type DailyEntry,
  type Score0to3,
} from './src/uas';

const MAX_UAS7 = 42;

const lightTheme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, primary: '#1d4ed8', secondary: '#7c3aed' },
};
const darkTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, primary: '#93c5fd', secondary: '#c4b5fd' },
};

function ScoreCard({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  options: ScoreOption[];
  value: Score0to3;
  onChange: (v: Score0to3) => void;
}) {
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium">{label}</Text>
        <Text variant="bodySmall" style={styles.hint}>
          {hint}
        </Text>
        <SegmentedButtons
          style={styles.segmented}
          value={String(value)}
          onValueChange={(v) => onChange(Number(v) as Score0to3)}
          buttons={[
            { value: '0', label: '0' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
          ]}
        />
        <View style={styles.legend}>
          {options.map((o) => (
            <View key={o.value} style={styles.legendRow}>
              <Text variant="bodySmall" style={styles.legendTitle}>
                {o.title}
              </Text>
              <Text variant="bodySmall" style={styles.hint}>
                {o.detail}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

export default function App() {
  const systemScheme = useColorScheme();
  const [byDate, setByDate] = useState<Record<string, DailyEntry>>({});
  const [selectedDate, setSelectedDate] = useState<string>(() => dateKey(new Date()));
  const [wheals, setWheals] = useState<Score0to3>(0);
  const [itch, setItch] = useState<Score0to3>(0);
  const [loaded, setLoaded] = useState(false);
  const [langPref, setLangPref] = useState<LangPref>('system');
  const [themePref, setThemePref] = useState<ThemePref>('system');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    Promise.all([loadEntries(), loadSettings()]).then(([entries, settings]) => {
      setByDate(entries);
      setLangPref(settings.lang);
      setThemePref(settings.theme);
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
    } else {
      setWheals(0);
      setItch(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, loaded]);

  const lang = resolveLang(langPref);
  const t: Strings = useMemo(() => getStrings(lang), [lang]);
  const isDark = themePref === 'dark' || (themePref === 'system' && systemScheme === 'dark');
  const paperTheme = isDark ? darkTheme : lightTheme;

  const chartPalette: Palette = useMemo(
    () => ({
      ...(isDark ? DarkPalette : LightPalette),
      barFill: paperTheme.colors.primary,
      barFillSelected: paperTheme.colors.secondary,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      faint: paperTheme.colors.onSurfaceVariant,
      barEmptyBorder: paperTheme.colors.outline,
    }),
    [isDark, paperTheme],
  );

  const last7 = useMemo(() => buildLast7(byDate, new Date(), lang), [byDate, lang]);
  const uas7 = useMemo(() => calcUAS7(last7), [last7]);
  const todayTotal = wheals + itch;

  // Quick date strip: today + previous 13 days for picking which day to record.
  const pickableDates = useMemo(() => {
    const out: string[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push(dateKey(d));
    }
    return out;
  }, []);

  async function persist(next: Record<string, DailyEntry>) {
    setByDate(next);
    await saveEntries(next);
  }

  async function changeLang(v: LangPref) {
    setLangPref(v);
    await saveSettings({ lang: v, theme: themePref });
  }

  async function changeTheme(v: ThemePref) {
    setThemePref(v);
    await saveSettings({ lang: langPref, theme: v });
  }

  async function handleSave() {
    const entry = makeEntry(selectedDate, wheals, itch);
    const next = { ...byDate, [selectedDate]: entry };
    await persist(next);
  }

  async function handleDeleteConfirmed() {
    const next = { ...byDate };
    delete next[selectedDate];
    await persist(next);
    setWheals(0);
    setItch(0);
  }

  const band = uas7.band;
  const bandText = t.bands[band.key];
  const progress = Math.min(1, uas7.sum / MAX_UAS7);

  // Responsive layout: single column on phones, two columns on wide screens.
  const { width: windowWidth } = useWindowDimensions();
  const wide = windowWidth >= 960;

  const entrySection = (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t.sectionEntry}
      </Text>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleSmall">{t.whichDay}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateStrip}>
                  {pickableDates.map((d) => {
                    const active = d === selectedDate;
                    const isToday = d === dateKey(new Date());
                    const hasScore = !!byDate[d];
                    return (
                      <Chip
                        key={d}
                        selected={active}
                        showSelectedCheck={false}
                        onPress={() => setSelectedDate(d)}
                        style={[
                          styles.dateChip,
                          hasScore && !active && { backgroundColor: paperTheme.colors.tertiaryContainer },
                          active && { backgroundColor: paperTheme.colors.primary },
                        ]}
                        textStyle={
                          active
                            ? { color: paperTheme.colors.onPrimary }
                            : hasScore
                              ? { color: paperTheme.colors.onTertiaryContainer }
                              : undefined
                        }
                      >
                  {isToday ? t.today : shortLabel(d, lang)}
                  {` · ${byDate[d] ? `UAS ${byDate[d].total}` : t.missing}`}
                </Chip>
              );
            })}
          </ScrollView>
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
      />
      <ScoreCard
        label={t.itchLabel}
        hint={t.itchHint}
        options={t.itchOptions}
        value={itch}
        onChange={setItch}
      />

      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium">{t.dailyUas(selectedDate, todayTotal)}</Text>
          <Text variant="bodySmall" style={styles.hint}>
            {wheals} + {itch} — {byDate[selectedDate] ? t.saveHintUpdate : t.saveHintRecord}
          </Text>
          <View style={styles.btnRow}>
            <Button mode="contained" icon="content-save" onPress={handleSave} style={styles.btn}>
              {t.save}
            </Button>
            {byDate[selectedDate] && (
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
    </>
  );

  const dashSection = (
    <>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t.sectionSummary}
      </Text>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="displaySmall">
            {uas7.sum} <Text variant="titleMedium">/ 42</Text>
          </Text>
          <Chip style={[styles.bandChip, { backgroundColor: band.color }]} textStyle={styles.bandChipText}>
            {bandText.title}
          </Chip>
          <Text variant="bodySmall" style={styles.hint}>
            {band.range} · {bandText.description}
          </Text>
          <ProgressBar progress={progress} color={band.color} style={styles.progress} />
          <Text variant="bodySmall" style={styles.hint}>
            {t.recordedDays(uas7.recordedDays)}
            {!uas7.complete && t.provisional}
          </Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t.sectionTrend}
      </Text>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <TrendChart days={last7} palette={chartPalette} selectedDate={selectedDate} />
          <Text variant="bodySmall" style={styles.hint}>
            {t.chartHint}
          </Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t.history}
      </Text>
      <Card style={styles.card} mode="elevated">
        {[...last7].reverse().map((d, i, arr) => (
          <List.Item
            key={d.date}
            title={`${d.date} (${d.label})`}
            description={d.entry ? t.entrySub(d.entry.wheals, d.entry.itch) : t.noEntry}
            onPress={() => setSelectedDate(d.date)}
            right={() => <Text variant="titleLarge">{d.total !== null ? d.total : t.missing}</Text>}
            style={i < arr.length - 1 ? styles.listDivider : undefined}
          />
        ))}
      </Card>

      <Text variant="bodySmall" style={styles.footer}>
        {t.footer}
      </Text>
    </>
  );

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <View style={[styles.root, { backgroundColor: paperTheme.colors.background }]}>
          <Appbar.Header>
            <Appbar.Content title={t.appName} />
            <Appbar.Action
              icon="cog"
              accessibilityLabel={t.settings}
              onPress={() => setSettingsVisible(true)}
            />
          </Appbar.Header>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.inner, wide && styles.innerWide]}>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {t.subtitle}
              </Text>

              {wide ? (
                <View style={styles.columns}>
                  <View style={styles.column}>{entrySection}</View>
                  <View style={styles.column}>{dashSection}</View>
                </View>
              ) : (
                <>
                  {entrySection}
                  {dashSection}
                </>
              )}
            </View>
          </ScrollView>

          <Portal>
            <Dialog visible={settingsVisible} onDismiss={() => setSettingsVisible(false)}>
              <Dialog.Title>{t.settings}</Dialog.Title>
              <Dialog.Content>
                <Text variant="titleSmall">{t.language}</Text>
                <SegmentedButtons
                  style={styles.segmented}
                  value={langPref}
                  onValueChange={(v) => changeLang(v as LangPref)}
                  buttons={[
                    { value: 'system', label: t.optSystem },
                    { value: 'en', label: t.optEnglish },
                    { value: 'zh-Hant', label: t.optChinese },
                  ]}
                />
                <Text variant="titleSmall" style={styles.dialogGap}>
                  {t.theme}
                </Text>
                <SegmentedButtons
                  style={styles.segmented}
                  value={themePref}
                  onValueChange={(v) => changeTheme(v as ThemePref)}
                  buttons={[
                    { value: 'system', label: t.optSystem },
                    { value: 'light', label: t.optLight },
                    { value: 'dark', label: t.optDark },
                  ]}
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setSettingsVisible(false)}>{t.done}</Button>
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
  innerWide: { maxWidth: 1180 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  column: { flex: 1, minWidth: 0 },
  subtitle: { marginBottom: 8 },
  sectionTitle: { marginTop: 20, marginBottom: 8 },
  card: { marginBottom: 12 },
  hint: { marginTop: 4, opacity: 0.7 },
  segmented: { marginTop: 12 },
  legend: { marginTop: 12 },
  legendRow: { marginTop: 8 },
  legendTitle: { fontWeight: '600' },
  dateStrip: { marginTop: 10 },
  dateChip: { marginRight: 8 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1 },
  bandChip: { alignSelf: 'flex-start', marginTop: 8 },
  bandChipText: { color: '#fff', fontWeight: '700' },
  progress: { marginTop: 12, height: 8, borderRadius: 4 },
  listDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)' },
  dialogGap: { marginTop: 16 },
  footer: { marginTop: 16, opacity: 0.6, lineHeight: 18 },
});

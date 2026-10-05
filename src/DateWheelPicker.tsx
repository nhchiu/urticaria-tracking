import {
  DatePicker,
  usePickerItemHeight,
  type RenderOverlayProps,
} from '@quidone/react-native-wheel-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { dateKey } from './uas';

const ITEM_HEIGHT = 30;
const VISIBLE_ITEM_COUNT = 5;

const DATE_WIDTH = 76;
const MONTH_WIDTH = 132;
const YEAR_WIDTH = 96;

interface DateWheelPickerProps {
  /** Current selection as a local date key (YYYY-MM-DD). */
  value: string;
  onChange: (key: string) => void;
  /** Oldest selectable date (YYYY-MM-DD). Defaults to 100 years ago. */
  minDate?: string;
  /** Newest selectable date (YYYY-MM-DD). Defaults to today. */
  maxDate?: string;
  /** Date formatting locale (month names + column order). */
  locale: 'en' | 'zh-Hant';
  /** Keys (YYYY-MM-DD) that already have a record; marked in the wheel. */
  recorded?: ReadonlySet<string>;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

function tickHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

type WebUnit = 'year' | 'month' | 'date';

type WebScrollable = {
  scrollHeight: number;
  clientHeight: number;
  scrollTop: number;
  querySelectorAll?: (s: string) => unknown[];
};

// react-native-web's ScrollView ignores the `contentOffset` and `snapToOffsets`
// props, so the picker columns mount with scrollTop: 0 while their rows are laid
// out relative to the selection index -- the wheel looks empty until touched.
// These helpers re-anchor scrollTop on mount and snap to the nearest row after a
// scroll settles. They are web-only and inert on native.
const webScrollables = (root: unknown): WebScrollable[] => {
  const node = root as { querySelectorAll?: (s: string) => unknown };
  const divs = node.querySelectorAll
    ? Array.from(node.querySelectorAll('div') as ArrayLike<unknown>)
    : [];
  return (divs as WebScrollable[]).filter((el) => el.scrollHeight > el.clientHeight);
};

// Identify which wheel a column is by its content rather than DOM order: years are
// 4-digit values, months are exactly 12 rows, anything else is the day column. This
// stays correct even when a wheel collapses (e.g. a single-year range).
const wheelUnit = (el: WebScrollable): WebUnit => {
  const rows = el.querySelectorAll
    ? (Array.from(el.querySelectorAll('div[style*="rotateX"]') as ArrayLike<unknown>) as Array<{
        textContent: string | null;
      }>)
    : [];
  if (rows.some((row) => /^\d{4}$/.test((row.textContent ?? '').trim()))) return 'year';
  return rows.length === 12 ? 'month' : 'date';
};

const anchorWheelsOnWeb = (
  root: unknown,
  value: string,
  minDate: string | undefined,
) => {
  const columns = webScrollables(root);
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const startYear = minDate ? Number(minDate.slice(0, 4)) : new Date().getFullYear() - 100;
  const indexOf: Record<WebUnit, number> = {
    year: year - startYear,
    month: month - 1,
    date: day - 1,
  };
  columns.forEach((el) => {
    const index = indexOf[wheelUnit(el)];
    if (index >= 0) el.scrollTop = index * ITEM_HEIGHT;
  });
};

const snapWheelsOnWeb = (root: unknown) => {
  webScrollables(root).forEach((el) => {
    const next = Math.round(el.scrollTop / ITEM_HEIGHT) * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - next) > 1) el.scrollTop = next;
  });
};

// ES parses 'YYYY-MM-DD' as UTC midnight, so on zones west of UTC the library's
// `new Date(key).getDate()` reports the previous day. Appending the time makes it
// resolve to LOCAL midnight; the library reads dates back out via local getters.
const toLocalMidnight = (key: string) => `${key}T00:00:00`;

type WheelCellProps = {
  value: number;
  label?: string;
  itemTextStyle: StyleProp<TextStyle> | undefined;
  /** True when this cell's date (or month/year group) has a record. */
  marked: boolean;
};

const WheelCell = ({ value, label, itemTextStyle, marked }: WheelCellProps) => {
  const height = usePickerItemHeight();
  const theme = useTheme();
  return (
    <View style={styles.cell}>
      <Text
        numberOfLines={1}
        style={[
          styles.cellText,
          {
            lineHeight: Math.round(height / 1.8),
            color: theme.colors.onSurface,
          },
          itemTextStyle,
        ]}
      >
        {label ?? value}
      </Text>
      <View
        style={[
          styles.dot,
          { backgroundColor: marked ? theme.colors.secondary : 'transparent' },
        ]}
      />
    </View>
  );
};

/** iOS-style wheel wrapper: drag to spin, tap rows to jump, spring snap. */
export function DateWheelPicker({ value, onChange, minDate, maxDate, locale, recorded }: DateWheelPickerProps) {
  const theme = useTheme();
  const bound = toLocalMidnight(maxDate ?? dateKey(new Date()));
  const columnsRef = useRef<View>(null);

  const recordedYears = useMemo(() => {
    const set = new Set<string>();
    if (recorded) for (const key of recorded) set.add(key.slice(0, 4));
    return set;
  }, [recorded]);

  const recordedMonths = useMemo(() => {
    const set = new Set<string>();
    if (recorded) for (const key of recorded) set.add(key.slice(0, 7));
    return set;
  }, [recorded]);

  const yearPrefix = value.slice(0, 4);
  const monthPrefix = value.slice(0, 7);

  useEffect(() => {
    if (Platform.OS !== 'web' || !columnsRef.current) return;
    anchorWheelsOnWeb(columnsRef.current, value, minDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fade the wheel into the elevated card's own tone (MD3 elevation level 1),
  // so the picker band blends with the card in both modes with no hardcoded colors.
  const cardTone = theme.colors.elevation.level1;

  const Overlay = ({ itemHeight, pickerHeight, overlayItemStyle }: RenderOverlayProps) => (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <LinearGradient
        colors={[cardTone, 'transparent']}
        style={[styles.fade, styles.fadeTop, { height: Math.round(itemHeight * 1.2) }]}
      />
      <LinearGradient
        colors={['transparent', cardTone]}
        style={[styles.fade, styles.fadeBottom, { height: Math.round(itemHeight * 1.2) }]}
      />
      <View
        style={[
          styles.selection,
          {
            top: pickerHeight / 2 - itemHeight / 2,
            height: itemHeight,
            borderColor: theme.colors.primary + '3D',
            backgroundColor: theme.colors.primary + '14',
          },
          overlayItemStyle,
        ]}
      />
    </View>
  );

  return (
    <DatePicker
      date={toLocalMidnight(value)}
      onDateChanged={({ date }) => {
        if (date !== value) onChange(date);
      }}
      minDate={minDate ? toLocalMidnight(minDate) : undefined}
      maxDate={bound}
      locale={locale}
      itemHeight={ITEM_HEIGHT}
      visibleItemCount={VISIBLE_ITEM_COUNT}
      itemTextStyle={styles.itemText}
      enableScrollByTapOnItem
      scrollEventThrottle={16}
      renderDate={() => (
        <DatePicker.Date
          width={DATE_WIDTH}
          enableScrollByTapOnItem
          onValueChanging={tickHaptic}
          _onScrollEnd={Platform.OS === 'web' ? () => snapWheelsOnWeb(columnsRef.current) : undefined}
          renderOverlay={Overlay}
          renderItem={({ item, itemTextStyle }) => (
            <WheelCell
              value={item.value}
              itemTextStyle={itemTextStyle}
              marked={recorded?.has(`${monthPrefix}-${pad2(item.value)}`) ?? false}
            />
          )}
        />
      )}
      renderMonth={() => (
        <DatePicker.Month
          width={MONTH_WIDTH}
          enableScrollByTapOnItem
          onValueChanging={tickHaptic}
          _onScrollEnd={Platform.OS === 'web' ? () => snapWheelsOnWeb(columnsRef.current) : undefined}
          renderOverlay={Overlay}
          renderItem={({ item, itemTextStyle }) => (
            <WheelCell
              value={item.value}
              label={(item as { label?: string }).label}
              itemTextStyle={itemTextStyle}
              marked={recordedMonths.has(`${yearPrefix}-${pad2(item.value + 1)}`) ?? false}
            />
          )}
        />
      )}
      renderYear={() => (
        <DatePicker.Year
          width={YEAR_WIDTH}
          enableScrollByTapOnItem
          onValueChanging={tickHaptic}
          _onScrollEnd={Platform.OS === 'web' ? () => snapWheelsOnWeb(columnsRef.current) : undefined}
          renderOverlay={Overlay}
          renderItem={({ item, itemTextStyle }) => (
            <WheelCell
              value={item.value}
              itemTextStyle={itemTextStyle}
              marked={recordedYears.has(String(item.value))}
            />
          )}
        />
      )}
    >
      {({ dateNodes }) => (
        <View
          style={[styles.columns, { backgroundColor: cardTone }]}
          ref={columnsRef}
        >
          {dateNodes.map(({ node }) => node)}
        </View>
      )}
    </DatePicker>
  );
}

const styles = StyleSheet.create({
  columns: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 14,
  },
  fade: { position: 'absolute', left: 0, right: 0 },
  fadeTop: { top: 0 },
  fadeBottom: { bottom: 0 },
  selection: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemText: { fontSize: 17, fontWeight: '600' },
  cell: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: 17, fontWeight: '600', includeFontPadding: false },
  dot: { width: 5, height: 5, borderRadius: 2.5, marginLeft: 6, backgroundColor: 'transparent' },
});
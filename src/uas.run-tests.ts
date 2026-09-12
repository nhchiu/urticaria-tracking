import {
  buildLast7,
  calcPast4Weeks,
  calcUAS7,
  dailyTotal,
  dateKey,
  hasNote,
  last7Keys,
  makeEntry,
  severityFor,
} from './uas';

declare const process: { exitCode?: number };

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${msg}`);
  }
}

function main(): void {
  assert(dailyTotal(0, 0) === 0, 'daily total 0+0=0');
  assert(dailyTotal(3, 3) === 6, 'daily total 3+3=6');
  assert(dailyTotal(2, 1) === 3, 'daily total 2+1=3');

  const e = makeEntry('2026-09-05', 2, 3);
  assert(e.total === 5, 'makeEntry caches total');
  assert(e.note === undefined && !hasNote(e), 'makeEntry omits note when empty');

  const noted = makeEntry('2026-09-05', 1, 1, '  took antihistamine  ');
  assert(noted.note === 'took antihistamine' && hasNote(noted), 'makeEntry trims and keeps note');
  assert(!hasNote(null) && !hasNote(undefined), 'hasNote false for missing entry');

  const keys = last7Keys(new Date(2026, 8, 5));
  assert(keys.length === 7, 'last7Keys returns 7 days');
  assert(keys[6] === '2026-09-05', `last key is today (${keys[6]})`);
  assert(keys[0] === '2026-08-30', `first key is 6 days ago (${keys[0]})`);
  assert(dateKey(new Date(2026, 0, 3)) === '2026-01-03', 'dateKey zero-pads');

  // Full week: 0..6 totals => sum 21 => moderate
  const full: Record<string, ReturnType<typeof makeEntry>> = {};
  keys.forEach((k, i) => {
    const w = Math.min(3, i % 4) as 0 | 1 | 2 | 3;
    const it = Math.min(3, (i + 1) % 4) as 0 | 1 | 2 | 3;
    full[k] = makeEntry(k, w, it);
  });
  const days = buildLast7(full, new Date(2026, 8, 5));
  assert(days.every((d) => d.total !== null), 'full week has no gaps');
  const r = calcUAS7(days);
  const expected = Object.values(full).reduce((a, x) => a + x.total, 0);
  assert(r.sum === expected, `UAS7 sums daily totals (${r.sum})`);
  assert(r.complete && r.recordedDays === 7, 'full week marked complete');

  // Gaps
  const partial = buildLast7({}, new Date(2026, 8, 5));
  const rp = calcUAS7(partial);
  assert(rp.sum === 0 && rp.recordedDays === 0 && !rp.complete, 'empty week sums to 0, incomplete');

  // Severity bands
  assert(severityFor(0).key === 'free', 'band 0 = free');
  assert(severityFor(6).key === 'well-controlled', 'band 6 = well-controlled');
  assert(severityFor(7).key === 'mild', 'band 7 = mild');
  assert(severityFor(15).key === 'mild', 'band 15 = mild');
  assert(severityFor(16).key === 'moderate', 'band 16 = moderate');
  assert(severityFor(27).key === 'moderate', 'band 27 = moderate');
  assert(severityFor(28).key === 'severe', 'band 28 = severe');
  assert(severityFor(42).key === 'severe', 'band 42 = severe');

  // Past 4 weeks: 28 consecutive days with total = day index % 7
  const ref = new Date(2026, 8, 5);
  const four: Record<string, ReturnType<typeof makeEntry>> = {};
  for (let back = 0; back < 28; back++) {
    const d = new Date(ref);
    d.setDate(d.getDate() - back);
    const k = dateKey(d);
    const tot = back % 7; // 0..6
    const w = Math.min(3, tot) as 0 | 1 | 2 | 3;
    four[k] = makeEntry(k, w, (tot - w) as 0 | 1 | 2 | 3);
  }
  const weeks = calcPast4Weeks(four, ref);
  assert(weeks.length === 4, 'past4weeks returns 4 blocks');
  assert(weeks[0].end === '2026-09-05' && weeks[0].start === '2026-08-30', `week0 window (${weeks[0].start}..${weeks[0].end})`);
  assert(weeks[3].start === '2026-08-09' && weeks[3].end === '2026-08-15', `week3 window (${weeks[3].start}..${weeks[3].end})`);
  assert(weeks.every((w) => w.complete && w.recordedDays === 7), 'full 28 days => all weeks complete');
  const weekSums = weeks.map((w) => w.sum);
  assert(weekSums[0] === 21, `week0 sums to 21 (${weekSums[0]})`);
  assert(weeks[0].band.key === 'moderate', 'week0 band moderate');
  const sparse = calcPast4Weeks({}, ref);
  assert(sparse.every((w) => w.sum === 0 && !w.complete), 'empty history => zero incomplete weeks');

  if (process.exitCode) console.error('\nSome checks FAILED');
  else console.log('\nAll UAS7 logic checks passed.');
}

main();

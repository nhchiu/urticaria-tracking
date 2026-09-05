import {
  buildLast7,
  calcUAS7,
  dailyTotal,
  dateKey,
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

  if (process.exitCode) console.error('\nSome checks FAILED');
  else console.log('\nAll UAS7 logic checks passed.');
}

main();

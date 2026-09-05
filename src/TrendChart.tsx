import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import type { Palette } from './theme';
import type { DayScore } from './uas';

const MAX = 6;
const VB_W = 360;
const VB_H = 190;
const PAD_L = 26;
const PAD_R = 14;
const PAD_T = 16;
const PAD_B = 26;

function x(i: number, w: number): number {
  return PAD_L + (i * (w - PAD_L - PAD_R)) / 6;
}

function y(v: number, h: number): number {
  return PAD_T + (1 - v / MAX) * (h - PAD_T - PAD_B);
}

/**
 * 7-day UAS line chart. Segments connect consecutive recorded days;
 * gaps stay broken and missing days render as hollow dashed markers.
 */
export function TrendChart({
  days,
  palette,
  selectedDate,
}: {
  days: DayScore[];
  palette: Palette;
  selectedDate: string;
}) {
  const [width, setWidth] = useState(VB_W);
  const w = Math.max(280, width);
  const h = (VB_H * w) / VB_W;
  const sx = (i: number) => x(i, w);
  const sy = (v: number) => y(v, h);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Svg width={w} height={h} accessibilityLabel="7-day UAS trend line chart">
        {/* gridlines + y labels */}
        {[0, 1, 2, 3, 4, 5, 6].map((v) => (
          <G key={v}>
            <Line
              x1={PAD_L}
              x2={w - PAD_R}
              y1={sy(v)}
              y2={sy(v)}
              stroke={palette.barEmptyBorder}
              strokeWidth={v === 0 ? 1.5 : 0.75}
              opacity={v === 0 ? 0.9 : 0.55}
            />
            <SvgText x={4} y={sy(v) + 3.5} fontSize={10} fill={palette.faint}>
              {v}
            </SvgText>
          </G>
        ))}
        {/* line segments between consecutive recorded days */}
        {days.map((d, i) => {
          if (i === days.length - 1) return null;
          const n = days[i + 1];
          if (d.total === null || n.total === null) return null;
          return (
            <Line
              key={`seg-${d.date}`}
              x1={sx(i)}
              y1={sy(d.total)}
              x2={sx(i + 1)}
              y2={sy(n.total)}
              stroke={palette.barFill}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}
        {/* markers + value labels */}
        {days.map((d, i) => {
          const selected = d.date === selectedDate;
          return (
            <G key={`pt-${d.date}`}>
              {d.total !== null ? (
                <G>
                  {selected && (
                    <Circle
                      cx={sx(i)}
                      cy={sy(d.total)}
                      r={9}
                      fill="none"
                      stroke={palette.barFillSelected}
                      strokeWidth={1.5}
                      opacity={0.6}
                    />
                  )}
                  <Circle
                    cx={sx(i)}
                    cy={sy(d.total)}
                    r={selected ? 6 : 5}
                    fill={selected ? palette.barFillSelected : palette.barFill}
                    stroke={palette.card}
                    strokeWidth={1.5}
                  />
                  <SvgText
                    x={sx(i)}
                    y={sy(d.total) - 10}
                    fontSize={11}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={palette.text}
                  >
                    {d.total}
                  </SvgText>
                </G>
              ) : (
                <Circle
                  cx={sx(i)}
                  cy={sy(0)}
                  r={5}
                  fill="none"
                  stroke={palette.barEmptyBorder}
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                />
              )}
            </G>
          );
        })}
        {/* x labels */}
        {days.map((d, i) => (
          <SvgText
            key={`x-${d.date}`}
            x={sx(i)}
            y={h - 8}
            fontSize={10}
            textAnchor="middle"
            fill={d.date === selectedDate ? palette.text : palette.faint}
            fontWeight={d.date === selectedDate ? '700' : '400'}
          >
            {d.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

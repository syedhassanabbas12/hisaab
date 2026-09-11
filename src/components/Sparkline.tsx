import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface Props {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}

function buildPath(points: number[], width: number, height: number, pad = 6): string {
  if (points.length < 2) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (p - min) / range) * (height - pad * 2);
    return [x, y];
  });

  let d = `M ${coords[0][0]} ${coords[0][1]}`;
  for (let i = 1; i < coords.length; i++) {
    const [x0, y0] = coords[i - 1];
    const [x1, y1] = coords[i];
    const midX = (x0 + x1) / 2;
    d += ` C ${midX} ${y0}, ${midX} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

export default function Sparkline({ points, width = 320, height = 120, color = '#D6A54A' }: Props) {
  const path = buildPath(points, width, height);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const lastX = width - 6;
  const lastY = 6 + (1 - (points[points.length - 1] - min) / range) * (height - 12);

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.25} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={`${path} L ${lastX} ${height} L 6 ${height} Z`} fill="url(#fade)" />
        <Path d={path} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Circle cx={lastX} cy={lastY} r={4} fill={color} />
      </Svg>
    </View>
  );
}

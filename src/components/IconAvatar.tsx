import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { avatarMetaFor, categoryChipMeta } from '../theme';

interface Props {
  category?: string;
  name?: string;
  size?: number;
  shape?: 'circle' | 'square';
}

export default function IconAvatar({ category, name, size = 44, shape = 'square' }: Props) {
  const catMeta = category ? categoryChipMeta[category] : undefined;
  const seed = category ?? name ?? '?';
  const fallback = avatarMetaFor(seed);
  const bg = catMeta?.bg ?? fallback.bg;
  const color = catMeta?.color ?? fallback.color;
  const radius = shape === 'circle' ? size / 2 : size * 0.32;

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: radius, backgroundColor: bg },
      ]}
    >
      {catMeta ? (
        <Ionicons name={catMeta.icon as any} size={size * 0.46} color={color} />
      ) : (
        <Text style={[styles.initials, { color, fontSize: size * 0.38 }]}>
          {(name ?? '?').trim().slice(0, 1).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '800' },
});

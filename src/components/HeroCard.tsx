import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '../theme';

export default function HeroCard({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.heroBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.heroBorder,
    padding: 20,
    overflow: 'hidden',
  },
  glowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.heroGlow,
    top: -70,
    right: -50,
  },
  glowTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.heroBgLight,
    bottom: -50,
    left: -30,
  },
  content: { position: 'relative' },
});

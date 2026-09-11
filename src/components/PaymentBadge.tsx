import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PaymentMethod } from '../types';
import { paymentMethodMeta } from '../theme';

export default function PaymentBadge({ method }: { method: PaymentMethod }) {
  const meta = paymentMethodMeta[method];
  return (
    <View style={[styles.badge, { backgroundColor: `${meta.color}1A` }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

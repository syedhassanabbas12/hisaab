import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import IconAvatar from '../components/IconAvatar';
import PaymentBadge from '../components/PaymentBadge';
import Segmented from '../components/Segmented';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../store/AppContext';
import { colors } from '../theme';
import { daysUntil, formatDate, formatPkr, monthlyEquivalent, renewalLabel } from '../utils/format';

const cycleFilters = [
  { value: 'all', label: 'All' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function SubscriptionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { subscriptions, removeSubscription } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () =>
      subscriptions
        .filter((s) => filter === 'all' || s.cycle === filter)
        .sort((a, b) => daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal)),
    [subscriptions, filter]
  );

  const filteredMonthlyTotal = useMemo(
    () => filtered.reduce((sum, s) => sum + monthlyEquivalent(s.amountPkr, s.cycle), 0),
    [filtered]
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Subscriptions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSubscription', undefined)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <Segmented options={cycleFilters} value={filter} onChange={setFilter} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 12, gap: 10 }}
        ListHeaderComponent={
          filtered.length > 0 ? (
            <Text style={styles.totalCaption}>
              {formatPkr(filteredMonthlyTotal)}/mo across {filtered.length} subscription
              {filtered.length === 1 ? '' : 's'}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyText}>
              No subscriptions yet. Add Netflix, gym, cloud storage, or anything you pay for on repeat.
            </Text>
          </Card>
        }
        renderItem={({ item }) => {
          const urgent = daysUntil(item.nextRenewal) <= 3;
          return (
            <TouchableOpacity
              onLongPress={() =>
                Alert.alert('Remove subscription', `Remove "${item.name}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => removeSubscription(item.id) },
                ])
              }
              onPress={() => navigation.navigate('AddSubscription', { subscriptionId: item.id })}
            >
              <Card style={styles.row}>
                <IconAvatar category={item.category} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.category} · {item.cycle} · {formatDate(item.nextRenewal)}
                  </Text>
                  <View style={{ marginTop: 6 }}>
                    <PaymentBadge method={item.paymentMethod} />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={styles.itemAmount}>{formatPkr(item.amountPkr)}</Text>
                  <Text style={[styles.renewalTag, urgent && styles.renewalTagUrgent]}>
                    {renewalLabel(item.nextRenewal)}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addButtonText: { color: '#fff', fontWeight: '700' },
  totalCaption: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginBottom: 2 },
  emptyText: { color: colors.textMuted, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
  renewalTag: { fontSize: 11, fontWeight: '600', color: colors.warning },
  renewalTagUrgent: { color: colors.danger },
});

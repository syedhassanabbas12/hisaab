import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import PaymentBadge from '../components/PaymentBadge';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../store/AppContext';
import { colors } from '../theme';
import { daysUntil, formatDate, formatPkr, renewalLabel } from '../utils/format';

export default function SubscriptionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { subscriptions, removeSubscription } = useApp();

  const sorted = useMemo(
    () => [...subscriptions].sort((a, b) => daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal)),
    [subscriptions]
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

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}
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
              <Card>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      {item.category} · {item.cycle} · {formatDate(item.nextRenewal)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={styles.itemAmount}>{formatPkr(item.amountPkr)}</Text>
                    <Text style={[styles.renewalTag, urgent && styles.renewalTagUrgent]}>
                      {renewalLabel(item.nextRenewal)}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 8 }}>
                  <PaymentBadge method={item.paymentMethod} />
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
  emptyText: { color: colors.textMuted, lineHeight: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
  renewalTag: { fontSize: 11, fontWeight: '600', color: colors.warning },
  renewalTagUrgent: { color: colors.danger },
});

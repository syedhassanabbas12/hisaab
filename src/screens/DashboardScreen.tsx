import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import PaymentBadge from '../components/PaymentBadge';
import { useApp } from '../store/AppContext';
import { colors } from '../theme';
import { daysUntil, formatDate, formatPkr, monthlyEquivalent, renewalLabel } from '../utils/format';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { subscriptions, groups, expenses } = useApp();

  const monthlyTotal = useMemo(
    () => subscriptions.reduce((sum, s) => sum + monthlyEquivalent(s.amountPkr, s.cycle), 0),
    [subscriptions]
  );

  const upcoming = useMemo(
    () =>
      [...subscriptions]
        .filter((s) => daysUntil(s.nextRenewal) <= 14)
        .sort((a, b) => daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal))
        .slice(0, 5),
    [subscriptions]
  );

  const groupSpendTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amountPkr, 0),
    [expenses]
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, gap: 16 }}
    >
      <Text style={styles.title}>Hisaab</Text>
      <Text style={styles.subtitle}>Your subscriptions and shared bills, in one hisaab.</Text>

      <Card>
        <Text style={styles.cardLabel}>Monthly subscription spend</Text>
        <Text style={styles.bigNumber}>{formatPkr(monthlyTotal)}</Text>
        <Text style={styles.cardFootnote}>
          Across {subscriptions.length} subscription{subscriptions.length === 1 ? '' : 's'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>Tracked group spending</Text>
        <Text style={styles.bigNumber}>{formatPkr(groupSpendTotal)}</Text>
        <Text style={styles.cardFootnote}>
          Across {groups.length} group{groups.length === 1 ? '' : 's'}
        </Text>
      </Card>

      <View>
        <Text style={styles.sectionTitle}>Upcoming renewals</Text>
        {upcoming.length === 0 ? (
          <Card style={{ marginTop: 8 }}>
            <Text style={styles.emptyText}>No renewals in the next 14 days.</Text>
          </Card>
        ) : (
          <View style={{ gap: 10, marginTop: 8 }}>
            {upcoming.map((s) => {
              const days = daysUntil(s.nextRenewal);
              const urgent = days <= 3;
              return (
                <Card key={s.id} style={urgent ? styles.urgentCard : undefined}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{s.name}</Text>
                      <Text style={styles.itemMeta}>{formatDate(s.nextRenewal)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Text style={styles.itemAmount}>{formatPkr(s.amountPkr)}</Text>
                      <Text style={[styles.renewalTag, urgent && styles.renewalTagUrgent]}>
                        {renewalLabel(s.nextRenewal)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ marginTop: 8 }}>
                    <PaymentBadge method={s.paymentMethod} />
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: -8 },
  cardLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  bigNumber: { fontSize: 30, fontWeight: '800', color: colors.primaryDark, marginTop: 4 },
  cardFootnote: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptyText: { color: colors.textMuted },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 15, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
  renewalTag: { fontSize: 11, fontWeight: '600', color: colors.warning },
  renewalTagUrgent: { color: colors.danger },
  urgentCard: { borderColor: colors.danger },
});

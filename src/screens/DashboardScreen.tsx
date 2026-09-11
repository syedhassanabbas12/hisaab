import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import HeroCard from '../components/HeroCard';
import IconAvatar from '../components/IconAvatar';
import MiniStat from '../components/MiniStat';
import Segmented from '../components/Segmented';
import Sparkline from '../components/Sparkline';
import { useApp } from '../store/AppContext';
import { colors } from '../theme';
import { daysUntil, formatDate, formatPkr, monthlyEquivalent, renewalLabel } from '../utils/format';

const rangeOptions = [
  { value: '7', label: 'Week' },
  { value: '30', label: 'Month' },
  { value: '365', label: 'Year' },
];

function last6MonthTotals(dates: { date: string; amount: number }[]): number[] {
  const now = new Date();
  const months: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const total = dates
      .filter((e) => {
        const ed = new Date(e.date);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      })
      .reduce((sum, e) => sum + e.amount, 0);
    months.push(total);
  }
  return months;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { subscriptions, groups, expenses } = useApp();
  const [range, setRange] = useState('7');

  const monthlyTotal = useMemo(
    () => subscriptions.reduce((sum, s) => sum + monthlyEquivalent(s.amountPkr, s.cycle), 0),
    [subscriptions]
  );

  const renewingSoon = useMemo(
    () => subscriptions.filter((s) => daysUntil(s.nextRenewal) <= 7 && daysUntil(s.nextRenewal) >= 0).length,
    [subscriptions]
  );

  const groupSpendTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amountPkr, 0),
    [expenses]
  );

  const upcoming = useMemo(
    () =>
      [...subscriptions]
        .filter((s) => daysUntil(s.nextRenewal) <= Number(range))
        .sort((a, b) => daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal))
        .slice(0, 6),
    [subscriptions, range]
  );

  const nextRenewal = useMemo(
    () =>
      [...subscriptions].sort((a, b) => daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal))[0],
    [subscriptions]
  );

  const trend = useMemo(
    () => last6MonthTotals(expenses.map((e) => ({ date: e.date, amount: e.amountPkr }))),
    [expenses]
  );
  const hasTrend = trend.some((v) => v > 0);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, gap: 16 }}
    >
      <View>
        <Text style={styles.title}>Hisaab</Text>
        <Text style={styles.subtitle}>Your subscriptions and shared bills, in one hisaab.</Text>
      </View>

      <HeroCard>
        <View style={styles.rowBetween}>
          <Text style={styles.heroLabel}>Monthly subscription spend</Text>
          <View style={styles.heroDots}>
            <Ionicons name="ellipsis-horizontal" size={16} color={colors.heroTextMuted} />
          </View>
        </View>
        <Text style={styles.heroNumber}>{formatPkr(monthlyTotal)}</Text>
        <View style={styles.heroFooterRow}>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>
              {subscriptions.length} subscription{subscriptions.length === 1 ? '' : 's'}
            </Text>
          </View>
          {nextRenewal && (
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>
                Next: {nextRenewal.name} · {renewalLabel(nextRenewal.nextRenewal)}
              </Text>
            </View>
          )}
        </View>
      </HeroCard>

      <View style={styles.statsRow}>
        <MiniStat
          icon="alarm"
          tint={colors.warning}
          tintBg="#FBF0D9"
          value={String(renewingSoon)}
          label="Renewing this week"
        />
        <MiniStat
          icon="people"
          tint={colors.primary}
          tintBg="#E1F5EC"
          value={formatPkr(groupSpendTotal)}
          label={`Tracked in ${groups.length} group${groups.length === 1 ? '' : 's'}`}
        />
      </View>

      {hasTrend && (
        <Card>
          <Text style={styles.sectionTitle}>Group spending trend</Text>
          <Text style={styles.trendCaption}>Last 6 months</Text>
          <Sparkline points={trend} width={330} height={90} color={colors.gold} />
        </Card>
      )}

      <View>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Upcoming renewals</Text>
        </View>
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Segmented options={rangeOptions} value={range} onChange={setRange} />
        </View>
        {upcoming.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Nothing renewing in this window.</Text>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {upcoming.map((s) => {
              const days = daysUntil(s.nextRenewal);
              const urgent = days <= 3;
              return (
                <Card key={s.id} style={styles.rowCard}>
                  <IconAvatar category={s.category} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{s.name}</Text>
                    <Text style={styles.itemMeta}>{formatDate(s.nextRenewal)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={styles.itemAmount}>{formatPkr(s.amountPkr)}</Text>
                    <Text style={[styles.renewalTag, urgent && styles.renewalTagUrgent]}>
                      {renewalLabel(s.nextRenewal)}
                    </Text>
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
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { fontSize: 13, color: colors.heroTextMuted, fontWeight: '600' },
  heroDots: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(244,242,236,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNumber: { fontSize: 34, fontWeight: '800', color: colors.heroText, marginTop: 8 },
  heroFooterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  heroPill: {
    backgroundColor: 'rgba(244,242,236,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroPillText: { color: colors.heroText, fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  trendCaption: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 4 },
  emptyText: { color: colors.textMuted },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemName: { fontSize: 15, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
  renewalTag: { fontSize: 11, fontWeight: '600', color: colors.warning },
  renewalTagUrgent: { color: colors.danger },
});

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../components/Card';
import PaymentBadge from '../components/PaymentBadge';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../store/AppContext';
import { colors, paymentMethodMeta } from '../theme';
import { PaymentMethod } from '../types';
import { formatDate, formatPkr } from '../utils/format';
import { computeBalances, simplifyDebts } from '../utils/split';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

function memberName(members: { id: string; name: string }[], id: string) {
  return members.find((m) => m.id === id)?.name ?? 'Unknown';
}

export default function GroupDetailScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const { groups, expenses, settlements, addSettlement, removeExpense, removeGroup } = useApp();
  const [settlingFor, setSettlingFor] = useState<{ from: string; to: string; amount: number } | null>(
    null
  );

  const group = groups.find((g) => g.id === groupId);

  const groupExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.groupId === groupId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses, groupId]
  );

  const balances = useMemo(
    () => (group ? computeBalances(group, expenses, settlements) : {}),
    [group, expenses, settlements]
  );

  const suggestedPayments = useMemo(() => simplifyDebts(balances), [balances]);

  if (!group) {
    return (
      <View style={styles.screen}>
        <Text style={styles.emptyText}>This group no longer exists.</Text>
      </View>
    );
  }

  function confirmSettlement(method: PaymentMethod) {
    if (!settlingFor) return;
    addSettlement({
      groupId,
      fromMemberId: settlingFor.from,
      toMemberId: settlingFor.to,
      amountPkr: settlingFor.amount,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: method,
    });
    setSettlingFor(null);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>{group.name}</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Delete group', `Delete "${group.name}" and all its expenses?`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  removeGroup(group.id);
                  navigation.goBack();
                },
              },
            ])
          }
        >
          <Text style={styles.deleteLink}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>{group.members.map((m) => m.name).join(' · ')}</Text>

      <TouchableOpacity
        style={styles.addExpenseButton}
        onPress={() => navigation.navigate('AddExpense', { groupId })}
      >
        <Text style={styles.addExpenseButtonText}>+ Add expense</Text>
      </TouchableOpacity>

      <View>
        <Text style={styles.sectionTitle}>Balances</Text>
        <View style={{ gap: 8, marginTop: 8 }}>
          {group.members.map((m) => {
            const bal = Math.round(balances[m.id] ?? 0);
            const isPositive = bal > 0;
            const isZero = Math.abs(bal) < 1;
            return (
              <Card key={m.id} style={styles.balanceCard}>
                <Text style={styles.itemName}>{m.name}</Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    isZero
                      ? styles.balanceZero
                      : isPositive
                      ? styles.balancePositive
                      : styles.balanceNegative,
                  ]}
                >
                  {isZero
                    ? 'Settled up'
                    : isPositive
                    ? `Gets back ${formatPkr(bal)}`
                    : `Owes ${formatPkr(Math.abs(bal))}`}
                </Text>
              </Card>
            );
          })}
        </View>
      </View>

      {suggestedPayments.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Suggested settlements</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {suggestedPayments.map((p, idx) => (
              <Card key={idx}>
                <Text style={styles.itemName}>
                  {memberName(group.members, p.fromMemberId)} pays{' '}
                  {memberName(group.members, p.toMemberId)}
                </Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.balanceAmount}>{formatPkr(p.amountPkr)}</Text>
                  <TouchableOpacity
                    style={styles.settleButton}
                    onPress={() =>
                      setSettlingFor({ from: p.fromMemberId, to: p.toMemberId, amount: p.amountPkr })
                    }
                  >
                    <Text style={styles.settleButtonText}>Mark settled</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        </View>
      )}

      {settlingFor && (
        <Card style={{ gap: 10 }}>
          <Text style={styles.itemName}>
            How did {memberName(group.members, settlingFor.from)} pay{' '}
            {memberName(group.members, settlingFor.to)} {formatPkr(settlingFor.amount)}?
          </Text>
          <View style={styles.methodRow}>
            {Object.entries(paymentMethodMeta).map(([value, meta]) => (
              <TouchableOpacity
                key={value}
                style={[styles.methodButton, { borderColor: meta.color }]}
                onPress={() => confirmSettlement(value as PaymentMethod)}
              >
                <Text style={[styles.methodButtonText, { color: meta.color }]}>{meta.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => setSettlingFor(null)}>
            <Text style={styles.cancelLink}>Cancel</Text>
          </TouchableOpacity>
        </Card>
      )}

      <View>
        <Text style={styles.sectionTitle}>Expenses</Text>
        {groupExpenses.length === 0 ? (
          <Card style={{ marginTop: 8 }}>
            <Text style={styles.emptyText}>No expenses logged yet.</Text>
          </Card>
        ) : (
          <View style={{ gap: 8, marginTop: 8 }}>
            {groupExpenses.map((e) => (
              <TouchableOpacity
                key={e.id}
                onLongPress={() =>
                  Alert.alert('Delete expense', `Delete "${e.description}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => removeExpense(e.id) },
                  ])
                }
              >
                <Card>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{e.description}</Text>
                      <Text style={styles.itemMeta}>
                        Paid by {memberName(group.members, e.paidByMemberId)} · {formatDate(e.date)}
                      </Text>
                    </View>
                    <Text style={styles.itemAmount}>{formatPkr(e.amountPkr)}</Text>
                  </View>
                  <View style={{ marginTop: 8 }}>
                    <PaymentBadge method={e.paymentMethod} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted },
  deleteLink: { color: colors.danger, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  addExpenseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  addExpenseButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '700', color: colors.text },
  itemMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
  emptyText: { color: colors.textMuted, padding: 16 },
  balanceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceAmount: { fontWeight: '700', fontSize: 14 },
  balancePositive: { color: colors.success },
  balanceNegative: { color: colors.danger },
  balanceZero: { color: colors.textMuted },
  settleButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  settleButtonText: { fontSize: 12, fontWeight: '700', color: colors.text },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  methodButton: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  methodButtonText: { fontWeight: '700', fontSize: 12 },
  cancelLink: { color: colors.textMuted, textAlign: 'center', fontWeight: '600' },
});

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ChoiceChips from '../components/ChoiceChips';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../store/AppContext';
import { colors, paymentMethodMeta } from '../theme';
import { PaymentMethod } from '../types';
import { formatPkr } from '../utils/format';
import { equalShares } from '../utils/split';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

const paymentOptions = Object.entries(paymentMethodMeta).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export default function AddExpenseScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const { groups, addExpense } = useApp();
  const group = groups.find((g) => g.id === groupId);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(group?.members[0]?.id ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [includedIds, setIncludedIds] = useState<string[]>(group?.members.map((m) => m.id) ?? []);

  const parsedAmount = Number(amount) || 0;

  const preview = useMemo(() => {
    if (!includedIds.length || parsedAmount <= 0) return [];
    return equalShares(parsedAmount, includedIds);
  }, [parsedAmount, includedIds]);

  if (!group) {
    return (
      <View style={styles.screen}>
        <Text style={styles.emptyText}>This group no longer exists.</Text>
      </View>
    );
  }

  function toggleMember(id: string) {
    setIncludedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSave() {
    if (!description.trim()) {
      Alert.alert('Missing description', 'What was this expense for?');
      return;
    }
    if (parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than 0.');
      return;
    }
    if (includedIds.length === 0) {
      Alert.alert('Select members', 'Pick at least one member to split this with.');
      return;
    }
    if (!paidBy) {
      Alert.alert('Who paid?', 'Select who paid for this expense.');
      return;
    }

    addExpense({
      groupId,
      description: description.trim(),
      amountPkr: parsedAmount,
      paidByMemberId: paidBy,
      shares: preview,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod,
    });
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
        <Text style={styles.title}>Add expense</Text>

        <View style={styles.field}>
          <Text style={styles.label}>What's it for?</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Rent, groceries, WiFi bill..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Amount (PKR)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="5000"
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Paid by</Text>
          <ChoiceChips
            options={group.members.map((m) => ({ value: m.id, label: m.name }))}
            value={paidBy}
            onChange={setPaidBy}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Split equally between</Text>
          <View style={styles.memberList}>
            {group.members.map((m) => {
              const active = includedIds.includes(m.id);
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.memberRow, active && styles.memberRowActive]}
                  onPress={() => toggleMember(m.id)}
                >
                  <Text style={[styles.memberName, active && styles.memberNameActive]}>{m.name}</Text>
                  {active && parsedAmount > 0 && (
                    <Text style={styles.shareAmount}>
                      {formatPkr(preview.find((s) => s.memberId === m.id)?.amountPkr ?? 0)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Paid via</Text>
          <ChoiceChips
            options={paymentOptions}
            value={paymentMethod}
            onChange={(v) => setPaymentMethod(v as PaymentMethod)}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Add expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  memberList: { gap: 8 },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  memberRowActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
  memberName: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  memberNameActive: { color: colors.text },
  shareAmount: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyText: { color: colors.textMuted, padding: 16 },
});

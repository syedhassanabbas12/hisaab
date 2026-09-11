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
import { categoryOptions, colors, paymentMethodMeta } from '../theme';
import { BillingCycle, PaymentMethod } from '../types';
import { addDays, isValidIsoDate } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AddSubscription'>;

const cycleOptions: { value: BillingCycle; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const paymentOptions = Object.entries(paymentMethodMeta).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export default function AddSubscriptionScreen({ navigation, route }: Props) {
  const { subscriptions, addSubscription, updateSubscription } = useApp();
  const editingId = route.params?.subscriptionId;
  const editing = useMemo(
    () => subscriptions.find((s) => s.id === editingId),
    [subscriptions, editingId]
  );

  const [name, setName] = useState(editing?.name ?? '');
  const [amount, setAmount] = useState(editing ? String(editing.amountPkr) : '');
  const [cycle, setCycle] = useState<BillingCycle>(editing?.cycle ?? 'monthly');
  const [category, setCategory] = useState(editing?.category ?? categoryOptions[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    editing?.paymentMethod ?? 'jazzcash'
  );
  const [nextRenewal, setNextRenewal] = useState(editing?.nextRenewal ?? addDays(new Date(), 30));

  const isEditing = Boolean(editing);

  function handleSave() {
    const parsedAmount = Number(amount);
    if (!name.trim()) {
      Alert.alert('Missing name', 'Give this subscription a name.');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than 0.');
      return;
    }
    if (!isValidIsoDate(nextRenewal)) {
      Alert.alert('Invalid date', 'Use the format YYYY-MM-DD for the renewal date.');
      return;
    }

    const payload = {
      name: name.trim(),
      amountPkr: parsedAmount,
      cycle,
      category,
      paymentMethod,
      nextRenewal,
    };

    if (isEditing && editingId) {
      updateSubscription(editingId, payload);
    } else {
      addSubscription(payload);
    }
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
        <Text style={styles.title}>{isEditing ? 'Edit subscription' : 'Add subscription'}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Netflix, Gym, iCloud..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Amount (PKR)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="1500"
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Billing cycle</Text>
          <ChoiceChips options={cycleOptions} value={cycle} onChange={(v) => setCycle(v as BillingCycle)} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <ChoiceChips
            options={categoryOptions.map((c) => ({ value: c, label: c }))}
            value={category}
            onChange={setCategory}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Payment method</Text>
          <ChoiceChips
            options={paymentOptions}
            value={paymentMethod}
            onChange={(v) => setPaymentMethod(v as PaymentMethod)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Next renewal date</Text>
          <TextInput
            style={styles.input}
            value={nextRenewal}
            onChangeText={setNextRenewal}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.quickRow}>
            {[7, 30, 365].map((days) => (
              <TouchableOpacity
                key={days}
                style={styles.quickButton}
                onPress={() => setNextRenewal(addDays(new Date(), days))}
              >
                <Text style={styles.quickButtonText}>
                  {days === 365 ? '+1 year' : `+${days}d`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{isEditing ? 'Save changes' : 'Add subscription'}</Text>
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
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  quickButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickButtonText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

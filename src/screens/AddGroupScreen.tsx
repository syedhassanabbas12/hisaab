import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../store/AppContext';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddGroup'>;

export default function AddGroupScreen({ navigation }: Props) {
  const { addGroup } = useApp();
  const [name, setName] = useState('');
  const [members, setMembers] = useState(['', '']);

  function updateMember(index: number, value: string) {
    setMembers((prev) => prev.map((m, i) => (i === index ? value : m)));
  }

  function handleSave() {
    const cleanedMembers = members.map((m) => m.trim()).filter(Boolean);
    if (!name.trim()) {
      Alert.alert('Missing name', 'Give this group a name, e.g. "Flat 3B".');
      return;
    }
    if (cleanedMembers.length < 2) {
      Alert.alert('Add members', 'A group needs at least 2 members to split anything.');
      return;
    }
    const group = addGroup(name.trim(), cleanedMembers);
    navigation.replace('GroupDetail', { groupId: group.id });
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
        <Text style={styles.title}>New group</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Group name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Flat 3B, Netflix Squad, Lahore Trip..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Members</Text>
          {members.map((m, i) => (
            <TextInput
              key={i}
              style={styles.input}
              value={m}
              onChangeText={(v) => updateMember(i, v)}
              placeholder={`Member ${i + 1} name`}
              placeholderTextColor={colors.textMuted}
            />
          ))}
          <TouchableOpacity
            style={styles.addMemberButton}
            onPress={() => setMembers((prev) => [...prev, ''])}
          >
            <Text style={styles.addMemberText}>+ Add another member</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Create group</Text>
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
  addMemberButton: { paddingVertical: 6 },
  addMemberText: { color: colors.primary, fontWeight: '700' },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

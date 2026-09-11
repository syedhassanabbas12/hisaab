import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import IconAvatar from '../components/IconAvatar';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../store/AppContext';
import { colors } from '../theme';
import { formatPkr } from '../utils/format';

export default function GroupsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { groups, expenses } = useApp();

  const totalsByGroup = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of expenses) {
      totals[e.groupId] = (totals[e.groupId] ?? 0) + e.amountPkr;
    }
    return totals;
  }, [expenses]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddGroup')}>
          <Text style={styles.addButtonText}>+ New group</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyText}>
              Create a group for your flat, roommates, or friend circle to start splitting bills
              and rent.
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}>
            <Card>
              <View style={styles.rowTop}>
                <View style={styles.stack}>
                  {item.members.slice(0, 4).map((m, idx) => (
                    <View key={m.id} style={[styles.stackedAvatar, { marginLeft: idx === 0 ? 0 : -12 }]}>
                      <IconAvatar name={m.name} shape="circle" size={32} />
                    </View>
                  ))}
                </View>
                <Text style={styles.itemAmount}>{formatPkr(totalsByGroup[item.id] ?? 0)}</Text>
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {item.members.length} member{item.members.length === 1 ? '' : 's'} ·{' '}
                {item.members.map((m) => m.name).join(', ')}
              </Text>
            </Card>
          </TouchableOpacity>
        )}
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
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stack: { flexDirection: 'row' },
  stackedAvatar: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 10 },
  itemMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  itemAmount: { fontSize: 15, fontWeight: '800', color: colors.primaryDark },
});

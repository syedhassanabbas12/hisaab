import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home',
  Subscriptions: 'repeat',
  Groups: 'people',
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(false);

  const leftRoutes = state.routes.slice(0, Math.ceil(state.routes.length / 2));
  const rightRoutes = state.routes.slice(Math.ceil(state.routes.length / 2));

  function renderTab(route: (typeof state.routes)[number], index: number) {
    const focused = state.routes[state.index].key === route.key;
    const icon = icons[route.name] ?? 'ellipse';
    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tab}
        onPress={() => navigation.navigate(route.name)}
      >
        <Ionicons name={icon} size={22} color={focused ? colors.primary : colors.textMuted} />
        <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{route.name}</Text>
      </TouchableOpacity>
    );
  }

  function openScreen(screen: 'AddSubscription' | 'AddGroup') {
    setSheetOpen(false);
    const parent = navigation.getParent();
    if (screen === 'AddSubscription') parent?.navigate('AddSubscription' as never);
    else parent?.navigate('AddGroup' as never);
  }

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom || 12 }]}>
      {leftRoutes.map(renderTab)}

      <View style={styles.fabSlot}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setSheetOpen(true)}
          accessibilityLabel="Add"
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {rightRoutes.map(renderTab)}

      <Modal visible={sheetOpen} transparent animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <View style={[styles.sheet, { marginBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHandle} />
            <TouchableOpacity style={styles.sheetRow} onPress={() => openScreen('AddSubscription')}>
              <View style={[styles.sheetIcon, { backgroundColor: '#E1F5EC' }]}>
                <Ionicons name="repeat" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>Add subscription</Text>
                <Text style={styles.sheetSubtitle}>Track a new recurring payment</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetRow} onPress={() => openScreen('AddGroup')}>
              <View style={[styles.sheetIcon, { backgroundColor: '#FBF0D9' }]}>
                <Ionicons name="people" size={18} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>New group</Text>
                <Text style={styles.sheetSubtitle}>Split bills with roommates or friends</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingTop: 4 },
  tabLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  tabLabelActive: { color: colors.primary },
  fabSlot: { flex: 1, alignItems: 'center' },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  sheetIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  sheetSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
});

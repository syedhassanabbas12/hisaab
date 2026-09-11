import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import AddGroupScreen from '../screens/AddGroupScreen';
import AddSubscriptionScreen from '../screens/AddSubscriptionScreen';
import DashboardScreen from '../screens/DashboardScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import GroupsScreen from '../screens/GroupsScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import { colors } from '../theme';
import { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Dashboard'
              ? 'home'
              : route.name === 'Subscriptions'
              ? 'repeat'
              : 'people';
          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text }}>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddSubscription"
        component={AddSubscriptionScreen}
        options={{ title: 'Subscription', presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddGroup"
        component={AddGroupScreen}
        options={{ title: 'New group', presentation: 'modal' }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ title: 'Add expense', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

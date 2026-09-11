import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  Subscriptions: undefined;
  Groups: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  AddSubscription: { subscriptionId?: string } | undefined;
  AddGroup: undefined;
  GroupDetail: { groupId: string };
  AddExpense: { groupId: string };
};

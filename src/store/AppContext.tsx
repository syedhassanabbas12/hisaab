import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Expense, Group, Member, Settlement, Subscription } from '../types';
import { loadJson, saveJson } from './storage';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

interface AppState {
  ready: boolean;
  subscriptions: Subscription[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];

  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;

  addGroup: (name: string, memberNames: string[]) => Group;
  addMemberToGroup: (groupId: string, name: string) => void;
  removeGroup: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;

  addSettlement: (settlement: Omit<Settlement, 'id'>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  useEffect(() => {
    (async () => {
      const [s, g, e, st] = await Promise.all([
        loadJson<Subscription[]>('subscriptions', []),
        loadJson<Group[]>('groups', []),
        loadJson<Expense[]>('expenses', []),
        loadJson<Settlement[]>('settlements', []),
      ]);
      setSubscriptions(s);
      setGroups(g);
      setExpenses(e);
      setSettlements(st);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) saveJson('subscriptions', subscriptions);
  }, [subscriptions, ready]);
  useEffect(() => {
    if (ready) saveJson('groups', groups);
  }, [groups, ready]);
  useEffect(() => {
    if (ready) saveJson('expenses', expenses);
  }, [expenses, ready]);
  useEffect(() => {
    if (ready) saveJson('settlements', settlements);
  }, [settlements, ready]);

  const addSubscription = useCallback((sub: Omit<Subscription, 'id'>) => {
    setSubscriptions((prev) => [...prev, { ...sub, id: uid() }]);
  }, []);

  const updateSubscription = useCallback((id: string, patch: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const removeSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addGroup = useCallback((name: string, memberNames: string[]) => {
    const members: Member[] = memberNames
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => ({ id: uid(), name: n }));
    const group: Group = { id: uid(), name, members };
    setGroups((prev) => [...prev, group]);
    return group;
  }, []);

  const addMemberToGroup = useCallback((groupId: string, name: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, members: [...g.members, { id: uid(), name: name.trim() }] }
          : g
      )
    );
  }, []);

  const removeGroup = useCallback((id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setExpenses((prev) => prev.filter((e) => e.groupId !== id));
    setSettlements((prev) => prev.filter((s) => s.groupId !== id));
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setExpenses((prev) => [...prev, { ...expense, id: uid() }]);
  }, []);

  const removeExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addSettlement = useCallback((settlement: Omit<Settlement, 'id'>) => {
    setSettlements((prev) => [...prev, { ...settlement, id: uid() }]);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      subscriptions,
      groups,
      expenses,
      settlements,
      addSubscription,
      updateSubscription,
      removeSubscription,
      addGroup,
      addMemberToGroup,
      removeGroup,
      addExpense,
      removeExpense,
      addSettlement,
    }),
    [
      ready,
      subscriptions,
      groups,
      expenses,
      settlements,
      addSubscription,
      updateSubscription,
      removeSubscription,
      addGroup,
      addMemberToGroup,
      removeGroup,
      addExpense,
      removeExpense,
      addSettlement,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

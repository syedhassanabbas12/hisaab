import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  subscriptions: '@hisaab/subscriptions',
  groups: '@hisaab/groups',
  expenses: '@hisaab/expenses',
  settlements: '@hisaab/settlements',
} as const;

export async function loadJson<T>(key: keyof typeof KEYS, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(KEYS[key]);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveJson<T>(key: keyof typeof KEYS, value: T): Promise<void> {
  await AsyncStorage.setItem(KEYS[key], JSON.stringify(value));
}

export { KEYS };

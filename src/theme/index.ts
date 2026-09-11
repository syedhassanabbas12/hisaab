export const colors = {
  background: '#F6F5F2',
  surface: '#FFFFFF',
  primary: '#0B6E4F',
  primaryDark: '#084C37',
  accent: '#E4572E',
  text: '#1C1C1E',
  textMuted: '#6B6B70',
  border: '#E6E4DE',
  danger: '#D64545',
  success: '#2E9E5B',
  warning: '#D98E04',
};

export const paymentMethodMeta: Record<
  string,
  { label: string; color: string }
> = {
  jazzcash: { label: 'JazzCash', color: '#E4002B' },
  easypaisa: { label: 'Easypaisa', color: '#00A651' },
  bank: { label: 'Bank Transfer', color: '#1F6FEB' },
  card: { label: 'Card', color: '#6E56CF' },
  cash: { label: 'Cash', color: '#6B6B70' },
};

export const categoryOptions = [
  'Streaming',
  'Music',
  'Cloud & Storage',
  'Software',
  'Gym & Fitness',
  'News',
  'Utilities',
  'Other',
];

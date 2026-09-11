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

  // Dark hero-card surface (Dashboard/Group balance cards)
  heroBg: '#12241E',
  heroBgLight: '#1B3229',
  heroBorder: '#24402F',
  heroText: '#F4F2EC',
  heroTextMuted: 'rgba(244,242,236,0.62)',
  heroGlow: 'rgba(214, 165, 74, 0.16)',
  gold: '#D6A54A',
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

// Colored icon-chip per category, echoing app-icon-style avatars (Netflix red,
// Spotify green, Figma multicolor...) in a consistent rounded-square language.
export const categoryChipMeta: Record<string, { color: string; bg: string; icon: string }> = {
  Streaming: { color: '#B3122A', bg: '#FCE4E7', icon: 'play' },
  Music: { color: '#0F8A5F', bg: '#E1F5EC', icon: 'musical-notes' },
  'Cloud & Storage': { color: '#1F6FEB', bg: '#E4EEFF', icon: 'cloud' },
  Software: { color: '#6E56CF', bg: '#EEE9FB', icon: 'code-slash' },
  'Gym & Fitness': { color: '#D9730D', bg: '#FCEEDD', icon: 'barbell' },
  News: { color: '#3A3A3D', bg: '#E9E9EA', icon: 'newspaper' },
  Utilities: { color: '#0E7C86', bg: '#DEF3F4', icon: 'flash' },
  Other: { color: '#8A6D3B', bg: '#F1E9D8', icon: 'ellipsis-horizontal' },
};

const avatarPalette = [
  { color: '#B3122A', bg: '#FCE4E7' },
  { color: '#0F8A5F', bg: '#E1F5EC' },
  { color: '#1F6FEB', bg: '#E4EEFF' },
  { color: '#6E56CF', bg: '#EEE9FB' },
  { color: '#D9730D', bg: '#FCEEDD' },
  { color: '#0E7C86', bg: '#DEF3F4' },
  { color: '#B8860B', bg: '#FBF0D9' },
  { color: '#A6336B', bg: '#FBE4F0' },
];

export function avatarMetaFor(seed: string): { color: string; bg: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return avatarPalette[hash % avatarPalette.length];
}

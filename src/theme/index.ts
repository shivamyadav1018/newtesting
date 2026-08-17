export const lightColors = {
  background: '#F5F7F8',
  surface: '#FFFFFF',
  surfaceMuted: '#EDF1F2',
  text: '#13201C',
  textMuted: '#63706B',
  border: '#DCE3E0',
  primary: '#168765',
  primarySoft: '#DDF3EB',
  interest: '#E87932',
  interestSoft: '#FCE8D9',
  danger: '#C94C4C',
  chartGrid: '#D8DFDC',
  white: '#FFFFFF',
  black: '#0D1512',
} as const;

export const darkColors = {
  background: '#0E1211',
  surface: '#171D1B',
  surfaceMuted: '#222A27',
  text: '#F0F5F2',
  textMuted: '#9BA9A3',
  border: '#303A36',
  primary: '#45C69A',
  primarySoft: '#173D31',
  interest: '#FF9A52',
  interestSoft: '#432B1D',
  danger: '#F17878',
  chartGrid: '#34403B',
  white: '#FFFFFF',
  black: '#090C0B',
} as const;

export type AppColors = {
  [K in keyof typeof lightColors]: string;
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 4,
  md: 8,
} as const;


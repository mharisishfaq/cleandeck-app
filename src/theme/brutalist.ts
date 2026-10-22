import { Platform } from 'react-native';

export const BRUTALIST = {
  colors: {
    bg: '#000000',
    surface: '#0A0A0A',
    surfaceRaised: '#141414',
    surfaceHighlight: '#1F1F1F',
    border: '#282828',
    borderLight: '#444444',
    borderStark: '#FFFFFF',
    borderAccent: '#D4FF00',
    text: '#FFFFFF',
    textDim: '#8E8E8E',
    textMuted: '#555555',
    accent: '#D4FF00', // Electric Acid Lime
    accentText: '#000000',
    danger: '#FF3333', // Signal Red
    dangerBg: 'rgba(255, 51, 51, 0.12)',
    dangerBorder: '#FF3333',
    success: '#00FF66', // Phosphor Green
    successBg: 'rgba(0, 255, 102, 0.12)',
    successBorder: '#00FF66',
  },
  typography: {
    mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  borders: {
    thin: 1,
    normal: 1.5,
    heavy: 2,
    thick: 3,
  },
  radii: {
    none: 0,
    xs: 3,
    sm: 6,
    md: 8,
  },
  shadows: {
    hardBox: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 0,
      elevation: 2,
    },
    hardAccent: {
      shadowColor: '#D4FF00',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 0,
      elevation: 3,
    },
    hardDanger: {
      shadowColor: '#FF3333',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 0,
      elevation: 3,
    },
  },
} as const;

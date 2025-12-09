import type { Theme } from '../hooks/useSystemTheme';

/**
 * Simple, consistent color palette for light and dark themes
 */
export const colors = {
  light: {
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceHover: '#e0e0e0',
    border: '#d0d0d0',
    text: '#1a1a1a',
    textSecondary: '#666666',
    primary: '#646cff',
    primaryHover: '#535bf2',
    success: '#28a745',
    warning: '#ffc107',
    warningBg: '#fff3cd',
    warningBorder: '#ffc107',
    error: '#dc3545',
    errorBg: '#f8d7da',
    errorBorder: '#f5c6cb',
  },
  dark: {
    background: '#1a1a1a',
    surface: '#2a2a2a',
    surfaceHover: '#3a3a3a',
    border: '#404040',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',
    primary: '#646cff',
    primaryHover: '#747bff',
    success: '#4ade80',
    warning: '#fbbf24',
    warningBg: '#422006',
    warningBorder: '#78350f',
    error: '#f87171',
    errorBg: '#450a0a',
    errorBorder: '#7f1d1d',
  },
};

export function getColors(theme: Theme) {
  return colors[theme];
}

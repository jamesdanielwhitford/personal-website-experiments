import React from 'react';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { getColors } from '../../theme/colors';

interface ThemedLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper that applies system theme to all children
 * Automatically detects and follows OS dark/light mode preference
 */
export const ThemedLayout: React.FC<ThemedLayoutProps> = ({ children }) => {
  const theme = useSystemTheme();
  const colors = getColors(theme);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        color: colors.text,
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {children}
    </div>
  );
};

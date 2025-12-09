import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Hook that detects and tracks system theme preference
 * Automatically updates when user changes their OS theme
 */
export function useSystemTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check system preference on initial load
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // Create media query to listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Handler for theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return theme;
}

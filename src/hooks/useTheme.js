import { useCallback, useEffect, useState } from 'react';

const THEME_COLOR = { light: '#f2efe9', dark: '#07080c' };

export default function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  }, [theme]);

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('pf-theme', next);
    } catch {
      // storage can be blocked; the choice then lasts for this visit only
    }
  }, [theme]);

  return [theme, toggle];
}

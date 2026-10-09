import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
const UI_SCALE_KEY = 'sis_ui_scale';
const THEME_KEY = 'sis_theme';
const DEFAULT_SOURCE_KEY = 'sis_default_feedback_source';

export const SCALE_PRESETS = [
  { label: '85% Compact', value: 85 },
  { label: '100% Standard', value: 100 },
  { label: '115% Comfortable', value: 115 },
  { label: '125% Large', value: 125 },
  { label: '140% Extra Large', value: 140 },
];

export function ThemeProvider({ children }) {
  // Theme: 'light' | 'dark'
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'light';
  });

  // UI Scale
  const [scale, setScaleState] = useState(() => {
    const saved = localStorage.getItem(UI_SCALE_KEY);
    return saved ? Number(saved) : 100;
  });

  // Default Feedback Source filter preference
  const [defaultSource, setDefaultSourceState] = useState(() => {
    return localStorage.getItem(DEFAULT_SOURCE_KEY) || 'ALL';
  });

  // Apply Theme to document root
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Could not set theme attribute:', e);
    }
  }, [theme]);

  // Apply Scale safely (only if not on login page to avoid login wedge squishing)
  useEffect(() => {
    try {
      localStorage.setItem(UI_SCALE_KEY, String(scale));
      const isLogin = window.location.pathname.includes('/login');
      if (document.documentElement) {
        if (isLogin) {
          document.documentElement.style.zoom = '100%';
        } else {
          document.documentElement.style.zoom = `${scale}%`;
        }
      }
    } catch (e) {
      console.warn('Could not apply UI zoom scale:', e);
    }
  }, [scale]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme === 'dark' ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setScale = (newScale) => {
    const clamped = Math.min(Math.max(Number(newScale) || 100, 75), 160);
    setScaleState(clamped);
  };

  const zoomIn = () => {
    setScaleState((prev) => Math.min(prev + 10, 160));
  };

  const zoomOut = () => {
    setScaleState((prev) => Math.max(prev - 10, 75));
  };

  const resetScale = () => {
    setScaleState(100);
  };

  const setDefaultSource = (sourceKey) => {
    localStorage.setItem(DEFAULT_SOURCE_KEY, sourceKey);
    setDefaultSourceState(sourceKey);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        scale,
        setScale,
        zoomIn,
        zoomOut,
        resetScale,
        presets: SCALE_PRESETS,
        defaultSource,
        setDefaultSource,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;

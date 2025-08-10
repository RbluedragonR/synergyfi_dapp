import { useEffect, useMemo, useState } from 'react';

import { SystemPrefersColorScheme, THEME_ENUM } from '@/constants';

export function useSystemPrefersColor(): THEME_ENUM {
  const [colorScheme, setPrefersColorScheme] = useState<SystemPrefersColorScheme>('auto');

  const theme = useMemo(() => {
    if (colorScheme === 'auto') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return THEME_ENUM.LIGHT;
      }
      return THEME_ENUM.DARK;
    }
    return colorScheme;
  }, [colorScheme]);

  useEffect(() => {
    if (window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        // dark mode
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
          const newColorScheme = event.matches ? THEME_ENUM.DARK : THEME_ENUM.LIGHT;
          setPrefersColorScheme(newColorScheme);
        });
      } else {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (event) => {
          const newColorScheme = event.matches ? THEME_ENUM.LIGHT : THEME_ENUM.DARK;
          setPrefersColorScheme(newColorScheme);
        });
      }
    }
  }, []);

  return theme;
}

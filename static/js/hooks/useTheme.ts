import { useCallback } from 'react';

import { DEFAULT_THEME, THEME_ENUM } from '@/constants';
import { LOCAL_THEME } from '@/constants/storage';
import { useTheme } from '@/features/global/hooks';

export function useSwitchTheme(): () => void {
  const { setDataTheme } = useTheme();
  const getTheme = () => {
    return (localStorage.getItem(LOCAL_THEME) || DEFAULT_THEME) as THEME_ENUM;
  };
  const onThemeToggle = useCallback(() => {
    const themeMap = {
      [THEME_ENUM.DARK]: THEME_ENUM.LIGHT,
      [THEME_ENUM.LIGHT]: THEME_ENUM.DARK,
    };
    const currTheme = themeMap[getTheme()];
    localStorage.setItem(LOCAL_THEME, currTheme);

    document.documentElement.setAttribute('data-theme', currTheme);
    setDataTheme(currTheme);
  }, [setDataTheme]);
  return onThemeToggle;
}

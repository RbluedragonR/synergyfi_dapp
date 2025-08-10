/**
 * @description component switch theme
 */
import classNames from 'classnames';
import { FC, useEffect } from 'react';
import { animated, useSpring } from 'react-spring';

import { THEME_ENUM } from '@/constants';
import { useTheme } from '@/features/global/hooks';
import { useGa } from '@/hooks/useGa';
import { useSwitchTheme } from '@/hooks/useTheme';
import { GaCategory } from '@/utils/analytics';

import { ReactComponent as IconThemeMoon } from './assets/icon_theme_moon.svg';
import { ReactComponent as IconThemeSun } from './assets/icon_theme_sun.svg';
import './index.less';

const SwitchTheme: FC = function () {
  const { dataTheme } = useTheme();
  const gaEvent = useGa();
  const onThemeToggle = useSwitchTheme();
  const iconStyles = useSpring({
    paddingLeft: dataTheme === THEME_ENUM.DARK ? 20 : 4,
  });
  useEffect(() => {
    if (dataTheme) {
      document.documentElement.setAttribute('data-theme', dataTheme);
    }

    console.record('other', 'Theme init', dataTheme);
  }, [dataTheme]);
  return (
    <animated.div
      style={iconStyles}
      className={classNames('switch_theme')}
      onClick={(e) => {
        onThemeToggle();
        e.preventDefault();
        e.stopPropagation();
        gaEvent({
          category: GaCategory.HEADER,
          action: 'Others-Click on Mode',
          label: dataTheme === THEME_ENUM.DARK ? THEME_ENUM.LIGHT : THEME_ENUM.DARK,
        });
      }}>
      <span className="switch_theme-icon">{dataTheme === THEME_ENUM.DARK ? <IconThemeMoon /> : <IconThemeSun />}</span>
    </animated.div>
  );
};

export default SwitchTheme;

/**
 * @description Logo
 */
import { FC, useMemo } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { THEME_ENUM } from '@/constants';

import { ReactComponent as LogoDark } from './assets/logo_dark.svg';
import { ReactComponent as LogoLight } from './assets/logo_light.svg';
// import { ReactComponent as LogoMobile } from './assets/logo_mobile.svg';
// import { ReactComponent as LogoMobileDark } from './assets/logo_moblie_dark.svg';
interface IPropTypes {
  dataTheme: THEME_ENUM;
}
const Logo: FC<IPropTypes> = function ({ dataTheme }) {
  const { isMobile } = useMediaQueryDevice();
  const logo = useMemo(() => {
    return dataTheme === THEME_ENUM.DARK ? <LogoDark /> : <LogoLight />;
  }, [dataTheme]);
  const mobileLogo = useMemo(() => {
    return dataTheme === THEME_ENUM.DARK ? <LogoDark height={24} /> : <LogoLight height={24} />;
  }, [dataTheme]);
  return <> {isMobile ? mobileLogo : logo}</>;
};

export default Logo;

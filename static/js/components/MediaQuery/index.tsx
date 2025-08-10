import { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';

/**
 * Desktop or laptop
 */
const Desktop = ({ children }: { children: JSX.Element }): JSX.Element | null => {
  const isDesktop = useMediaQuery({ minWidth: 1280 });
  return isDesktop ? children : null;
};

/**
 * Tablet
 */
const Tablet = ({ children }: { children: JSX.Element }): JSX.Element | null => {
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1279 });
  return isTablet ? children : null;
};

/**
 * Mobile
 */
const Mobile = ({ children }: { children: JSX.Element }): JSX.Element | null => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  return isMobile ? children : null;
};

/**
 * Not mobile (desktop or laptop or tablet)
 */
const Default = ({ children }: { children: JSX.Element }): JSX.Element | null => {
  const isNotMobile = useMediaQuery({ minWidth: 768 });
  return isNotMobile ? children : null;
};

export { Default, Desktop, Mobile, Tablet };

/**
 * get device
 * @returns
 */
export function useMediaQueryDevice(): {
  isDesktop: boolean;
  isBigScreen: boolean;
  isTablet: boolean;
  isPortrait: boolean;
  isRetina: boolean;
  isMobile: boolean;
  isNotMobile: boolean;
  deviceType: string;
} {
  const isDesktop = useMediaQuery({ minWidth: 1279 });
  const isBigScreen = useMediaQuery({ query: '(min-width: 1824px)' });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1279 });
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
  const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isNotMobile = useMediaQuery({ minWidth: 768 });

  const deviceType = useMemo(() => {
    if (isMobile) return 'mobile';
    else if (isTablet) return 'tablet';
    else if (isDesktop) return 'desktop';
    return '';
  }, [isDesktop, isMobile, isTablet]);
  return { isDesktop, isBigScreen, isTablet, isPortrait, isRetina, isMobile, isNotMobile, deviceType };
}

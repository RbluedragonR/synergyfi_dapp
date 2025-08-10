import { useLocation } from 'react-router-dom';

import GoogleAnalyticsReporter from '@/components/Analytics/GoogleAnalyticsReporter';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import TermModal from '@/components/TermModal';

import MintToaster from './components/MintToaster';
import GlobalWalletModal from './components/WalletStatus/GlobalWalletModal';
import PortfolioPageConnectionCheck from './mobile/PortfolioMobile/PortfolioPageConnectionCheck';

export default function GlobalComponent(): JSX.Element {
  const { isMobile } = useMediaQueryDevice();
  const location = useLocation();
  return (
    <>
      {/* <InitialNetworkSwitchModal /> */}
      <TermModal />
      {/* <GlobalNetworkModal /> */}
      <GlobalWalletModal />
      <GoogleAnalyticsReporter />
      {isMobile && !location.pathname.includes('blocker') && <MintToaster />}
      {isMobile && <PortfolioPageConnectionCheck />}
    </>
  );
}

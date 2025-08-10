import { Suspense } from 'react';
import { Navigate, RouteProps } from 'react-router-dom';
import EarnMobileSubpage from './mobile/EarnMobileSubpage';
import TradeMobile from './mobile/TradeMobile';
import { DesktopTradeFallback } from './trade/Fallback';

export enum RouteBasePath {
  launchpad = 'launchpad',
  Year2024Summary = '2024-syn-score',
  spot = 'spot',
  earn = 'earn',
  portfolio = 'portfolio',
  trade = 'trade',
  market = 'market',
  referral = 'referral',
}

// Lazy load your components
import PortfolioPage from '@/pages/portfolio';
import ThemePage from '@/pages/theme';
import TradePage from '@/pages/trade';
import Market from './Market';
import MobileBlocker from './MobileBlocker';
import Odyssey from './Odyssey';
import ReferralPage from './Referral';
import SpotPage from './Spot';
import TGP from './TGP';
import CampaignPage from './campaign';
import Cosplay from './components/Cosplay';
import PageHelper from './components/PageHelper';
import PortfolioMobile from './mobile/PortfolioMobile';
import TradingPairsMobile from './mobile/TradingPairsMobile';
import VaultPage from './vault';

const routers: Array<RouteProps> = [
  {
    path: 'cosplay/:impostorAddress',
    element: <PageHelper mobileComponent={<Navigate to="/trade" replace />} desktopComponent={<Cosplay />} />,
  },
  {
    path: 'theme',
    element: <ThemePage />,
  },
  // {
  //   path: '/test',
  //   element: (
  //     <div style={{ position: 'fixed', top: 0, left: 0 }}>
  //       <Loading spinning size="large" />
  //     </div>
  //   ),
  // },
  {
    path: '/trade',
    element: (
      <Suspense fallback={<DesktopTradeFallback />}>
        <TradePage />
      </Suspense>
    ),
  },
  {
    path: '/odyssey',
    element: <Odyssey />,
  },
  {
    // token0 and token1 are address or symbol
    path: `/${RouteBasePath.spot}/:spotType?/:chainShortName?/:token0?/:token1?`,
    element: <SpotPage />,
  },
  {
    path: '/odyssey/:chainName/:referralCode',
    element: <Odyssey />,
  },
  {
    path: '/trade/:chainShortName/:pairSymbol?',
    element: (
      <Suspense fallback={<DesktopTradeFallback />}>
        <TradePage />
      </Suspense>
    ),
  },
  {
    path: '/market',
    element: <Market />,
  },
  {
    path: '/portfolio',
    element: <PortfolioPage />,
  },
  {
    path: '/portfolio/:tab',
    element: <PortfolioPage />,
  },
  {
    path: '/earn',
    element: (
      <Suspense fallback={<DesktopTradeFallback />}>
        <TradePage />
      </Suspense>
    ),
  },
  {
    path: '/earn/:chainShortName/:pairSymbol?',
    element: (
      <Suspense fallback={<DesktopTradeFallback />}>
        <TradePage />
      </Suspense>
    ),
  },
  {
    path: '/campaign',
    element: <CampaignPage />,
  },
  {
    path: '/tgp',
    element: <TGP />,
  },
  {
    path: `/${RouteBasePath.launchpad}/:chainShortName/:vaultAddress?`,
    element: <VaultPage />,
  },
  {
    path: '/referral/:chainShortName/:affiliateType?',
    element: (
      <Suspense fallback={<DesktopTradeFallback />}>
        <ReferralPage />
      </Suspense>
    ),
  },
];

export { routers };

export const mobileRouters: Array<RouteProps> = [
  {
    path: 'cosplay/:impostorAddress',
    element: <Cosplay />,
  },
  {
    path: 'market',
    element: <TradingPairsMobile />,
  },
  {
    path: `${RouteBasePath.trade}/:chainShortName/:pairSymbol?`,
    element: <TradeMobile />,
  },
  {
    path: `${RouteBasePath.earn}/:chainShortName/:pairSymbol?`,
    element: <EarnMobileSubpage />,
  },
  {
    path: '/campaign',
    element: <CampaignPage />,
  },
  {
    path: 'theme',
    element: <ThemePage />,
  },
  {
    path: 'portfolio',
    element: <PortfolioMobile />,
  },
  {
    path: 'blocker',
    element: <MobileBlocker />,
  },
  {
    // token0 and token1 are address or symbol
    path: `/${RouteBasePath.spot}/:spotType?/:chainShortName?/:token0?/:token1?`,
    element: <SpotPage />,
  },
];

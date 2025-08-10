import { isMobile } from 'react-device-detect';
import ReactGA, { EventArgs } from 'react-ga';

export function catchException(error: Error | unknown): void {
  console.log('sending error to sentry', error);
  // Sentry.captureException(error);
}

export enum GaCategory {
  SIGN_UP = 'SIGN_UP',
  EMERGENCY = 'EMERGENCY',
  CAMPAIGN = 'Campaign',
  ACKNOWLEDGEMENTS = 'Acknowledgements',
  TOP_NOTICE = 'Top Notice',
  FOOTER = 'Footer',
  HEADER = 'Header',
  WALLET_MODULE = 'WalletModule',
  TRADE_BANNER_1 = 'Trade-Banner1',
  TRADE_BANNER_2 = 'Trade-Banner2',
  TRADE_BANNER_3 = 'Trade-Banner3',
  TRADE_BODY = 'Trade-Body',
  EARN_CARD_WRAPPER = 'Earn-CardWrapper',
  ADD_LIQUIDITY_MODULE = 'AddLiquidityModule',
  REMOVE_LIQUIDITY_MODULE = 'RemoveLiquidityModule',
  EARN_BODY = 'Earn-Body',
  SETTING_MODULE = 'SettingModule',
  ACCOUNTS_BODY = 'Accounts-Body',
  DEP_WITH_MODULE = 'DepWdrlModule',
  HISTORY_BODY = 'History-Body',
  TRADE_PAIR_BANNER = 'TradePair-Banner',
  TRADE_PAIR_PIE_CHART = 'TradePair-PriceChart',
  TRADE_PAIR_CARD_WRAPPER = 'TradePair-CardWrapper',
  EARN_PAIR_CARD_WRAPPER = 'EarnPair-CardWrapper',
  TRADE_PAIR_HEADER = 'TradePair-Header',
  TRADE_PAIR_ACCOUNT_TABLE = 'TradePair-AccountTable',
  CLOSE_MODULE = 'CloseModule',
  TRANSACTION = 'Transaction',
  TELL_A_FRIEND = 'Tell A Friend',
  TELL_A_FRIEND_INVITATION_LINK = 'Tell A Friend-Invitation Link',
  TELL_A_FRIEND_NFT_REWARDS = 'Tell A Friend-NFT Rewards',
}

export function gaEvent({ category, action, label, value, nonInteraction }: EventArgs): void {
  ReactGA.event({
    category,
    action,
    value,
    label,
    nonInteraction,
  });
}

export function initReactGA(): void {
  const GOOGLE_ANALYTICS_ID: string | undefined = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
  if (typeof GOOGLE_ANALYTICS_ID === 'string' && GOOGLE_ANALYTICS_ID && GOOGLE_ANALYTICS_ID !== 'test') {
    const testMode = process.env.NODE_ENV === 'test';
    ReactGA.initialize(GOOGLE_ANALYTICS_ID, { testMode: testMode });
    ReactGA.set({
      customBrowserType: !isMobile
        ? 'desktop'
        : 'web3' in window || 'ethereum' in window
        ? 'mobileWeb3'
        : 'mobileRegular',
    });
  } else {
    ReactGA.initialize('test', { testMode: true, debug: true });
  }
}

export function setUserId(userId: string): void {
  ReactGA.set({ userId: userId });
}

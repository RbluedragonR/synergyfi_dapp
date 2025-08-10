export enum PORTFOLIO_TAB_ITEMS {
  POSITION = 'Position',
  ORDER = 'Order',
  HISTORY = 'History',
  ACCOUNT = 'Account',
  PORTFOLIO = 'Portfolio',
  LIQUIDITY = 'Liquidity',
}
export const defaultPortfolioTabItem = {
  mobile: PORTFOLIO_TAB_ITEMS.POSITION,
  desktop: PORTFOLIO_TAB_ITEMS.PORTFOLIO,
};
export const portfolioTabItemInfos: {
  [id in PORTFOLIO_TAB_ITEMS]: {
    mobileOrDesktop: 'all' | 'mobile' | 'desktop';
  };
} = {
  [PORTFOLIO_TAB_ITEMS.LIQUIDITY]: {
    mobileOrDesktop: 'mobile',
  },
  [PORTFOLIO_TAB_ITEMS.POSITION]: {
    mobileOrDesktop: 'mobile',
  },
  [PORTFOLIO_TAB_ITEMS.ORDER]: {
    mobileOrDesktop: 'mobile',
  },
  [PORTFOLIO_TAB_ITEMS.HISTORY]: {
    mobileOrDesktop: 'desktop',
  },
  [PORTFOLIO_TAB_ITEMS.ACCOUNT]: {
    mobileOrDesktop: 'mobile',
  },
  [PORTFOLIO_TAB_ITEMS.PORTFOLIO]: {
    mobileOrDesktop: 'desktop',
  },
};
export const EMERGENCY_CLOSE_TIME = 5;

export const USER_VOLUME_API_PREFIX = `/v3/public/perp/market/user/volume`;
export const QUOTE_HISTORY_PRICE_LIST_API = '/v3/coin/price-history';

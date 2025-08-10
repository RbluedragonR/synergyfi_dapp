export const DEFAULT_EMPTY_ACCOUNT = '0x0000000000000000000000000000000000000000';
// leverage
export const DynamicLeverage = 'DynamicLeverage';

// liquidity
export const CREATE_POOL_KEY = 'CREATING_POOL';
export enum LIQUIDITY_FORM_TYPE {
  CREATE = 'CREATE',
  ADD_REMOVE = 'ADD_REMOVE',
}
export enum PAIR_PAGE_TYPE {
  TRADE = 'trade',
  EARN = 'earn',
}

export const enum TRADE_LEVERAGE_THRESHOLDS {
  MIN = 0.1,
  MAX = 10,
  ACTUAL_MAX = 9.9,
  DEFAULT = 5,
  STEP = 0.1,
  ACTUAL_MAX_STEP = 0.1,
}

/**
 * show warning when slippage is higher than threshold
 */
export const enum SLIPPAGE_THRESHOLDS {
  LOW = 0.1,
  HIGH = 5, // show warning when bigger than 5%
  MIN = 0.01,
  MAX = 5,
  DEFAULT = 0.1,
}

export const enum DEADLINE_THRESHOLDS {
  MIN = 1,
  MAX = 60,
  DEFAULT = 5,
}

export enum FLEX_TABLE_TYPE {
  ACCOUNTS = 'ACCOUNTS',
  SEARCH = 'SEARCH',
}

export const enum EARN_ALPHA_THRESHOLDS {
  MIN = 1,
  MAX = 5,
  DEFAULT = 4,
  DEFAULT_TICK = 20,
  DEFAULT_IMR = 0.1,
}

export enum TABLE_TYPES {
  POSITION = 'Position',
  LIQUIDITY = 'Liquidity',
  LIQUIDITY_HISTORY = 'Liquidity History',
  OPEN_ORDERS = 'Open Orders',
  TRADE_HISTORY = 'Trade History',
  ORDER_HISTORY = 'Order History',
  TRANSFERS = 'Transfers',
  FUNDING = 'Funding',
  TRADING_PAIR = 'Trading Pair',
  ASSETS = 'Assets',
  PORTFOLIO_POSITIONS = 'Portfolio Positions',
  PORTFOLIO_LIQUIDITIES = 'Portfolio Liquidities',
  PORTFOLIO_OPEN_ORDERS = 'Portfolio Open Orders',
  EARN_LIST = 'Earn List',
  VOLUME_DETAIL = 'Volume-Detail',
  HISTORY = 'HISTORY',
}

export const DEFAULT_DECIMALS = 18;
export const INPUT_NUMBER_STEP = 0.001;

export enum SEARCH_PAIR_SORTERS {
  FAVORITE = 'favorite',
  EARN_FAVORITE = 'earn.favorite',
  VOLUME_24H = '24HV',
  CHANGE_24H = '24HC',
  BOOSTED_LIQUIDITY = 'effectLiq',
  TVL = 'tvl',
  OI = 'oi',
  APY = 'apy',
}
export const SEARCH_PAIR_SORTERS_TRANSLATION = {
  [SEARCH_PAIR_SORTERS.FAVORITE]: '24HV',
  [SEARCH_PAIR_SORTERS.EARN_FAVORITE]: 'earn.estApy',
  [SEARCH_PAIR_SORTERS.VOLUME_24H]: '24HV',
  [SEARCH_PAIR_SORTERS.CHANGE_24H]: '24HC',
  [SEARCH_PAIR_SORTERS.TVL]: 'tvl',
  [SEARCH_PAIR_SORTERS.OI]: 'oiS',
  [SEARCH_PAIR_SORTERS.APY]: 'table.liqApy',
  [SEARCH_PAIR_SORTERS.BOOSTED_LIQUIDITY]: 'effectLiq',
};
export enum SEARCH_PAIR_DIRECTION {
  ASC = 'asc',
  DSC = 'desc',
}

export const BATCH_INSTRUMENT_SIZE = 20;

export const SIGNIFICANT_DIGITS = 5;

export const PAIR_RATIO_BASE = 10000;
export const MMR_RATIO = 0.2;
export const TVL_THRESHHOLD = 0;
export const GLOBAL_TVL_THRESHHOLD = 100;
export const MARK_FAIR_DEV_THRESHHOLD = 0.005;
export const AIP_DOMAIN =
  process.env.REACT_APP_API_ENV === 'dev' ? 'https://test.api.iftl.info' : 'https://api.synfutures.com';

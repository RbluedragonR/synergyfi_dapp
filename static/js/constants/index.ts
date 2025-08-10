import { BigNumber } from 'ethers';

// empty balance account just for no wallet view
export { DEFAULT_EMPTY_ACCOUNT } from './global';
export { OPERATION_TX_TYPE } from './tx';

export const INTERCOM_APP_ID = 'ms7pdxxd';

/**
 * default display decimals places
 */
export const DEFAULT_DECIMAL_PLACES = 4;

export const ETH_DECIMALS_PLACES = 18;

/**
 * fetching status
 */
export enum FETCHING_STATUS {
  INIT = 0,
  FETCHING = 1, // >0 display loading
  DONE = -1,
}

/**
 * gas price type
 */
export enum GAS_PRICE_TYPE {
  SLOW = 'Slow',
  Standard = 'Standard',
  FAST = 'Fast',
  INSTANT = 'Instant',
}

// trade direction
export enum TRADE_DIRECTION {
  LONG = 'Long',
  SHORT = 'Short',
}

export enum GlobalModalType {
  Account = 'Account',
  INITIAL_CHAIN_SWITCH = 'INITIAL_CHAIN_SWITCH',
  Wallet = 'Wallet',
  IpBlocked = 'IpBlocked',
  Emergency = 'Emergency',
  WrongNetwork = 'WrongNetwork',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  SignedUp = 'SignedUp',
  SignUp = 'SignUp',
  Leadership = 'Leadership',
  Term = 'Term',
  Boost = 'Boost',
  Team = 'Team',
  TradeGuidance = 'Trade Guidance',
  EarnGuidance = 'Earn Guidance',
  ACCOUNT_TABLE = 'Account Table',
  SETTLE = 'Settle',
  CREATE_POOL = 'Create Pool',
  PAIR_NOT_FOUND = 'Pair not found',
  TRADE_MOBILE = 'TRADE_MOBILE',
  MYSTERY_BOX = 'mystery_box',
  SPIN_WHEEL = 'spin_wheel',
  PROVIDE_LIQUIDITY = 'provide_liquidity',
  INVITE_FRIEND = 'invite_friend',
  SQUAD_REWARD = 'squad_reward',
  SQUAD_MEMBER = 'squad_member',
  LUCKY_DRAW = 'lucky_draw',
  LUCK_TICKET = 'lucky_ticket',
  LUCKY_CLAIM = 'lucky_claim',
  CLAIM_TOKEN = 'claim_token',
  MOBILE_TRADE = 'mobile_trade',
  MOBILE_EARN = 'mobile_earn',
  ORDER_PREVIEW = 'order_preview',
}

export enum SecondGlobalModalType {
  HIGH_RISK_LIQUIDITY = 'HIGH_RISK_LIQUIDITY',
  PNL_SHARE = 'PNL_SHARE',
  PNL_SHARE_NOTIFICATION = 'PNL_SHARE_NOTIFICATION',
  CAMPAIGN_LEADERBOARD = 'CAMPAIGN_LEADERBOARD',
  SYN_SCORE_2024 = 'SYN_SCORE_2024',
}

export enum ThirdGlobalModalType {
  TOKEN_EXCHANGE = 'TOKEN_EXCHANGE',
}

export enum TabType {
  Trade = 'trade',
  Earn = 'earn',
}

export enum EVENT_SOURCE_TYPE {
  ETHERS = 'ethers',
  GRAPH = 'graph',
}

// theme key
export enum THEME_ENUM {
  DARK = 'dark-theme',
  LIGHT = 'light-theme',
}
export type SystemPrefersColorScheme = 'auto' | THEME_ENUM;

export enum TRADE_FORM_TYPE {
  TradeForm = 'TradeForm',
  ClosePosition = 'ClosePosition',
}

export enum WEB3_NETWORK_TYPE {
  Dapp = 'Dapp',
  Wallet = 'Wallet',
}

export enum BALANCE_TYPE {
  WITHDRAW = 'WITHDRAW',
  DEPOSIT = 'DEPOSIT',
}

export const WAD = BigNumber.from(String(10 ** 18));
export const ZERO = BigNumber.from(0);
export const ONE = BigNumber.from(1);
export const TWO = BigNumber.from(2);
export enum FILTER_GROUP_ENUM {
  EXPIRY = 1,
  FAVORITE = 2,
}

export const FULL_WIDTH_ROUTES = ['campaigns', 'tell-a-friend', 'portfolio', 'odyssey', 'tgp', 'referral'];

//Expiry
export const PERP = 'Perpetual';

export const enum PAIR_COLOR_TYPE {
  InPosition = '#00BFBF',
  InRange = '#99BBFF',
  InOrder = '#30E84F',
  InAccount = '#66CCFF',
  InWithdrawPendingLock = '#00AAFF',
  Others = '#E2E7E9',
}

export enum AVAILABLE_LANGS {
  ENGLISH = 'en',
  TURKEY = 'tr',
  VIETNAMESE = 'vi',
  KOREAN = 'kr',
  Spanish = 'es',
  French = 'fr',
  Japanese = 'ja',
  Thai = 'th',

  // VIETNAM = 'vn',
}
export const LANGUAGE_KEY = 'LANGUAGE_CHOSEN';

export const DEFAULT_THEME = THEME_ENUM.LIGHT;

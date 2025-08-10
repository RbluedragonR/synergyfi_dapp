import _ from 'lodash';

export enum CHART_TYPE {
  PRICE = 'Price',
  DEPTH = 'Depth',
  DETAIL = 'Detail',
  ADD_LIQ = 'AddLq',
  FUNDING = 'Funding',
  INFO = 'Info',
  VOLUME = 'Volume',
}
export enum CHART_DURATION {
  H = 'H',
  D = 'D',
  W = 'W',
  M = 'M',
}
export enum TRADE_TYPE {
  MARKET = 'market',
  LIMIT = 'limit',
  SCALE_LIMIT = 'scale_limit',
  ADJUST_MARGIN = 'adjust_margin',
  CLOSE_POSITION = 'close_position',
  DEPOSIT_NATIVE = 'deposit_native',
}

export const IMR_ERROR = '0xde4607ee'; //'Insufficient margin to open position';
export const MMR_ERROR = '0x2f61ef0b'; // 'Insufficient margin for this trade';
export const OPEN_ORDER_QUERY_KEY = 'openOrder';

export enum MANAGE_SIDE {
  IN = 'IN',
  OUT = 'OUT',
}
export enum LEVERAGE_ADJUST_TYPE {
  BY_AMOUNT = 'by_amount',
  BY_LEVERAGE = 'by_leverage',
}

export const getImrStepRatio = (imr = DEFAULT_IMR) => {
  if (imr <= 100) {
    return [10, 20, 40];
  }
  if (imr >= 1000) {
    return [10, 100, 200];
  }
  return [10, imr * 0.1, imr * 0.2];
};
export const getScaleLimitStepRatio = (imr = DEFAULT_IMR) => {
  if (imr <= 100) {
    return [5, 10, 20, 40];
  }
  if (imr >= 1000) {
    return [5, 10, 20, 100, 200];
  }
  return _.sortedUniq([5, 10, 20, imr * 0.1, imr * 0.2]);
};
export const DEFAULT_IMR = 100;
export const DEFAULT_STEP_RATIO = 10;
export const DEFAULT_MAX_COUNT = 9;
export const DEFAULT_ORDER_COUNT = 5;
export const MIN_ORDER_COUNT = 2;
export const DEFAULT_ORDER_GAP = 4;

export const INVALID_PRICE = 'Invalid price';

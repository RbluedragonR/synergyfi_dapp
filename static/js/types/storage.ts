import { TRADE_TYPE } from '@/constants/trade';

export interface ILeverageStorage {
  [chainId: number]: {
    [userAddr: string]: {
      [pairId: string]: string;
    };
  };
}
export interface IPairStorage {
  [chainId: number]: {
    [userAddr: string]: {
      [marketType: string]: string;
    };
  };
}

export const DYNAMIC = 'Dynamic';
export const LEVERAGE_ADJUST = 'leverage_adjust';
export type LEVERAGE_KEY_TYPE = TRADE_TYPE | typeof DYNAMIC | typeof LEVERAGE_ADJUST;
export interface IMobileMintStorage {
  [chainId: number]: boolean;
}

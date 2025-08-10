import { CHAIN_ID } from '@/constants/chain';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { TokenInfo } from '@/types/token';
// import { CoingeckoMapping } from './coingecko';
export interface ITokenBalanceInfo extends TokenInfo, IBalanceInBlock {
  // coingeckoMapping?: CoingeckoMapping; // coingecko token symbol
  isLoading?: boolean;
}

/**
 * token balance map
 *
 * @export
 * @interface ITokenBalanceInfoMap
 */
export interface ITokenBalanceInfoMap {
  [tokenAddress: string]: ITokenBalanceInfo;
}

export function getDefaultTokenBalanceInfo(chainId: CHAIN_ID): ITokenBalanceInfo {
  return {
    id: '',
    address: '',
    chainId,
    decimals: 0,
    symbol: '',
    balance: WrappedBigNumber.ZERO,
    block: 0,
  };
}

export interface IBalanceInBlock {
  balance: WrappedBigNumber;
  block: number;
}

export interface IGateAccountState {
  isOperating?: boolean | undefined;
  depositAmountStr: string;
  chainId: number;
  amountRatio: number;
}

export const getDefaultITradeAccountState = (): Omit<IGateAccountState, 'chainId'> => ({
  isOperating: false,
  depositAmountStr: '',
  amountRatio: 0,
});

export interface IGateBalanceInfo extends TokenInfo {
  balance: WrappedBigNumber;
  symbol: string;
  decimals: number;
  address: string;
  name?: string;
}

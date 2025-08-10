import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { QUERY_KEYS } from '@/constants/query';
import { SPOT_KLINE_INTERVAL, SPOT_KLINE_INTERVAL_TICK_GAP } from '@/constants/spot';
import { queryClient } from '@/pages/App';
import { ISpotOrderbookDex } from '@/types/spot';
import { TokenInfo } from '@/types/token';
import _ from 'lodash';

interface ISpotOrderbookPoolWithPercent extends ISpotOrderbookDex {
  percent: number;
}

export function getPoolsWithPercent(dexes: ISpotOrderbookDex[]): ISpotOrderbookPoolWithPercent[] {
  if (!dexes.length) return [];

  const totalToken0Size = dexes.reduce((sum, pool) => sum + pool.token0Size, 0);

  return dexes.map((dex) => ({
    ...dex,
    percent: totalToken0Size ? dex.token0Size / totalToken0Size : 0,
  }));
}

export const getSpotXAxisTickFormatter = (timestamp: number, index: number, interval: SPOT_KLINE_INTERVAL): string => {
  const date = new Date(timestamp);

  switch (interval) {
    case SPOT_KLINE_INTERVAL.H_1:
      // Format: HH:MM
      return date.toLocaleTimeString('default', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

    case SPOT_KLINE_INTERVAL.D_1:
      // For index 3, show MM-DD, otherwise show HH:MM
      if (index === 3) {
        return date
          .toLocaleDateString('default', {
            month: '2-digit',
            day: '2-digit',
          })
          .replace('/', '-');
      }
      return date.toLocaleTimeString('default', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

    case SPOT_KLINE_INTERVAL.W_1:
      // For index 2, show MM-DD, otherwise show DD
      if (index === 2) {
        return date
          .toLocaleDateString('default', {
            month: '2-digit',
            day: '2-digit',
          })
          .replace('/', '-');
      }
      return date.toLocaleDateString('default', { day: '2-digit' });

    default:
      return '';
  }
};
export const getSpotXAxisTicks = (startTime: number, endTime: number, interval: SPOT_KLINE_INTERVAL): number[] => {
  const ticks = [];
  let currentTick = startTime;
  const incr = SPOT_KLINE_INTERVAL_TICK_GAP[interval];
  while (currentTick < endTime) {
    currentTick = currentTick + incr;
    if (currentTick > endTime) {
      currentTick = endTime;
    }
    ticks.push(currentTick);
  }
  return ticks;
};

export const getSpotTokenList = (chainId: number) => {
  const tokenList = queryClient.getQueryData<TokenInfo[]>(QUERY_KEYS.SPOT.TOKEN_LIST(chainId));
  if (!tokenList) return [];
  return tokenList;
};

export const getSearchRanking = (search: string, symbol: string): number => {
  const symbolIndex = symbol.toLowerCase().indexOf(search.trim().toLowerCase());
  return symbolIndex;
};
export const bothNative = (token1: TokenInfo, token2: TokenInfo): boolean => {
  const native = _.get(DAPP_CHAIN_CONFIGS, [token1.chainId]).nativeToken;
  const wrappedNative = _.get(DAPP_CHAIN_CONFIGS, [token1.chainId]).wrappedNativeToken;
  return (
    (token1.address === native.address && token2.address === wrappedNative.address) ||
    (token1.address === wrappedNative.address && token2.address === native.address)
  );
};

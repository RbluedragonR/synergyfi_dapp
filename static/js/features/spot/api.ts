import { getSpotApiUrl } from '@/constants/spot';
import { ISpotKlinePoint, ISpotOrderbook, ISpotOrderbookData, ISpotPairPrice, ISpotPoolsData } from '@/types/spot';
import { TokenInfo } from '@/types/token';
import { axiosGet } from '@/utils/axios';
import { getPoolsWithPercent } from '@/utils/spot';
import { Context } from '@derivation-tech/context';
import { OrderHistory } from '@synfutures/sdks-aggregator-datasource';
import { TokenInfoInSpot } from './types';
export const getSpotPools = async (chainId: number, token0: string | undefined, token1: string | undefined) => {
  const res = await axiosGet({
    domain: 'https://api.synfutures.com',
    url: getSpotApiUrl('pools'),
    config: {
      params: { chainId, token0, token1 },
    },
  });
  const data = res?.data?.data as ISpotPoolsData | undefined;
  if (data) {
    return data.pools;
  }

  return null;
};

export const getSpotPairsKlineData = async (
  chainId: number | undefined,
  token0: string | undefined,
  token1: string | undefined,
  interval: string,
): Promise<ISpotKlinePoint[] | null> => {
  const res = await axiosGet({
    domain: 'https://api.synfutures.com',
    url: getSpotApiUrl('kline'),
    config: {
      params: { chainId, token0, token1, interval },
    },
  });
  return res?.data?.data || null;
};

export const getSpotOrderBookDepth = async (
  chainId: number | undefined,
  token0: string | undefined,
  token1: string | undefined,
  stepRatio: number,
): Promise<ISpotOrderbook> => {
  const res = await axiosGet({
    domain: 'https://api.synfutures.com',
    url: getSpotApiUrl('depth'),
    config: {
      params: { chainId, token0, token1, stepRatio },
    },
  });
  if (res?.data?.data === null) {
    return { isMultiple: true, midPrice: 0, left: [], right: [] };
  }
  return {
    isMultiple: false,
    ...res?.data?.data,
    left: res?.data?.data.left.map((item: ISpotOrderbookData) => ({
      ...item,
      dexes: getPoolsWithPercent(item.dexes),
    })),
    right: res?.data?.data.right.map((item: ISpotOrderbookData) => ({
      ...item,
      dexes: getPoolsWithPercent(item.dexes),
    })),
  };
};

export const getSpotPairPrice = async (
  chainId: number | undefined,
  token0: string | undefined,
  token1: string | undefined,
): Promise<ISpotPairPrice | null> => {
  const res = await axiosGet({
    domain: 'https://api.synfutures.com',
    url: getSpotApiUrl('price'),
    config: { params: { token0, token1, chainId } },
  });

  return res?.data?.data || null;
};
export const getSpotTokens = async (
  chainId: number | undefined,
  selectedToken?: string | undefined,
): Promise<TokenInfoInSpot[] | undefined> => {
  const res = await axiosGet({
    domain: 'https://api.synfutures.com',
    url: getSpotApiUrl('token-list'),
    config: selectedToken ? { params: { chainId, selectedToken } } : { params: { chainId } },
  });

  const tokenList: TokenInfo[] | undefined = res?.data?.data.tokenList.map((token: TokenInfo) => ({
    ...token,
    chainId,
    address: token.address.toLowerCase(),
  }));

  const tokenSymbols = tokenList?.map((token) => token.symbol);
  const duplicateSymbols = tokenSymbols?.filter((symbol, index) => tokenSymbols.indexOf(symbol) !== index);

  return tokenList?.map((token) => ({
    ...token,
    isSymbolDuplicated: duplicateSymbols?.includes(token.symbol) || false,
  }));
};
export const getSpotHistory = async (user: string, sdk: Context): Promise<OrderHistory[]> => {
  const res = await sdk.aggregatorDataSource.getOrderHistory({ user });
  return res.orderHistory;
};

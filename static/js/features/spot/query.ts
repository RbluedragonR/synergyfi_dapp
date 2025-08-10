import { QUERY_KEYS } from '@/constants/query';
import { SPOT_DETAIL_POLLING_INTERVAL, SPOT_KLINE_INTERVAL, SPOT_SIMULATION_TIME_OUT } from '@/constants/spot';
import SentryService from '@/entities/SentryService';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useUserAddr } from '@/hooks/web3/useChain';
import { ISimulationResult } from '@/types/spot';
import { bothNative } from '@/utils/spot';
import { wrapNativeAddress } from '@/utils/token';
import { perToTenThousands } from '@/utils/trade';
import { Context } from '@derivation-tech/context';
import { SimulateMultiSwapResult } from '@synfutures/sdks-aggregator';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { parseUnits } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { useChainId } from 'wagmi';
import { useNativeToken } from '../chain/hook';
import { useGlobalConfig } from '../global/hooks';
import { useSDK } from '../web3/hook';
import {
  getSpotHistory,
  getSpotOrderBookDepth,
  getSpotPairPrice,
  getSpotPairsKlineData,
  getSpotPools,
  getSpotTokens,
} from './api';
import { useSpotState } from './store';

export const useSpotPools = (chainId: number | undefined, token0: string | undefined, token1: string | undefined) => {
  token0 = wrapNativeAddress(token0, chainId);
  token1 = wrapNativeAddress(token1, chainId);
  const userAddr = useUserAddr();
  const queryReturn = useQuery({
    queryKey: QUERY_KEYS.SPOT.POOLS(chainId, token0, token1),
    queryFn: async () => (chainId ? getSpotPools(chainId, token0, token1) : null),
    enabled: chainId !== undefined && token0 !== undefined && token1 !== undefined && !!userAddr,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    gcTime: 10 * 1000 + 60 * 1000,
    //initialData: getSpotPoolsWithAnchorTokenPairData(mockSpotPoolsResponseData),
  });
  return useMemo(() => {
    return queryReturn;
  }, [queryReturn]);
};

export const useSpotTokens = ({
  chainId,
  includeNativeToken = false,
}: {
  chainId: number | undefined;
  includeNativeToken?: boolean;
}) => {
  const nativeToken = useNativeToken(chainId);
  const queryReturn = useQuery({
    queryKey: QUERY_KEYS.SPOT.TOKEN_LIST(chainId),
    queryFn: async () => (chainId ? getSpotTokens(chainId) : null),
    enabled: chainId !== undefined,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    gcTime: 60 * 1000 + 60 * 1000,
  });
  const isNativeTokenSymbolDuplicated =
    queryReturn.data?.some((token) => token.symbol === nativeToken?.symbol) || false;

  return useMemo(() => {
    return {
      ...queryReturn,
      data:
        includeNativeToken && nativeToken
          ? queryReturn.data?.concat({ ...nativeToken, isSymbolDuplicated: isNativeTokenSymbolDuplicated })
          : queryReturn.data,
    };
  }, [includeNativeToken, isNativeTokenSymbolDuplicated, nativeToken, queryReturn]);
};

export const useSpotKlinePoints = (
  chainId: number | undefined,
  token0: string | undefined,
  token1: string | undefined,
  interval: SPOT_KLINE_INTERVAL,
) => {
  token0 = wrapNativeAddress(token0, chainId);
  token1 = wrapNativeAddress(token1, chainId);
  const queryReturn = useQuery({
    queryKey: QUERY_KEYS.SPOT.KLINE(chainId, token0, token1, interval),
    queryFn: async () => getSpotPairsKlineData(chainId, token0, token1, interval),
    enabled: chainId !== undefined && token0 !== undefined && token1 !== undefined,
    refetchInterval: 1 * 60 * 1000,
    staleTime: 1 * 60 * 1000,
    gcTime: 1 * 60 * 1000 + 60 * 1000,
  });
  return useMemo(() => {
    return queryReturn;
  }, [queryReturn]);
};

export const useSpotOrderBookDepth = (
  chainId: number | undefined,
  token0: string | undefined,
  token1: string | undefined,
  stepRatio: number,
) => {
  token0 = wrapNativeAddress(token0, chainId);
  token1 = wrapNativeAddress(token1, chainId);
  const queryReturn = useQuery({
    queryKey: QUERY_KEYS.SPOT.DEPTH(chainId, token0, token1, stepRatio),
    queryFn: async () => (chainId ? getSpotOrderBookDepth(chainId, token0, token1, stepRatio) : null),
    enabled: chainId !== undefined && token0 !== undefined && token1 !== undefined,
    refetchInterval: 10 * 1000,
    staleTime: 10 * 1000,
    gcTime: 10 * 1000 + 60 * 1000,
    //initialData: mockData2,
  });
  return useMemo(() => {
    return queryReturn;
  }, [queryReturn]);
};

export const useSpotPairPrice = (
  chainId: number | undefined,
  token0: string | undefined,
  token1: string | undefined,
) => {
  token0 = wrapNativeAddress(token0, chainId);
  token1 = wrapNativeAddress(token1, chainId);
  const queryReturn = useQuery({
    queryKey: QUERY_KEYS.SPOT.PRICE(chainId, token0, token1),
    queryFn: async () => (chainId ? getSpotPairPrice(chainId, token0, token1) : null),
    enabled: chainId !== undefined && token0 !== undefined && token1 !== undefined,
    refetchInterval: 1 * 60 * 1000,
    staleTime: 1 * 60 * 1000,
    gcTime: 1 * 60 * 1000 + 60 * 1000,
  });
  return useMemo(() => {
    const { data, ...others } = queryReturn;
    return {
      ...others,
      data: data
        ? {
            price: WrappedBigNumber.from(data.price),
            _24hChanged: WrappedBigNumber.from(data._24hChanged),
            _24hHigh: WrappedBigNumber.from(data._24hHigh),
            _24hLow: WrappedBigNumber.from(data._24hLow),
            _24hVolumeToken0: WrappedBigNumber.from(data._24hVolumeToken0),
            _24hVolumeToken1: WrappedBigNumber.from(data._24hVolumeToken1),
          }
        : data,
    };
  }, [queryReturn]);
};

export const useSpotHistory = (user: string | undefined, sdk: Context | undefined, chainId: number | undefined) => {
  const { newTxHashForFetchingHistory: newTransactionHashForFetchingHistory } = useSpotState();
  const queryReturn = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.SPOT.HISTORY(user, chainId),
    queryFn: async () => (user && sdk ? getSpotHistory(user, sdk) : []),
    enabled: !!user && sdk !== undefined,
    refetchInterval: ({ state }) => {
      if (newTransactionHashForFetchingHistory === null) {
        return false;
      }
      const newTxInHistory = !!state.data?.find(
        (item) => item.transactionHash === newTransactionHashForFetchingHistory,
      );
      return newTxInHistory ? false : 3 * 1000;
    },
  });
  return useMemo(() => {
    return queryReturn;
  }, [queryReturn]);
};

export const useSimulateSwap = (): UseQueryResult<ISimulationResult | null> => {
  const { sellAmount: amount, token1: buyToken, token0: sellToken, swapping } = useSpotState();
  const chainId = useChainId();
  const sdk = useSDK(chainId);
  const userAddr = useUserAddr();
  const { slippage } = useGlobalConfig(chainId);
  const { poolsToExclude } = useSpotState();
  const queryReturn = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.SPOT.SIMULATE_SWAP(chainId, userAddr, amount, sellToken?.address, buyToken?.address),
    queryFn: async () => {
      if (WrappedBigNumber.from(amount || 0).eq(0)) {
        return null;
      }
      if (bothNative(sellToken, buyToken)) {
        return {
          nativeSwap: {
            priceImpact: 0,
            minReceivedAmount: parseUnits(amount, buyToken.decimals),
          },
        };
      }

      if (amount && buyToken && sellToken && sdk && userAddr) {
        let timeoutId: NodeJS.Timeout | undefined;
        // ETH-USDC pair ,the gas fee is too high, so we use direct swap
        const isETHToUSDC =
          (['ETH', 'WETH'].includes(sellToken?.symbol) && buyToken?.symbol === 'USDC') ||
          (sellToken?.symbol === 'USDC' && ['ETH', 'WETH'].includes(buyToken?.symbol));

        try {
          const simulatePromise = sdk.aggregator.simulateMultiSwap({
            fromTokenAddress: sellToken.address,
            toTokenAddress: buyToken.address,
            fromTokenDecimals: sellToken.decimals,
            toTokenDecimals: buyToken.decimals,
            fromAmount: parseUnits(amount, sellToken.decimals),
            excludePoolTypes: poolsToExclude,
            isDirect: isETHToUSDC,
            slippageInBps: perToTenThousands(Number(slippage)),
          });

          const timeoutPromise = new Promise((resolve) => {
            timeoutId = setTimeout(() => {
              resolve(false);
            }, SPOT_SIMULATION_TIME_OUT);
          });

          const result = await Promise.race([simulatePromise, timeoutPromise]);
          if (timeoutId) clearTimeout(timeoutId);
          return result ? { data: result as SimulateMultiSwapResult } : { timeout: true };
        } catch (e) {
          console.error('useSimulateSwap:sdk.aggregator.simulateMultiSwap', e);
          SentryService.captureException(e, {
            name: 'useSimulateSwap:sdk.aggregator.simulateMultiSwap',
            userAddr,
            amount,
            sellToken,
            buyToken,
            chainId,
            poolsToExclude,
            slippage,
          });
          if (timeoutId) clearTimeout(timeoutId);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return { timeout: true };
        }
      } else {
        return null;
      }
    },
    refetchInterval: SPOT_DETAIL_POLLING_INTERVAL,
    enabled: !!userAddr && sdk !== undefined && Number(amount) > 0 && !swapping,
  });
  return useMemo(() => {
    return queryReturn;
  }, [queryReturn]);
};

export const useSimulateBestRoute = () => {
  const { sellAmount: amount, token1: buyToken, token0: sellToken, swapping } = useSpotState();

  const chainId = useChainId();
  const sdk = useSDK(chainId);
  const userAddr = useUserAddr();
  const { poolsToExclude } = useSpotState();
  const queryReturn = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.SPOT.SIMULATE_BEST_ROUTE(chainId, userAddr, amount, sellToken?.address, buyToken?.address),
    queryFn: async () => {
      if (WrappedBigNumber.from(amount || 0).eq(0)) {
        return null;
      }
      if (bothNative(sellToken, buyToken)) {
        return null;
      }
      if (sellToken && buyToken && sdk && amount) {
        // ETH-USDC pair ,the gas fee is too high, so we use direct swap
        const isETHToUSDC =
          (['ETH', 'WETH'].includes(sellToken?.symbol) && buyToken?.symbol === 'USDC') ||
          (sellToken?.symbol === 'USDC' && ['ETH', 'WETH'].includes(buyToken?.symbol));

        const route = await sdk.aggregator.querySplitRoute({
          fromTokenAddress: sellToken.address,
          toTokenAddress: buyToken.address,
          fromAmount: parseUnits(amount, sellToken?.decimals),
          excludePoolTypes: poolsToExclude,
          isDirect: isETHToUSDC,
        });
        return route;
      } else {
        return null;
      }
    },
    refetchInterval: SPOT_DETAIL_POLLING_INTERVAL,
    enabled: !!userAddr && sdk !== undefined && Number(amount) > 0 && !swapping,
  });
  return useMemo(() => {
    return queryReturn;
  }, [queryReturn]);
};

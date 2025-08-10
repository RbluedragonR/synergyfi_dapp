import _ from 'lodash';
import { useEffect, useMemo } from 'react';

import { CHAIN_ID } from '@/constants/chain';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedInstrument } from '@/entities/WrappedInstrument';
import { useAppSelector } from '@/hooks';
import { IMetaInstrument } from '@/types/pair';
import { ISpotState } from '@/types/spot';

import { QUERY_KEYS } from '@/constants/query';
import { WrappedPair } from '@/entities/WrappedPair';
import useSocket from '@/hooks/useSocket';
import { queryClient } from '@/pages/App';
import { IFuturesOrderBook } from '@/types/futures';
import { MESSAGE_TYPE, SUBSCRIBE_TYPE, UNSUBSCRIBE_TYPE } from '@/types/socket';
import { transformData } from '@/utils/chart';
import { transformToMetaFutures, transformToMetaPair } from '@/utils/transform/pair';
import { getPairId } from '@/utils/transform/transformId';
import { FundingChartInterval, KlineInterval } from '@synfutures/sdks-perp-datasource';
import { useTokenPrices } from '../global/query';
import { useMarketList } from '../market/hooks';
import { useCurrentNewPairFromUrl } from '../pair/hook';
import { useStepRatio } from '../trade/hooks';
import {
  useFetchFuturesDepthChart,
  useFetchFuturesFundingChart,
  useFetchFuturesInstrument,
  useFetchFuturesKlineChart,
  useFetchFuturesOrderbook,
  useFetchFuturesPairInfo,
} from './query';
import { selectChainMetaFutures, selectInstrumentSpotRawPrice, selectInstrumentSpotState } from './slice';

export function useMetaFuturesMap(chainId: CHAIN_ID | undefined): { [instrumentId: string]: IMetaInstrument } {
  const chainMetaInstruments = useAppSelector(selectChainMetaFutures(chainId));

  return useMemo(() => {
    return chainMetaInstruments || {};
  }, [chainMetaInstruments]);
}

export function useWrappedInstrument(
  chainId: CHAIN_ID | undefined,
  instrumentId: string | undefined,
): WrappedInstrument | undefined {
  const instrumentMap = useMetaFuturesMap(chainId);
  return useMemo(() => {
    if (!chainId || !instrumentId) return undefined;
    const origin = instrumentMap[instrumentId];
    if (origin) {
      const futures = WrappedInstrument.getInstance(origin.id, chainId);
      if (!futures) {
        return WrappedInstrument.wrapInstance({ metaFutures: origin, chainId });
      } else {
        futures.fillField(origin);
      }
      return futures;
    }
    return undefined;
  }, [chainId, instrumentMap, instrumentId]);
}

export function useWrappedInstrumentMap(chainId: CHAIN_ID | undefined): { [instrumentId: string]: WrappedInstrument } {
  const instrumentsMap = useMetaFuturesMap(chainId);
  const { data: tokenPriceMap } = useTokenPrices({ chainId });

  return useMemo(() => {
    if (!chainId) return {};
    return _.mapValues(instrumentsMap, (origin) => {
      const futures = WrappedInstrument.getInstance(origin.id, chainId);
      if (!futures) {
        return WrappedInstrument.wrapInstance({ metaFutures: origin, chainId });
      } else {
        futures.fillField(origin);
      }
      if (tokenPriceMap) {
        const quote = futures.quoteToken;
        const quotePriceInfo = tokenPriceMap[quote.address];
        if (quotePriceInfo) {
          futures.setQuotePrice(quotePriceInfo);
        }
      }
      return futures;
    });
  }, [chainId, instrumentsMap, tokenPriceMap]);
}

export function useInstrumentSpotState(
  chainId: CHAIN_ID | undefined,
  instrumentAddr: string | undefined,
): ISpotState | undefined {
  const instrumentSpotState = useAppSelector(selectInstrumentSpotState(chainId, instrumentAddr));

  return useMemo(() => {
    if (instrumentSpotState) return instrumentSpotState.data;
  }, [instrumentSpotState]);
}

export function useInstrumentSpotRawPrice(
  chainId: CHAIN_ID | undefined,
  instrumentAddr: string | undefined,
): WrappedBigNumber | undefined {
  const instrumentSpotPriceInfo = useAppSelector(selectInstrumentSpotRawPrice(chainId, instrumentAddr));

  return useMemo(() => {
    if (instrumentSpotPriceInfo) return WrappedBigNumber.from(instrumentSpotPriceInfo.data);
  }, [instrumentSpotPriceInfo]);
}

export const useMarketPairInfo = (
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
  enabled = true,
) => {
  const { marketPairList } = useMarketList(chainId ? [chainId] : undefined);
  const { data: pairInfo } = useFetchFuturesPairInfo(chainId, instrumentAddr, expiry, enabled);

  return useMemo(() => {
    if (pairInfo) {
      return pairInfo;
    }
    if (marketPairList && instrumentAddr && expiry) {
      const pair = marketPairList.find((p) => p.instrumentAddress === instrumentAddr && p.expiry === expiry);
      return pair;
    }
    return undefined;
  }, [expiry, instrumentAddr, marketPairList, pairInfo]);
};

export const useIsFetchedPairInfo = (
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
  includeNewPair = false,
) => {
  const { isFetched } = useFetchFuturesPairInfo(chainId, instrumentAddr, expiry);

  const creativeNewPair = useCurrentNewPairFromUrl(chainId);
  return useMemo(() => {
    if (isFetched) {
      return isFetched;
    }

    if (includeNewPair && creativeNewPair?.id) return true;
    return false;
  }, [creativeNewPair?.id, includeNewPair, isFetched]);
};

export function useMarketWrappedInstrument(chainId: number | undefined, instrumentAddr: string | undefined) {
  const { data: marketInstrument } = useFetchFuturesInstrument(chainId, instrumentAddr);
  return useMemo(() => {
    if (marketInstrument && chainId) {
      const metaFutures = transformToMetaFutures(marketInstrument, chainId);
      let wrappedInstrument = WrappedInstrument.getInstance(metaFutures.id, chainId);
      if (wrappedInstrument) wrappedInstrument.fillField(metaFutures);
      else wrappedInstrument = WrappedInstrument.wrapInstance({ metaFutures: metaFutures, chainId: chainId });
      if (wrappedInstrument && marketInstrument?.amms) {
        marketInstrument.amms.forEach((amm) => {
          const pairId = getPairId(amm.instrumentAddr, amm.expiry);
          let pair = WrappedPair.getInstance(pairId, chainId);
          const metaPair = transformToMetaPair({ amm, futures: marketInstrument });
          if (!pair) {
            if (wrappedInstrument) {
              pair = WrappedPair.wrapInstance({
                metaPair: metaPair,
                rootInstrument: wrappedInstrument,
              });
              pair && wrappedInstrument?.connectPair(pair.expiry, pair);
            }
          } else {
            pair.fillField(metaPair);
          }
        });
      }
      return wrappedInstrument;
    }
  }, [chainId, marketInstrument]);
}

export const useIsFetchedInstrument = (chainId: number | undefined, instrumentAddr: string | undefined) => {
  const { isFetched } = useFetchFuturesInstrument(chainId, instrumentAddr);

  return isFetched;
};

/**
 * A hook that subscribes to market pair info changes via websocket
 * Listens for orderBook, depth, and instrument updates and invalidates corresponding queries
 *
 * @param chainId - The blockchain network ID
 * @param instrumentAddr - The address of the futures instrument
 */
export function useWatchMarketPairInfoChange(
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
): void {
  const { socket } = useSocket();
  const stepRatio = useStepRatio(chainId);

  useEffect(() => {
    if (!socket || !chainId || !instrumentAddr || !expiry) return;
    socket.emit(SUBSCRIBE_TYPE.PAIR_INFO, { chainId: chainId, address: instrumentAddr });

    socket.on(MESSAGE_TYPE.pairInfo, (data) => {
      console.record('event', MESSAGE_TYPE.pairInfo, data.type, data);
      if (data.type === 'orderBook') {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.FUTURES.ORDER_BOOK(chainId, instrumentAddr, expiry, stepRatio),
        });
      } else if (data.type === 'depth') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUTURES.DEPTH_CHARTS(chainId, instrumentAddr, expiry) });
      } else if (data.type === 'instrument') {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUTURES.INSTRUMENT(chainId, instrumentAddr) });
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.FUTURES.PAIR_INFO(chainId, instrumentAddr, expiry),
          });
        }, 3000);
      } else if (data.type === 'info') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUTURES.INSTRUMENT(chainId, instrumentAddr) });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.FUTURES.PAIR_INFO(chainId, instrumentAddr, expiry),
        });
      }
    });

    return () => {
      socket.off(MESSAGE_TYPE.pairInfo);
      socket.emit(UNSUBSCRIBE_TYPE.PAIR_INFO, { chainId: chainId, address: instrumentAddr });
    };
  }, [chainId, expiry, instrumentAddr, socket]);
}

export function useFuturesOrderBookWithStepRatio(
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
  stepRatio: number | undefined,
) {
  const { data: orderBook } = useFetchFuturesOrderbook(chainId, instrumentAddr, expiry, stepRatio);
  return useMemo(() => {
    if (orderBook && stepRatio) {
      return orderBook[stepRatio] ?? { left: [], right: [] };
    }
    return { left: [], right: [] } as IFuturesOrderBook;
  }, [orderBook, stepRatio]);
}

export function useIsFetchedFuturesOrderBook(
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
  stepRatio: number | undefined,
) {
  const { isFetched } = useFetchFuturesOrderbook(chainId, instrumentAddr, expiry, stepRatio);

  return isFetched;
}

export function useFuturesDepthChartsData(
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
) {
  const { data: depth } = useFetchFuturesDepthChart(chainId, instrumentAddr, expiry);

  return useMemo(() => {
    if (depth) {
      // const [left, right] = pair.isInverse ? [depth.right, depth.left] : [depth.left, depth.right];
      const [left, right] = [depth.left, depth.right];
      const leftReduced = transformData(left);
      const rightReduced = transformData(right);
      return {
        ...depth,
        left: leftReduced,
        right: rightReduced,
      };
    }
  }, [depth]);
}

export function useIsFetchedFuturesDepthCharts(
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
) {
  const { isFetched } = useFetchFuturesDepthChart(chainId, instrumentAddr, expiry);

  return isFetched;
}

export function useFuturesFundingChartsData(
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
  chartDuration: FundingChartInterval | undefined,
) {
  const { data: funding } = useFetchFuturesFundingChart(chainId, instrumentAddr, expiry, chartDuration);

  return useMemo(() => {
    if (funding) {
      return funding;
    }
  }, [funding]);
}

export function useIsFetchedFuturesFundingCharts(
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
  chartDuration: FundingChartInterval | undefined,
) {
  const { isFetched } = useFetchFuturesFundingChart(chainId, instrumentAddr, expiry, chartDuration);

  return isFetched;
}

export function useFuturesKlineChartsData({
  chainId,
  instrumentAddr,
  expiry,
  chartDuration,
  timeEnd,
}: {
  chainId?: number;
  instrumentAddr?: string;
  expiry?: number;
  chartDuration?: KlineInterval;
  timeEnd?: number;
}) {
  const { data: funding } = useFetchFuturesKlineChart({
    chainId,
    instrumentAddr,
    expiry,
    chartDuration,
    timeEnd,
  });
  console.log('🚀 ~ funding:', funding);

  return useMemo(() => {
    if (funding) {
      return funding;
    }
  }, [funding]);
}

export function useIsFetchedFuturesKlineCharts({
  chainId,
  instrumentAddr,
  expiry,
  chartDuration,
  timeEnd,
}: {
  chainId?: number;
  instrumentAddr?: string;
  expiry?: number;
  chartDuration?: KlineInterval;
  timeEnd?: number;
}) {
  const { isFetched } = useFetchFuturesKlineChart({
    chainId,
    instrumentAddr,
    expiry,
    chartDuration,
    timeEnd,
  });

  return isFetched;
}

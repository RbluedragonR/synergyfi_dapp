import { OrderStatus } from '@synfutures/sdks-perp-datasource';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';

import { FETCHING_STATUS } from '@/constants';
import { HISTORY_RANGE } from '@/constants/history';
import { WrappedPair } from '@/entities/WrappedPair';
import { useAppSelector } from '@/hooks';
import { IFundingHistory, ILiquidityHistory, IOrderHistory, ITradeHistory, ITransferHistory } from '@/types/graph';
import { getPairId } from '@/utils/transform/transformId';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { QUERY_KEYS } from '@/constants/query';
import { queryClient } from '@/pages/App';
import { DailyVolumeDetail } from '@/types/portfolio';
import { isNativeTokenAddr } from '@/utils/token';
import { NATIVE_TOKEN_ADDRESS } from '@synfutures/sdks-perp';
import { useMarginTokenInfoMap } from '../chain/hook';
import {
  useAllPairBasicInfoByGraph,
  useInfiniteAccountBalanceHistoryQuery,
  useInfiniteFundingHistoryQuery,
  useInfiniteLiquidityHistoryQuery,
  useInfiniteOrdersHistoryQuery,
  useInfiniteTransferHistoryQuery,
  useInfiniteVirtualTradeHistoryQuery,
} from './query';
import { selectChainDailyVolumeDetails, selectChainDailyVolumeDetailsStatus, selectHistoryRange } from './slice';

export function useInfiniteVirtualTradeHistory({
  chainId,
  userAddr,
  pair = 'all',
  timeRange = HISTORY_RANGE.ALL,
}: {
  chainId: number | undefined;
  userAddr: string | undefined;
  pair?: WrappedPair | 'all';
  timeRange?: HISTORY_RANGE;
}) {
  const args = useMemo(
    () => ({
      chainId,
      userAddr,
      timeRange,
      instrumentAddr: pair === 'all' ? undefined : pair.metaPair.instrumentId,
      expiry: pair === 'all' ? undefined : pair.expiry,
    }),
    [chainId, pair, userAddr, timeRange],
  );
  const queryState = useInfiniteVirtualTradeHistoryQuery(args);
  const { data: pairBasicInfos } = useAllPairBasicInfoByGraph(chainId);
  const refreshData = useCallback(() => {
    queryClient.resetQueries({
      queryKey: QUERY_KEYS.GRAPH.VIRTUAL_TRADE_HISTORY(args),
    });
  }, [args]);

  const histories: ITradeHistory[] = useMemo(() => {
    const { data } = queryState;
    const tradeHistoryListOrigin = data?.pages.flat();
    if (tradeHistoryListOrigin?.length && pairBasicInfos) {
      return _.orderBy(
        tradeHistoryListOrigin.map((trade) => {
          const thisPair = pair === 'all' ? pairBasicInfos[getPairId(trade.instrumentAddr, trade.expiry)] : pair;
          if (!thisPair) console.log(`pair is undefined for trade history ${trade.instrumentAddr} `, trade);

          return { ..._.cloneDeep(trade), pair: thisPair };
        }),
        ['timestamp'],
        ['desc'],
      );
    }
    return tradeHistoryListOrigin || [];
  }, [pair, pairBasicInfos, queryState]);

  return {
    queryState,
    histories,
    refreshData,
  };
}

export function useInfiniteOrdersHistory({
  chainId,
  userAddr,
  pair = 'all',
  timeRange = HISTORY_RANGE.ALL,
}: {
  chainId: number | undefined;
  userAddr: string | undefined;
  pair?: WrappedPair | 'all';
  timeRange?: HISTORY_RANGE;
}) {
  const args = useMemo(
    () => ({
      chainId,
      userAddr,
      timeRange,
      instrumentAddr: pair === 'all' ? undefined : pair.metaPair.instrumentId,
      expiry: pair === 'all' ? undefined : pair.expiry,
    }),
    [chainId, pair, userAddr, timeRange],
  );

  const queryState = useInfiniteOrdersHistoryQuery(args);
  const { data: pairBasicInfos } = useAllPairBasicInfoByGraph(chainId);

  const refreshData = useCallback(() => {
    queryClient.resetQueries({
      queryKey: QUERY_KEYS.GRAPH.ORDERS_HISTORY(args),
    });
  }, [args]);

  const histories: IOrderHistory[] = useMemo(() => {
    const { data } = queryState;
    const orderHistoryListOrigin = data?.pages.flat();
    if (orderHistoryListOrigin?.length && pairBasicInfos) {
      return orderHistoryListOrigin.map((order) => {
        const thisPair = pair === 'all' ? pairBasicInfos[getPairId(order.instrumentAddr, order.expiry)] : pair;
        if (!thisPair) console.log(`pair is undefined for order history ${order.instrumentAddr} `, order);

        let txHash = order.placeTxHash;
        if (order.status === OrderStatus.FILLED) {
          txHash = order.fillTxHash || '';
        } else if (order.status === OrderStatus.CANCELLED) {
          txHash = order.cancelTxHash || '';
        }

        return { ...order, pair: thisPair, txHash };
      });
    }
    return [];
  }, [pair, pairBasicInfos, queryState]);

  return {
    queryState,
    histories: _.orderBy(histories, ['createdTimestamp', 'timestamp'], ['desc', 'desc']),
    refreshData,
  };
}

export function useInfiniteFundingHistory({
  chainId,
  userAddr,
  pair = 'all',
  timeRange = HISTORY_RANGE.ALL,
}: {
  chainId: number | undefined;
  userAddr: string | undefined;
  pair?: WrappedPair | 'all';
  timeRange?: HISTORY_RANGE;
}) {
  const args = useMemo(
    () => ({
      chainId,
      userAddr,
      timeRange,
      instrumentAddr: pair === 'all' ? undefined : pair.metaPair.instrumentId,
      expiry: pair === 'all' ? undefined : pair.expiry,
    }),
    [chainId, pair, userAddr, timeRange],
  );

  const queryState = useInfiniteFundingHistoryQuery(args);
  const { data: pairBasicInfos } = useAllPairBasicInfoByGraph(chainId);

  const refreshData = useCallback(() => {
    queryClient.resetQueries({
      queryKey: QUERY_KEYS.GRAPH.FUNDING_HISTORY(args),
    });
  }, [args]);

  const histories: IFundingHistory[] = useMemo(() => {
    const fundingHistoryListOrigin = queryState.data?.pages.flat() || [];
    return fundingHistoryListOrigin.map((history) => ({
      ...history,
      pair: pair === 'all' ? pairBasicInfos?.[getPairId(history.instrumentAddr, history.expiry)] : pair,
    }));
  }, [pair, pairBasicInfos, queryState.data]);

  return {
    queryState,
    histories: _.orderBy(histories, ['timestamp'], ['desc']),
    refreshData,
  };
}

export function useInfiniteTransferHistory({
  chainId,
  userAddr,
  pair = 'all',
  timeRange = HISTORY_RANGE.ALL,
}: {
  chainId: number | undefined;
  userAddr: string | undefined;
  pair?: WrappedPair | 'all';
  timeRange?: HISTORY_RANGE;
}) {
  const args = useMemo(
    () => ({
      chainId,
      userAddr,
      timeRange,
      instrumentAddr: pair === 'all' ? undefined : pair.metaPair.instrumentId,
      expiry: pair === 'all' ? undefined : pair.expiry,
    }),
    [chainId, pair, userAddr, timeRange],
  );

  const queryState = useInfiniteTransferHistoryQuery(args);
  const { data: pairBasicInfos } = useAllPairBasicInfoByGraph(chainId);

  const refreshData = useCallback(() => {
    queryClient.resetQueries({
      queryKey: QUERY_KEYS.GRAPH.TRANSFER_HISTORY(args),
    });
  }, [args]);

  const histories: ITransferHistory[] = useMemo(() => {
    const transferHistoryListOrigin = queryState.data?.pages.flat() || [];
    return transferHistoryListOrigin.map((history) => ({
      ...history,
      pair: pair === 'all' ? pairBasicInfos?.[getPairId(history.instrumentAddr, history.expiry)] : pair,
    }));
  }, [pair, pairBasicInfos, queryState.data]);

  return {
    queryState,
    histories: _.orderBy(histories, ['timestamp'], ['desc']),
    refreshData,
  };
}

export function useInfiniteLiquidityHistory({
  chainId,
  userAddr,
  pair = 'all',
  timeRange = HISTORY_RANGE.ALL,
}: {
  chainId: number | undefined;
  userAddr: string | undefined;
  pair?: WrappedPair | 'all';
  timeRange?: HISTORY_RANGE;
}) {
  const args = useMemo(
    () => ({
      chainId,
      userAddr,
      timeRange,
      instrumentAddr: pair === 'all' ? undefined : pair.metaPair.instrumentId,
      expiry: pair === 'all' ? undefined : pair.expiry,
    }),
    [chainId, pair, userAddr, timeRange],
  );

  const queryState = useInfiniteLiquidityHistoryQuery(args);
  const { data: pairBasicInfos } = useAllPairBasicInfoByGraph(chainId);

  const refreshData = useCallback(() => {
    queryClient.resetQueries({
      queryKey: QUERY_KEYS.GRAPH.LIQUIDITY_HISTORY(args),
    });
  }, [args]);

  const histories: ILiquidityHistory[] = useMemo(() => {
    const liquidityHistoryListOrigin = queryState.data?.pages.flat() || [];
    return liquidityHistoryListOrigin.map((history) => ({
      ...history,
      pair: pair === 'all' ? pairBasicInfos?.[getPairId(history.instrumentAddr, history.expiry)] : pair,
    }));
  }, [pair, pairBasicInfos, queryState.data]);

  return {
    queryState,
    histories: _.orderBy(histories, ['timestamp'], ['desc']),
    refreshData,
  };
}

export function useInfiniteAccountBalanceHistory({
  chainId,
  userAddr,
  timeRange = HISTORY_RANGE.ALL,
}: {
  chainId: number | undefined;
  userAddr: string | undefined;
  timeRange?: HISTORY_RANGE;
}) {
  const args = useMemo(
    () => ({
      chainId,
      userAddr,
      timeRange,
    }),
    [chainId, userAddr, timeRange],
  );
  const marginTokenMap = useMarginTokenInfoMap(chainId);
  const queryState = useInfiniteAccountBalanceHistoryQuery(args);

  const histories = useMemo(() => {
    const chainConfig = chainId && DAPP_CHAIN_CONFIGS[chainId];

    return (
      (chainConfig &&
        marginTokenMap &&
        _.orderBy(queryState.data?.pages.flat() || [], ['timestamp'], ['desc']).map((history) => {
          const quoteAddr = history.quoteAddr.toLowerCase();
          let quote = marginTokenMap[quoteAddr];
          if (
            (quoteAddr === NATIVE_TOKEN_ADDRESS.toLowerCase() || isNativeTokenAddr(quoteAddr)) &&
            chainConfig.wrappedNativeToken
          ) {
            quote = chainConfig.wrappedNativeToken;
          }
          return {
            ...history,
            timestamp: history.timestamp,
            // trader: event.args.trader,
            quoteAddr: quoteAddr,
            quote: quote,
            logIndex: history.logIndex,
            // amount: BigNumber.from(event.args.quantity),
            type: history.type,
            txHash: history.txHash,
            chainId,
          };
        })) ||
      []
    );
  }, [chainId, marginTokenMap, queryState.data]);
  const refreshData = useCallback(() => {
    queryClient.resetQueries({
      queryKey: QUERY_KEYS.GRAPH.ACCOUNT_BALANCE_HISTORY(args),
    });
  }, [args]);
  return {
    queryState,
    histories,
    refreshData,
  };
}

export function useHistoryRange(): HISTORY_RANGE {
  return useAppSelector(selectHistoryRange);
}

export function useDailyVolumeDetails(chainId: number | undefined, userAddr: string | undefined): DailyVolumeDetail[] {
  const dailyVolumeDetails = useAppSelector(selectChainDailyVolumeDetails(chainId, userAddr));
  return dailyVolumeDetails;
}

export function useDailyVolumeDetailsStatus(
  chainId: number | undefined,
  userAddr: string | undefined,
): FETCHING_STATUS {
  return useAppSelector(selectChainDailyVolumeDetailsStatus(chainId, userAddr));
}

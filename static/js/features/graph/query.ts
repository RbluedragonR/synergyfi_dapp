import { QUERY_KEYS } from '@/constants/query';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSDK } from '../web3/hook';
import {
  getAccountBalanceHistory,
  getAllPairBasicInfoByGraph,
  getFundingHistory,
  getLiquidityHistory,
  getOrdersHistory,
  getTransferHistory,
  getVirtualTradeHistory,
} from './api';

export const useAllPairBasicInfoByGraph = (chainId: number | undefined) => {
  const sdk = useSDK(chainId);
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.GRAPH.ALL_INSTRUMENTS_BASIC_INFO(chainId),
    queryFn: async () => getAllPairBasicInfoByGraph(chainId, sdk),
    enabled: chainId !== undefined && sdk !== undefined,
  });
};

export const useInfiniteVirtualTradeHistoryQuery = (
  args: Omit<Parameters<typeof getVirtualTradeHistory>[0], 'sdk' | 'page'>,
) => {
  const sdk = useSDK(args.chainId);
  return useInfiniteQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.GRAPH.VIRTUAL_TRADE_HISTORY(args),
    queryFn: async ({ pageParam = 0 }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return getVirtualTradeHistory({
        ...args,
        page: pageParam,
        sdk,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.length > 0 ? allPages?.length : undefined;
    },
    enabled: !!args.chainId && !!sdk && !!args.userAddr,
    initialPageParam: 0,
  });
};

export const useInfiniteOrdersHistoryQuery = (args: Omit<Parameters<typeof getOrdersHistory>[0], 'sdk' | 'page'>) => {
  const sdk = useSDK(args.chainId);
  return useInfiniteQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.GRAPH.ORDERS_HISTORY(args),
    queryFn: async ({ pageParam = 0 }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return getOrdersHistory({
        ...args,
        page: pageParam,
        sdk,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.length > 0 ? allPages?.length : undefined;
    },
    enabled: !!args.chainId && !!sdk && !!args.userAddr,
    initialPageParam: 0,
  });
};

export const useInfiniteFundingHistoryQuery = (args: Omit<Parameters<typeof getFundingHistory>[0], 'sdk' | 'page'>) => {
  const sdk = useSDK(args.chainId);
  return useInfiniteQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.GRAPH.FUNDING_HISTORY(args),
    queryFn: async ({ pageParam = 0 }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return getFundingHistory({
        ...args,
        page: pageParam,
        sdk,
      });
    },
    getNextPageParam: (lastPage, allPages) => (lastPage?.length ? allPages.length : undefined),
    enabled: !!args.chainId && !!sdk && !!args.userAddr,
    initialPageParam: 0,
  });
};

export const useInfiniteTransferHistoryQuery = (
  args: Omit<Parameters<typeof getTransferHistory>[0], 'sdk' | 'page'>,
) => {
  const sdk = useSDK(args.chainId);
  return useInfiniteQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.GRAPH.TRANSFER_HISTORY(args),
    queryFn: async ({ pageParam = 0 }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return getTransferHistory({
        ...args,
        page: pageParam,
        sdk,
      });
    },
    getNextPageParam: (lastPage, allPages) => (lastPage?.length ? allPages.length : undefined),
    enabled: !!args.chainId && !!sdk && !!args.userAddr,
    initialPageParam: 0,
  });
};

export const useInfiniteLiquidityHistoryQuery = (
  args: Omit<Parameters<typeof getLiquidityHistory>[0], 'sdk' | 'page'>,
) => {
  const sdk = useSDK(args.chainId);
  return useInfiniteQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.GRAPH.LIQUIDITY_HISTORY(args),
    queryFn: async ({ pageParam = 0 }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return getLiquidityHistory({
        ...args,
        page: pageParam,
        sdk,
      });
    },
    getNextPageParam: (lastPage, allPages) => (lastPage?.length ? allPages.length : undefined),
    enabled: !!args.chainId && !!sdk && !!args.userAddr,
    initialPageParam: 0,
  });
};

export const useInfiniteAccountBalanceHistoryQuery = (
  args: Omit<Parameters<typeof getAccountBalanceHistory>[0], 'sdk' | 'page'>,
) => {
  const sdk = useSDK(args.chainId);
  return useInfiniteQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.GRAPH.ACCOUNT_BALANCE_HISTORY(args),
    queryFn: async ({ pageParam = 0 }) => {
      if (!sdk) throw new Error('SDK not initialized');
      return getAccountBalanceHistory({
        ...args,
        page: pageParam,
        sdk,
      });
    },
    getNextPageParam: (lastPage, allPages) => (lastPage?.length ? allPages.length : undefined),
    enabled: !!args.chainId && !!sdk && !!args.userAddr,
    initialPageParam: 0,
  });
};

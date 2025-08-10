import { QUERY_KEYS } from '@/constants/query';
import { useQuery } from '@tanstack/react-query';
import { useConfigData } from '../config/hook';
import { fetchMarketBanners, fetchMarketCreativePairs, fetchMarketPairList, fetchMarketTrendInfo } from './api';

export const useFetchMarketPairList = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET.PAIR_LIST(),
    queryFn: async () => fetchMarketPairList(),
  });
};

export const useFetchMarketCreativePairList = () => {
  const { backendChainsConfig } = useConfigData();
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.MARKET.CREATIVE_PAIR_LIST(),
    queryFn: async () => fetchMarketCreativePairs(backendChainsConfig),
    // meta: { isPersist: true },
    enabled: !!backendChainsConfig,
  });
};

export const useFetchMarketTrendList = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET.TREND_LIST(),
    queryFn: async () => fetchMarketTrendInfo(),
  });
};

export const useFetchMarketBannerList = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MARKET.BANNER_LIST(),
    queryFn: async () => fetchMarketBanners(),
  });
};

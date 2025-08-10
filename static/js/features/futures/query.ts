import { QUERY_KEYS } from '@/constants/query';
import { IFuturesOrderBookAllSteps } from '@/types/futures';
import { FundingChartInterval, KlineInterval } from '@synfutures/sdks-perp-datasource';
import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../web3/hook';
import {
  fetchFuturesInstrument,
  fetchFuturesPairDepthChart,
  fetchFuturesPairFundingChart,
  fetchFuturesPairInfo,
  fetchFuturesPairKlineChart,
  fetchFuturesPairOrderBook,
  fetchInstrumentFromChain,
} from './api';

export const useFetchFuturesInstrument = (chainId: number | undefined, instrumentAddr: string | undefined) => {
  const sdk = useSDK(chainId);
  return useQuery({
    queryKey: QUERY_KEYS.FUTURES.INSTRUMENT(chainId, instrumentAddr),
    queryFn: async () => {
      // const apiResult = chainId && instrumentAddr && (await fetchFuturesInstrument(chainId, instrumentAddr));
      // if (!apiResult && sdk && instrumentAddr) {
      //   return fetchInstrumentFromChain(sdk, instrumentAddr);
      // }
      // return apiResult;

      if (chainId && instrumentAddr)
        try {
          // First try to get from API
          const apiResult = await fetchFuturesInstrument(chainId, instrumentAddr);
          return apiResult;
        } catch (apiError) {
          console.warn('API request failed, falling back to chain:', apiError);
          try {
            if (sdk) {
              // If API fails, fall back to chain request
              const chainResult = await fetchInstrumentFromChain(sdk, instrumentAddr);
              return chainResult;
            }
          } catch (chainError) {
            console.error('Both API and chain requests failed:', chainError);
            throw new Error('Failed to fetch instrument from both API and chain');
          }
        }
    },
    enabled: !!chainId && !!instrumentAddr,
  });
};

export const useFetchFuturesPairInfo = (
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
  enabled = true,
) => {
  // const { setMarketPairInfo } = useMarketPairInfoStore();
  const pairInfoRes = useQuery({
    queryKey: QUERY_KEYS.FUTURES.PAIR_INFO(chainId, instrumentAddr, expiry),
    queryFn: async () =>
      chainId && instrumentAddr && expiry && fetchFuturesPairInfo({ chainId, address: instrumentAddr, expiry }),
    enabled: !!chainId && !!instrumentAddr && !!expiry && enabled,
  });

  // useEffect(() => {
  //   if (pairInfoRes?.data) {
  //     setMarketPairInfo(pairInfoRes.data.chainId, pairInfoRes.data);
  //   }
  // }, [pairInfoRes.data, setMarketPairInfo]);

  return pairInfoRes;
};

export const useFetchFuturesOrderbook = (
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
  stepRatio?: number,
) => {
  const sdk = useSDK(chainId);
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.FUTURES.ORDER_BOOK(chainId, instrumentAddr, expiry, stepRatio),
    queryFn: async () => {
      if (chainId && instrumentAddr && expiry && sdk)
        try {
          // First try to get from API
          const apiResult = await fetchFuturesPairOrderBook({ chainId, address: instrumentAddr, expiry, sdk });
          return apiResult;
        } catch (apiError) {
          console.warn('API request failed, falling back to chain:', apiError);
          try {
            if (sdk && stepRatio) {
              // If API fails, fall back to chain request
              const chainResult = await sdk.perpDataSource.depth.getDepthData(instrumentAddr, expiry, stepRatio);
              const result: IFuturesOrderBookAllSteps = {};
              result[stepRatio] = chainResult;
              return result;
            }
          } catch (chainError) {
            console.error('Both API and chain requests failed:', chainError);
            throw new Error('Failed to fetch instrument from both API and chain');
          }
        }
    },
    enabled: !!chainId && !!instrumentAddr && !!expiry && !!stepRatio && !!sdk,
  });
};

export const useFetchFuturesDepthChart = (
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
) => {
  const sdk = useSDK(chainId);
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.FUTURES.DEPTH_CHARTS(chainId, instrumentAddr, expiry),
    queryFn: async () =>
      chainId &&
      instrumentAddr &&
      expiry &&
      sdk &&
      fetchFuturesPairDepthChart({ chainId, address: instrumentAddr, expiry, sdk }),
    enabled: !!chainId && !!instrumentAddr && !!expiry && !!sdk,
  });
};

export const useFetchFuturesFundingChart = (
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
  chartDuration: FundingChartInterval | undefined,
) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.FUTURES.FUNDING_CHARTS(chainId, instrumentAddr, expiry, chartDuration),
    queryFn: async () =>
      chainId &&
      instrumentAddr &&
      expiry &&
      chartDuration &&
      fetchFuturesPairFundingChart({ chainId, address: instrumentAddr, expiry, chartDuration }),
    enabled: !!chainId && !!instrumentAddr && !!expiry && !!chartDuration,
  });
};

export const useFetchFuturesKlineChart = ({
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
}) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.FUTURES.KLINE_CHARTS({
      chainId,
      instrumentAddr,
      expiry,
      chartDuration,
      timeEnd,
    }),
    queryFn: async () =>
      chainId &&
      instrumentAddr &&
      expiry &&
      chartDuration &&
      fetchFuturesPairKlineChart({
        chainId,
        instrumentAddr,
        expiry,
        chartDuration,
        timeEnd,
      }),
    enabled: !!chainId && !!instrumentAddr && !!expiry && !!chartDuration,
  });
};

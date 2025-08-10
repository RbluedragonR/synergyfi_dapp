import { PORTFOLIO_PAGE_POLLING_INTERVAL } from '@/constants/polling';
import { QUERY_KEYS } from '@/constants/query';
import { queryClient } from '@/pages/App';
import { IFuturesInstrument } from '@/types/futures';
import { FetchPortfolioParam, Instrument } from '@synfutures/sdks-perp';
import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../web3/hook';
import { fetchPortfolioListFromApi, fetchPortfolioListFromChain, getAllParticipatedFuturesFromChain } from './api';
export const useFetchSinglePortfolioFromApi = (
  chainId: number | undefined,
  userAddr: string | undefined,
  instrumentAddr: string | undefined,
  expiry: number | undefined,
) => {
  const sdk = useSDK(chainId);
  return useQuery({
    queryKey: QUERY_KEYS.PORTFOLIO.PORTFOLIO(chainId, userAddr, instrumentAddr, expiry),
    queryFn: async () => {
      if (chainId && userAddr)
        try {
          // First try to get from API
          const apiResult = await fetchPortfolioListFromApi(chainId, userAddr, instrumentAddr, expiry);
          return apiResult;
          // throw new Error('API returned no data');
        } catch (apiError) {
          console.warn('API request failed, falling back to chain:', apiError);
          try {
            if (sdk) {
              let portfolioParams: FetchPortfolioParam[] | undefined = undefined;
              if (instrumentAddr && expiry) {
                portfolioParams = [{ instrumentAddr, expiry, traderAddr: userAddr }];
              }
              const instrument = queryClient.getQueryData<IFuturesInstrument | null>(
                QUERY_KEYS.FUTURES.INSTRUMENT(chainId, instrumentAddr),
              );
              // If API fails, fall back to chain request
              const chainResult = await fetchPortfolioListFromChain({
                sdk,
                userAddr,
                chainId,
                portfolioParams: portfolioParams,
              });
              return {
                instruments: instrument ? [instrument] : [],
                portfolios: chainResult || [],
              };
            }
          } catch (chainError) {
            console.error('Both API and chain requests failed:', chainError);
            throw new Error('Failed to fetch instrument from both API and chain');
          }
        }
      return undefined;
    },
    refetchInterval: PORTFOLIO_PAGE_POLLING_INTERVAL,
    enabled: !!chainId && !!userAddr && !!instrumentAddr && !!expiry,
  });
};

export const useFetchPortfolioListFromApi = (chainId: number | undefined, userAddr: string | undefined) => {
  const sdk = useSDK(chainId);
  return useQuery({
    queryKey: QUERY_KEYS.PORTFOLIO.PORTFOLIO(chainId, userAddr),
    queryFn: async () => {
      if (chainId && userAddr)
        try {
          // First try to get from API

          const apiResult = await fetchPortfolioListFromApi(chainId, userAddr);
          return apiResult;
          // throw new Error('API returned no data');
        } catch (apiError) {
          console.warn('API request failed, falling back to chain:', apiError);
          try {
            if (sdk) {
              let portfolioParams: FetchPortfolioParam[] | undefined = undefined;
              let instruments: Instrument[] = [];
              const allPaticipatedFutures = await getAllParticipatedFuturesFromChain({
                chainId,
                sdkContext: sdk,
                userAddr,
              });

              if (allPaticipatedFutures) {
                instruments = allPaticipatedFutures;
                portfolioParams = allPaticipatedFutures.reduce((acc, instrument) => {
                  instrument.amms.forEach((amm) => {
                    acc.push({
                      traderAddr: userAddr,
                      instrumentAddr: instrument.instrumentAddr,
                      expiry: amm.expiry,
                    });
                  });

                  return acc;
                }, [] as FetchPortfolioParam[]);
              }

              // If API fails, fall back to chain request
              const chainResult = await fetchPortfolioListFromChain({
                sdk,
                userAddr,
                chainId,
                portfolioParams: portfolioParams,
              });
              return {
                instruments: instruments || [],
                portfolios: chainResult || [],
              };
            }
          } catch (chainError) {
            console.error('Both API and chain requests failed:', chainError);
            throw new Error('Failed to fetch instrument from both API and chain');
          }
        }
      return null;
    },
    enabled: !!chainId && !!userAddr,
  });
};

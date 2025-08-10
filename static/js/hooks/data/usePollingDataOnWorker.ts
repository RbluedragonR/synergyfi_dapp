import { useDebounceEffect, useDebounceFn, useDocumentVisibility } from 'ahooks';
import { useLocation } from 'react-router-dom';

import { CHAIN_ID } from '@/constants/chain';
import { MARKET_PAGE_POLLING_INTERVAL, POLLING_GRAPH } from '@/constants/polling';
import { getAllAccountsFromChain, getAllParticipatedFuturesFromChain } from '@/features/account/actions';
import { useSDK } from '@/features/web3/hook';

import { QUERY_KEYS } from '@/constants/query';
import { useFetchPortfolioList, useSinglePortfolio } from '@/features/portfolio/hook';
import { queryClient } from '@/pages/App';
import { useEffect } from 'react';
import { useAppDispatch } from '..';

// let pollingPairsTimer: NodeJS.Timer | null = null;
let pollingPairsDataTimer: NodeJS.Timer | null = null;
let pollingAccountsTimer: NodeJS.Timer | null = null;

const request_api_first = true;

/**
 * polling pairs on markets
 * @param chainId
 * @param userAddr
 */
export function usePollingPairStatsData(chainId: CHAIN_ID | undefined): void {
  // const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const documentVisibility = useDocumentVisibility();

  const { run: fetchAllPairStats } = useDebounceFn(
    async () => {
      if (chainId) {
        // dispatch(fetchAllPairsDataFromGraph({ chainId: chainId }));
      }
      // must check sdkContext
    },
    {
      wait: 500,
    },
  );

  useDebounceEffect(
    () => {
      if (documentVisibility !== 'visible') {
        pollingPairsDataTimer && clearInterval(pollingPairsDataTimer);
      }
      if (
        documentVisibility === 'visible' &&
        (pathname === '/market' || pathname === '/earn' || pathname.startsWith('/trade/'))
      ) {
        if (pollingPairsDataTimer) {
          clearInterval(pollingPairsDataTimer);
        }
        pollingPairsDataTimer = setInterval(() => {
          fetchAllPairStats();
        }, POLLING_GRAPH);
      }

      return () => {
        if (pollingPairsDataTimer) {
          clearInterval(pollingPairsDataTimer);
        }
      };
    },
    [pathname, documentVisibility, fetchAllPairStats],
    { wait: 500 },
  );
}

/**
 * polling accounts on portfolio page
 * @param chainId
 * @param userAddr
 */
export function usePollingAccountsData(chainId: CHAIN_ID | undefined, userAddr: string | undefined): void {
  const dispatch = useAppDispatch();
  // const provider = useAppProvider();
  const sdkContext = useSDK(chainId);
  const { pathname } = useLocation();
  const documentVisibility = useDocumentVisibility();
  useFetchPortfolioList(chainId, userAddr);

  const { run: fetchAllAccounts } = useDebounceFn(
    async () => {
      if (request_api_first) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PORTFOLIO.PORTFOLIO(chainId, userAddr),
        });
      } else {
        if (chainId && userAddr && sdkContext) {
          const instruments = await dispatch(
            getAllParticipatedFuturesFromChain({ chainId: chainId, userAddr: userAddr, sdkContext }),
          ).unwrap();
          if (instruments !== undefined) {
            await dispatch(getAllAccountsFromChain({ chainId: chainId, userAddr: userAddr, sdkContext, instruments }));
          }
        }
      }
      // must check sdkContext
    },
    {
      wait: 500,
    },
  );

  useDebounceEffect(
    () => {
      // fetch all accounts when user switch to portfolio page
      if (pathname.startsWith('/portfolio') && pathname !== '/portfolio/history') {
        fetchAllAccounts();
      }
    },
    [pathname],
    { wait: 500 },
  );

  useDebounceEffect(
    () => {
      if (documentVisibility !== 'visible') {
        pollingAccountsTimer && clearInterval(pollingAccountsTimer);
      }
      if (documentVisibility === 'visible' && pathname.startsWith('/portfolio') && pathname !== '/portfolio/history') {
        if (pollingAccountsTimer) {
          clearInterval(pollingAccountsTimer);
        }
        pollingAccountsTimer = setInterval(() => {
          fetchAllAccounts();
        }, MARKET_PAGE_POLLING_INTERVAL);
      }

      return () => {
        if (pollingAccountsTimer) {
          clearInterval(pollingAccountsTimer);
        }
      };
    },
    [pathname, documentVisibility, fetchAllAccounts],
    { wait: 500 },
  );
}

function useFetchSinglePortfolio(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  instrumentAddr: string | undefined,
  expiry?: number,
): typeof fetchSinglePortfolio {
  // const dispatch = useAppDispatch();
  // const sdkContext = useSDK(chainId);

  // const { run: fetchAllAccounts } = useDebounceFn(
  //   async () => {
  //     if (chainId && userAddr && sdkContext) {
  //       const instruments = await dispatch(
  //         getAllFuturesFromChain({ chainId: chainId, userAddr: userAddr, sdkContext }),
  //       ).unwrap();
  //       if (instruments)
  //         await dispatch(getAllAccountsFromChain({ chainId: chainId, userAddr: userAddr, sdkContext, instruments }));
  //     }
  //     // must check sdkContext
  //   },
  //   {
  //     wait: 500,
  //   },
  // );
  useSinglePortfolio(chainId, userAddr, instrumentAddr, expiry);
  const documentVisibility = useDocumentVisibility();

  useEffect(() => {
    if (chainId && userAddr && instrumentAddr && expiry && documentVisibility === 'visible') {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PORTFOLIO.PORTFOLIO(chainId, userAddr, instrumentAddr, expiry),
      });
    }
  }, [chainId, expiry, instrumentAddr, userAddr, documentVisibility]);

  const { run: fetchSinglePortfolio } = useDebounceFn(
    async () => {
      // if (chainId && userAddr && sdkContext) {
      //   if (!instrumentAddr) {
      //     // fetchAllAccounts();
      //   } else {
      //     // dispatch(getInstrumentFromChain({ chainId: chainId, instrumentAddr, expiry }));
      //     expiry && dispatch(getPortfolioFromChain({ chainId: chainId, userAddr, instrumentAddr, expiry }));
      //   }
      // }
    },
    {
      wait: 500,
    },
  );
  return fetchSinglePortfolio;
}

/**
 * polling single insturment pair/account data on trade page
 * @param chainId
 * @param userAddr
 * @param instrumentAddr
 * @param expiry
 */
export function usePollingSingleInstrumentDataOnTradeOrEarn(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  instrumentAddr: string | undefined,
  expiry?: number,
): void {
  const { pathname } = useLocation();
  const documentVisibility = useDocumentVisibility();

  // const fetchSinglePortfolio = useFetchSinglePortfolio(chainId, userAddr, instrumentAddr, expiry);
  useFetchSinglePortfolio(chainId, userAddr, instrumentAddr, expiry);
  useDebounceEffect(
    () => {
      if (documentVisibility === 'visible' && (pathname.startsWith('/trade/') || pathname.startsWith('/earn/'))) {
        chainId &&
          instrumentAddr &&
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUTURES.INSTRUMENT(chainId, instrumentAddr) });
        chainId &&
          instrumentAddr &&
          expiry &&
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.FUTURES.PAIR_INFO(chainId, instrumentAddr, expiry),
          });
      }
    },
    [pathname, documentVisibility, instrumentAddr, userAddr],
    { wait: 500 },
  );

  // useDebounceEffect(
  //   () => {
  //     if (documentVisibility !== 'visible') {
  //       pollingPairsTimer && clearInterval(pollingPairsTimer);
  //     }

  //     if (
  //       documentVisibility === 'visible' &&
  //       (pathname.startsWith('/trade/') ||
  //         pathname.startsWith('/earn/'))
  //     ) {
  //       if (pollingPairsTimer) {
  //         clearInterval(pollingPairsTimer);
  //       }
  //       let needPolling = false;
  //       if (pathname.startsWith('/trade/') || pathname === '/trade') {
  //         needPolling = true;
  //       } else if (pathname.startsWith('/earn/') || pathname === '/earn') {
  //         needPolling = true;
  //       }
  //       if ( needPolling) {
  //         pollingPairsTimer = setInterval(() => {
  //           // fetchSinglePortfolio();
  //         }, TRADE_PAGE_POLLING_INTERVAL);
  //       }
  //     }

  //     return () => {
  //       if (pollingPairsTimer) {
  //         clearInterval(pollingPairsTimer);
  //       }
  //     };
  //   },
  //   [pathname, documentVisibility, fetchSinglePortfolio, instrumentAddr, userAddr],
  //   { wait: 500 },
  // );
}

/**
 * fetch pair info on switch to trade page
 * @param chainId
 * @param userAddr
 * @param instrumentAddr
 * @param expiry
 */
export function useFetchSingleInstrumentDataWhenChangePage(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  instrumentAddr: string | undefined,
  expiry?: number,
): void {
  const { pathname } = useLocation();

  const fetchSinglePortfolio = useFetchSinglePortfolio(chainId, userAddr, instrumentAddr, expiry);

  useDebounceEffect(
    () => {
      // fetch instrument when change page
      if (pathname.startsWith('/trade/') || pathname.startsWith('/earn/')) {
        fetchSinglePortfolio();
      }
    },
    [pathname],
    { wait: 500 },
  );
}

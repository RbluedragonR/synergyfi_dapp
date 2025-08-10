import { CHAIN_ID } from '@derivation-tech/context';
import _ from 'lodash';
import React, { useEffect } from 'react';

import { WrappedPair } from '@/entities/WrappedPair';
import { useWrappedInstrumentMap } from '@/features/futures/hooks';
// import { useSDKContext } from '@/features/web3/hook';
import { useChainId } from '@/hooks/web3/useChain';

import { useMetaPairMap } from '../hook';

function useWrapPairInstance(chainId: CHAIN_ID | undefined): void {
  const wrappedInstrumentMap = useWrappedInstrumentMap(chainId);
  // useUnderlyingQuoteTokenBalanceWatcher(wrappedFuturesMap, chainId);
  const originPairMap = useMetaPairMap(chainId);

  useEffect(() => {
    if (!chainId || !wrappedInstrumentMap) return;
    _.forIn(originPairMap, (originPair) => {
      if (!wrappedInstrumentMap) return;
      const wrappedInstrument = wrappedInstrumentMap[originPair.instrumentId];
      if (wrappedInstrument) {
        const pair = WrappedPair.wrapInstance({ metaPair: originPair, rootInstrument: wrappedInstrument });
        pair && wrappedInstrument.connectPair(pair.expiry, pair);
      }
    });
  }, [chainId, originPairMap, wrappedInstrumentMap]);
}
// function usePairStatsWatcher(chainId: CHAIN_ID | undefined): void {
//   // const wrappedUnderLyingMap = useWrappedUnderlyingMap();
//   const wrappedPairMap = useWrappedPairMap(chainId);
//   const pairStatsMap = usePairStatsMap(chainId);

//   useEffect(() => {
//     if (!chainId || !wrappedPairMap) return;
//     _.forIn(pairStatsMap, (pairStats) => {
//       if (!wrappedPairMap) return;
//       const pair = wrappedPairMap[pairStats.id];
//       pair && pair.setPairStats(new WrappedPairData(pairStats));
//     });
//   }, [chainId, pairStatsMap, wrappedPairMap]);
// }
// function useFetchData(chainId: CHAIN_ID | undefined): void {
//   const dispatch = useAppDispatch();
//   const { pathname } = useLocation();
//   const fetchAllPairStats = useCallback(() => {
//     if (chainId) {
//       // dispatch(fetchAllPairsDataFromGraph({ chainId: chainId }));
//     }
//   }, [chainId, dispatch]);

//   useEffect(() => {
//     fetchAllPairStats();
//   }, [fetchAllPairStats]);

//   useDebounceEffect(
//     () => {
//       // if (pathname?.startsWith('/trade') || pathname?.startsWith('/earn')) {
//       fetchAllPairStats();
//       // }
//     },
//     [pathname, fetchAllPairStats],
//     { wait: 500 },
//   );
// }

function PairGlobalEffect(): null {
  const chainId = useChainId();
  useWrapPairInstance(chainId);
  // usePairStatsWatcher(chainId);
  // useFetchData(chainId);
  return null;
}

export default React.memo(PairGlobalEffect);

import { CHAIN_ID } from '@derivation-tech/context';
import { useDebounceEffect } from 'ahooks';
import _ from 'lodash';
import React, { useEffect } from 'react';

import { WrappedAccount } from '@/entities/WrappedAccount';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { useWrappedInstrumentMap } from '@/features/futures/hooks';
import { useWrappedPairMap } from '@/features/pair/hook';
// import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { useMetaAccountMap, useWrappedAccountMap } from '../accountHook';
// import { getAllAccountsFromChain } from '../actions';
import { HISTORY_RANGE } from '@/constants/history';
import { getOpenOrderCreateTime } from '@/features/graph/actions';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useMetaPortfolioMap, useWrappedPortfolioMap } from '../portfolioHook';
import { useMetaPositionMap } from '../positionHook';

function useWrapAccountInstance(chainId: CHAIN_ID | undefined, userAddr: string | undefined): void {
  const metaAccountMap = useMetaAccountMap(chainId, userAddr);
  const wrappedInstrumentMap = useWrappedInstrumentMap(chainId);
  useDebounceEffect(
    () => {
      if (!chainId || !wrappedInstrumentMap) return;
      _.forIn(metaAccountMap, (origin) => {
        if (!wrappedInstrumentMap[origin.instrumentId]) return;
        WrappedAccount.wrapInstance({
          metaAccount: origin,
          chainId,
          rootInstrument: wrappedInstrumentMap[origin.instrumentId],
        });
      });
    },
    [chainId, metaAccountMap],
    { wait: 400 },
  );
}

function useWrapPortfolioInstance(chainId: CHAIN_ID | undefined, userAddr: string | undefined): void {
  const metaPortfolioMap = useMetaPortfolioMap(chainId, userAddr);
  const wrappedAccountMap = useWrappedAccountMap(chainId, userAddr);
  const wrappedPairMap = useWrappedPairMap(chainId);
  useEffect(() => {
    if (!wrappedAccountMap || !wrappedPairMap) return;

    _.forIn(metaPortfolioMap, (origin) => {
      const wrappedAccount = wrappedAccountMap[origin.accountId];

      if (!wrappedAccount || !wrappedPairMap[origin.pairId]) return;
      const wrappedPortfolio = WrappedPortfolio.wrapInstance({
        metaPortfolio: origin,
        rootAccount: wrappedAccount,
        rootPair: wrappedPairMap[origin.pairId],
      });
      wrappedPortfolio && wrappedAccount.connectPortfolio(wrappedPortfolio);
    });
  }, [metaPortfolioMap, wrappedAccountMap, wrappedPairMap]);
}

function useWrapPositionInstance(chainId: CHAIN_ID | undefined, userAddr: string | undefined): void {
  const metaPositionMap = useMetaPositionMap(chainId, userAddr);
  const wrappedPortfolioMap = useWrappedPortfolioMap(chainId, userAddr);
  useEffect(() => {
    if (!wrappedPortfolioMap || chainId) return;
    _.forIn(metaPositionMap, (origin) => {
      const wrappedPortfolio = wrappedPortfolioMap[origin.portfolioId];
      if (!wrappedPortfolio?.rootPair || !chainId) return;
      const wrappedPosition = WrappedPosition.wrapInstance({
        metaPosition: origin,
        rootPortfolio: wrappedPortfolio,
        chainId,
      });
      wrappedPosition && wrappedPortfolio.connectPosition(wrappedPosition);
    });
  }, [chainId, metaPositionMap, wrappedPortfolioMap]);
}

function useFetchOpenOrderCreateTimeData(chainId: CHAIN_ID | undefined, userAddr: string | undefined): void {
  const dispatch = useAppDispatch();
  const sdk = useSDK(chainId);

  useEffect(() => {
    if (chainId && userAddr && sdk) {
      dispatch(
        getOpenOrderCreateTime({
          chainId,
          userAddr,
          timeRange: HISTORY_RANGE.ALL,
          requiredAllData: true,
          requiredOpenDataOnly: true,
          sdk,
        }),
      );
    }
  }, [chainId, dispatch, userAddr, sdk]);
}
function AccountGlobalEffect(): null {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  useWrapAccountInstance(chainId, userAddr);
  useWrapPortfolioInstance(chainId, userAddr);
  useWrapPositionInstance(chainId, userAddr);
  useFetchOpenOrderCreateTimeData(chainId, userAddr);
  return null;
}

export default React.memo(AccountGlobalEffect);

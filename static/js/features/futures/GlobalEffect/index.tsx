import { useDebounceEffect } from 'ahooks';
import _ from 'lodash';
import React from 'react';

import { CHAIN_ID } from '@/constants/chain';
import { WrappedInstrument } from '@/entities/WrappedInstrument';
// import { getInstrumentHistory } from '@/features/graph/actions';
import { useBackendChainConfig } from '@/features/config/hook';
import { useWatchPortfolioChange } from '@/features/portfolio/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useMetaFuturesMap, useWrappedInstrumentMap } from '../hooks';

function useWrapFuturesInstance(chainId: CHAIN_ID | undefined): void {
  const metaFuturesMap = useMetaFuturesMap(chainId);
  useDebounceEffect(
    () => {
      if (!chainId) return;
      _.forIn(metaFuturesMap, (origin) => {
        WrappedInstrument.wrapInstance({ metaFutures: origin, chainId });
      });
    },
    [chainId, metaFuturesMap],
    { wait: 400 },
  );
}

function useFillConfigToWrappedInstrument(chainId: CHAIN_ID | undefined): void {
  const wrappedInstrumentMap = useWrappedInstrumentMap(chainId);
  const dappConfig = useBackendChainConfig(chainId);

  useDebounceEffect(
    () => {
      if (!chainId || !dappConfig) return;
      _.forIn(wrappedInstrumentMap, (wrappedInstrument) => {
        if (dappConfig.customStableInstruments)
          wrappedInstrument.customStableInstruments = dappConfig.customStableInstruments;
      });
    },
    [chainId, wrappedInstrumentMap, dappConfig],
    { wait: 400 },
  );
}

function FuturesGlobalEffect(): null {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  useWrapFuturesInstance(chainId);
  useFillConfigToWrappedInstrument(chainId);
  useWatchPortfolioChange(chainId, userAddr);

  return null;
}

export default React.memo(FuturesGlobalEffect);

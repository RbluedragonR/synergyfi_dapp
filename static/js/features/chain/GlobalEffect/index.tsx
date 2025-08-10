import { CHAIN_ID } from '@derivation-tech/context';
import { useAsyncEffect, useDebounce } from 'ahooks';
import { useCallback, useEffect, useState } from 'react';
import ReactGA from 'react-ga';

// import { getChainName } from '@/utils/chain';
// import { initSentry } from '@/utils/sentry';
import { setCurrentUserAddr } from '@/features/user/userSlice';
import { setAppProvider } from '@/features/web3/actions';
import { useAppDispatch } from '@/hooks';
import { useWalletAccount } from '@/hooks/web3/useWalletNetwork';
import { getProviderFromLocalOrSetting } from '@/utils/chain';

import { POLLING_BLOCK_NUMBER } from '@/constants/polling';
import { useTokenPrices } from '@/features/global/query';
import { useAppChainId, useAppProvider } from '@/features/web3/hook';
import { pollingFunc } from '@/utils';
import { changeCurrentChainId, getChainTokenList } from '../actions';
import { updateBlockNumber } from '../chainSlice';
import { useWrappedQuoteMap } from '../hook';

export const useListenChainNetworkChange = (chainId: number | undefined): [CHAIN_ID | undefined] => {
  const dispatch = useAppDispatch();

  const changeAccount = useCallback(
    (account: string | undefined) => {
      dispatch(setCurrentUserAddr({ account: account?.toLowerCase() }));
      account && ReactGA.set({ userId: account.toLowerCase() });
    },
    [dispatch],
  );
  const account = useWalletAccount();
  const [result, setResult] = useState(chainId);

  const onAfterChainIdChange = useCallback(
    (chainId: number) => {
      dispatch(changeCurrentChainId({ chainId }));
      window.__gasPrice = 0;
      // initSentry(getChainName(chainId));
    },
    [dispatch],
  );

  /*
   *this effect fires at the initiation of the app.
   * */
  useEffect(() => {
    if (!chainId) {
      return;
    }

    onAfterChainIdChange(chainId);
    setResult(chainId);
  }, [chainId, dispatch, onAfterChainIdChange]);

  useAsyncEffect(async () => {
    if (!chainId) {
      return;
    }
    const providerSetting = await getProviderFromLocalOrSetting(chainId);
    if (providerSetting) {
      dispatch(setAppProvider({ chainId, provider: providerSetting.provider }));
    }
  }, [chainId, dispatch]);

  useEffect(() => {
    const accountAddr = account;
    changeAccount(accountAddr);
  }, [account, changeAccount]);

  return [result];
};

/**
 * watch chainId change to update reducer chainId and fetch chainConfig
 * @returns
 */
export function useChainIdWatcher(chainId: number | undefined): null {
  useListenChainNetworkChange(chainId);
  return null;
}

/**
 * watch blockNumber change to update reducer blockNumber
 * @returns
 */
export function useBlockNumberWatcher(chainId: number | undefined): null {
  const provider = useAppProvider();
  const dispatch = useAppDispatch();

  const [blockState, setBlockState] = useState<{
    chainId: number | undefined;
    blockNumber: number | null;
    timestamp: number | null;
  }>({
    chainId,
    blockNumber: null,
    timestamp: null,
  });

  const blockNumberCallback = useCallback(
    async (blockNumber: number) => {
      if (provider) {
        const block = await provider.getBlock(blockNumber);
        setBlockState({
          chainId,
          blockNumber: block.number,
          timestamp: block.timestamp,
        });
      }
    },
    [chainId, provider],
  );

  // getBlockNumber listeners and update reducer blockNumber
  useEffect(() => {
    if (!provider || !chainId) return undefined;

    setBlockState({ chainId, blockNumber: null, timestamp: null });

    const intervalId = pollingFunc(async () => {
      provider
        .getBlockNumber()
        .then(blockNumberCallback)
        .catch((error) => console.error(`Failed to get block number for chainId: ${chainId}`, error));
    }, POLLING_BLOCK_NUMBER);
    return () => {
      // provider.removeListener('block', blockNumberCallback);
      intervalId && clearInterval(intervalId);
    };
  }, [dispatch, chainId, provider, blockNumberCallback]);

  const debouncedState = useDebounce(blockState, { wait: 100 });

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !debouncedState.timestamp) return;
    dispatch(
      updateBlockNumber({
        chainId: debouncedState.chainId,
        blockNumber: debouncedState.blockNumber,
        timestamp: debouncedState.timestamp,
      }),
    );
  }, [dispatch, debouncedState.blockNumber, debouncedState.chainId, debouncedState.timestamp]);

  return null;
}
function useWrapMarginToken(chainId: number | undefined) {
  const marginTokenMap = useWrappedQuoteMap(chainId);
  const { data: priceInfoMap } = useTokenPrices({ chainId });

  useEffect(() => {
    if (marginTokenMap) {
      Object.values(marginTokenMap).forEach((quote) => {
        if (priceInfoMap && priceInfoMap[quote.address]) {
          quote.setTokenPrice(priceInfoMap[quote.address]);
        }
      });
    }
  }, [marginTokenMap, priceInfoMap]);
}

function useFetchChainTokens(chainId: number | undefined) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (chainId) {
      dispatch(getChainTokenList({ chainId }));
    }
  }, [chainId, dispatch]);
}

export default function ChainGlobalEffect(): null {
  const chainId = useAppChainId();
  useChainIdWatcher(chainId);
  // useBlockNumberWatcher(chainId);
  useWrapMarginToken(chainId);
  useFetchChainTokens(chainId);
  return null;
}

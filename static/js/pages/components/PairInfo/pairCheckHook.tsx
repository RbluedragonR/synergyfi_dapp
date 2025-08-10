import { CHAIN_ID } from '@derivation-tech/context';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { DAPP_CHAIN_CONFIGS, DEFAULT_CHAIN_ID, SUPPORTED_CHAIN_ID } from '@/constants/chain';
import { PAIR_PAGE_TYPE } from '@/constants/global';
import { useBackendChainConfig } from '@/features/config/hook';
import { useIsFetchedPairInfo } from '@/features/futures/hooks';
import { useCombinedPairFromUrl, useCurrentPairBaseInfoFromUrl } from '@/features/pair/hook';
import { useSideNavigate } from '@/hooks/useRouterNavigate';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useSwitchNetwork } from '@/hooks/web3/useSwitchConnectorNetwork';
import { getChainIdByChainShortName } from '@/utils/chain';
import { savePairChosen } from '@/utils/localstorage';

export function usePairCheck(
  chainId: CHAIN_ID | undefined,
  currentPairSymbol: string | undefined,
  filteredSearchPair: string[],
  pageType: PAIR_PAGE_TYPE,
  createOnly: boolean | undefined,
): void {
  const userAddr = useUserAddr();
  const { chainShortName, pairSymbol } = useParams();
  const { switchAppNetwork, switchWalletNetwork } = useSwitchNetwork();
  const chainIdFromUrl = useMemo(() => {
    return chainShortName ? getChainIdByChainShortName(chainShortName) : undefined;
  }, [chainShortName]);
  const { pairPageNavigate } = useSideNavigate();
  const navigate = useNavigate();
  const dappChainConfig = useBackendChainConfig(chainId);
  //check the chain
  useEffect(() => {
    if (chainIdFromUrl && chainId && chainId !== chainIdFromUrl) {
      if (SUPPORTED_CHAIN_ID.includes(chainIdFromUrl)) {
        switchAppNetwork(chainIdFromUrl);
      }
    }
  }, [chainId, chainIdFromUrl, switchAppNetwork]);

  //check the chain
  useEffect(() => {
    if (chainIdFromUrl !== undefined) {
      let isToDefaultChain = false;
      if (chainIdFromUrl === null) {
        isToDefaultChain = true;
      } else if (chainIdFromUrl && chainId && chainId !== chainIdFromUrl) {
        if (SUPPORTED_CHAIN_ID.includes(chainIdFromUrl)) {
          switchAppNetwork(chainIdFromUrl);
          switchWalletNetwork(chainIdFromUrl);
        } else {
          isToDefaultChain = true;
        }
      }

      if (isToDefaultChain) {
        const dappConfig = DAPP_CHAIN_CONFIGS[DEFAULT_CHAIN_ID];
        navigate(`/${pageType}/${dappConfig?.network.shortName}`);
      }
    } else {
      const dappConfig = DAPP_CHAIN_CONFIGS[chainId || DEFAULT_CHAIN_ID];
      navigate(`/${pageType}/${dappConfig?.network.shortName}`);
    }
  }, [chainId, chainIdFromUrl, switchAppNetwork]);

  useEffect(() => {
    // if (!pairSymbol && !createOnly) {
    //   navigate(`/${currentLocation}/${searchPairs[0]?.symbol}`, { replace: true });
    // }
    // if (!createOnly && pairSymbol && pairSymbol !== currentPair?.symbol) {
    //   navigate(`/${currentLocation}/${searchPairs[0]?.symbol}`, { replace: true });
    // }s

    if (chainIdFromUrl != chainId) {
      return;
    }
    // if (!createOnly) {
    // if pair not found in searchPairs, then navigate to first pair
    if ((!pairSymbol && !currentPairSymbol) || (pairSymbol && !currentPairSymbol)) {
      if (filteredSearchPair.length) {
        let pairSymbolD = filteredSearchPair[0] || dappChainConfig?.trade.defaultPairSymbol || '';
        if (pairSymbol && filteredSearchPair.find((p) => p === pairSymbol)) {
          pairSymbolD = pairSymbol;
        }
        pairPageNavigate(pairSymbolD || '', pageType, undefined, { replace: true });
        chainId && userAddr && savePairChosen(userAddr, chainId, pairSymbolD, pageType as PAIR_PAGE_TYPE);
      } else {
        // pairPageNavigate(dappChainConfig?.trade.defaultPairSymbol || '', pageType, { replace: true });
      }
    }
    if (!pairSymbol && currentPairSymbol) {
      let symbol = dappChainConfig?.trade.defaultPairSymbol;
      if (filteredSearchPair.length) {
        symbol = filteredSearchPair[0];
      }
      pairPageNavigate(currentPairSymbol || symbol || '', pageType, undefined, {
        replace: true,
      });
    }
    // }
  }, [
    currentPairSymbol,
    chainIdFromUrl,
    chainId,
    filteredSearchPair,
    pageType,
    pairSymbol,
    createOnly,
    userAddr,
    pairPageNavigate,
    dappChainConfig?.trade.defaultPairSymbol,
  ]);

  useEffect(() => {
    if (pairSymbol && !createOnly) {
      chainId && userAddr && savePairChosen(userAddr, chainId, pairSymbol, pageType as PAIR_PAGE_TYPE);
    }
  }, [chainId, pairSymbol, createOnly, userAddr, pageType]);
}

export function usePairNotFoundCheck(
  type: PAIR_PAGE_TYPE,
  createOnly: boolean,
): {
  pairNotFoundModalVisible: boolean;
  setPairNotFoundModalVisible: Dispatch<SetStateAction<boolean>>;
} {
  const [pairNotFoundModalVisible, setPairNotFoundModalVisible] = useState(false);
  const chainId = useChainId();
  const currentBaseInfo = useCurrentPairBaseInfoFromUrl(chainId);
  const isFetchedPair = useIsFetchedPairInfo(
    chainId,
    currentBaseInfo?.instrumentAddr,
    currentBaseInfo?.expiry,
    type === PAIR_PAGE_TYPE.EARN,
  );
  const { pairSymbol, chainShortName } = useParams();
  const chainIdFromUrl = useMemo(() => {
    return chainShortName ? getChainIdByChainShortName(chainShortName) : undefined;
  }, [chainShortName]);

  const currentPair = useCombinedPairFromUrl(chainId, false, type === PAIR_PAGE_TYPE.TRADE);
  useEffect(() => {
    if (chainIdFromUrl !== chainId) {
      return;
    }
    if (!createOnly) {
      // if pair not found in searchPairs, show the modal
      if (pairSymbol && !currentPair && isFetchedPair) {
        setPairNotFoundModalVisible(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createOnly, chainId, chainIdFromUrl, currentPair, pairSymbol, isFetchedPair]);

  return {
    pairNotFoundModalVisible,
    setPairNotFoundModalVisible,
  };
}

import { CHAIN_ID } from '@derivation-tech/context';
import { useMemo } from 'react';
import { NavigateOptions, useNavigate } from 'react-router-dom';

import { PAIR_PAGE_TYPE } from '@/constants/global';
import { getChainShortName } from '@/utils/chain';

import { useDebounceFn } from 'ahooks';
import { useChainId } from './web3/useChain';

export function useSideNavigate(chainId?: CHAIN_ID): {
  pairPageNavigate: (
    pairSymbol: string,
    pairPageType: PAIR_PAGE_TYPE,
    destinationChainId?: number,
    options?: NavigateOptions | undefined,
  ) => void;
} {
  const navigate = useNavigate();
  const currChainId = useChainId();
  const chainIdNav = useMemo(() => {
    if (chainId) {
      return chainId;
    }
    return currChainId;
  }, [chainId, currChainId]);
  const { run: pairPageNavigate } = useDebounceFn(
    (
      pairSymbol: string,
      pairPageType: PAIR_PAGE_TYPE,
      destinationChainId?: number,
      options?: NavigateOptions | undefined,
    ) => {
      if (chainIdNav) {
        const chainName = getChainShortName(destinationChainId || chainIdNav);
        navigate(`/${pairPageType}/${chainName}/${pairSymbol}`, options);
      }
    },
    { wait: 500 },
  );

  return { pairPageNavigate };
}

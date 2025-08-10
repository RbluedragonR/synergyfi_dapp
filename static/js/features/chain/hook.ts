import { CHAIN_ID } from '@derivation-tech/context';
import _ from 'lodash';
import { useMemo } from 'react';

import { WrappedQuote } from '@/entities/WrappedQuote';
import { useAppSelector } from '@/hooks';
import { useDappChainConfig } from '@/hooks/web3/useChain';
import { TokenInfo, TokenInfoMap } from '@/types/token';

import { useTokensInfoConfig } from '../config/hook';
import { useTokenPrices } from '../global/query';
import {
  TBlockStatus,
  selectChainBlockStatus,
  selectCurrentId,
  selectTokenInfoFromChain,
  selectTokenInfosFromChain,
} from './chainSlice';
export function useBlockStatus(): TBlockStatus | undefined {
  const chainBlockStatus = useAppSelector(selectChainBlockStatus),
    currentChainId = useCurrentId();
  return useMemo(() => chainBlockStatus[currentChainId], [chainBlockStatus, currentChainId]);
}

export function useBlockNumber(): number | undefined {
  const chainBlockStatus = useAppSelector(selectChainBlockStatus),
    currentChainId = useCurrentId();
  return useMemo(() => chainBlockStatus[currentChainId]?.blockNumber, [chainBlockStatus, currentChainId]);
}

export function useCurrentId(): number {
  const currentId = useAppSelector(selectCurrentId);
  return useMemo(() => currentId, [currentId]);
}

export function useNativeToken(chainId: CHAIN_ID | undefined): TokenInfo | undefined {
  const dappConfig = useDappChainConfig(chainId);
  return useMemo(
    () => (chainId && dappConfig?.nativeToken ? { ...dappConfig?.nativeToken, chainId } : undefined),
    [chainId, dappConfig],
  );
}

export function useWrappedNativeToken(chainId: CHAIN_ID | undefined): TokenInfo | undefined {
  const dappConfig = useDappChainConfig(chainId);
  return useMemo(() => dappConfig?.wrappedNativeToken, [dappConfig]);
}

export function useNativeTokenMinGasPriceLimit(chainId: CHAIN_ID | undefined): number {
  const dappConfig = useDappChainConfig(chainId);
  return useMemo(() => {
    return dappConfig?.minNativeTokenKeep || 0;
  }, [dappConfig?.minNativeTokenKeep]);
}

export function useQuoteTokens(chainId: CHAIN_ID | undefined) {
  const tokensInfoConfig = useTokensInfoConfig(chainId);
  return useMemo(() => {
    if (!chainId) return undefined;
    return tokensInfoConfig?.quoteTokens;
  }, [chainId, tokensInfoConfig]);
}

export function useMarginTokenInfoMap(chainId: CHAIN_ID | undefined): TokenInfoMap | undefined {
  const tokensInfoConfig = useTokensInfoConfig(chainId);
  return useMemo(() => {
    if (!chainId) return undefined;
    return tokensInfoConfig?.marginTokenMap;
  }, [chainId, tokensInfoConfig]);
}

export function useWrappedQuoteMap(chainId: CHAIN_ID | undefined): {
  [tokenAddress: string]: WrappedQuote;
} {
  const marginTokenMap = useMarginTokenInfoMap(chainId);
  const { data: priceInfoMap } = useTokenPrices({ chainId });

  return useMemo(() => {
    if (!marginTokenMap || !chainId) {
      return {};
    }
    return _.mapValues(marginTokenMap, (origin) => {
      const quote = WrappedQuote.getInstance(origin.id, chainId);
      if (!quote) {
        return WrappedQuote.wrapInstance({ metaToken: origin, chainId });
      }
      if (priceInfoMap) {
        const quotePriceInfo = priceInfoMap[quote.address];
        if (quotePriceInfo) {
          quote.setTokenPrice(quotePriceInfo);
        }
      }
      return quote;
    });
  }, [chainId, marginTokenMap, priceInfoMap]);
}

export function useIsNativeToken(chainId: CHAIN_ID | undefined, token: TokenInfo | undefined): boolean | undefined {
  const nativeToken = useNativeToken(chainId);
  return useMemo(() => {
    if (nativeToken && token) {
      return nativeToken?.symbol === token?.symbol && nativeToken?.address === token?.address;
    }
    return undefined;
  }, [nativeToken, token]);
}

/**
 * get token info from chain (will fetch it from server if not exist, also return the token logo uri)
 * @param chainId
 * @param tokenAddr
 * @returns
 */
export function useTokenInfo(chainId: CHAIN_ID | undefined, tokenAddr: string | undefined): TokenInfo | undefined {
  const tokenInfo = useAppSelector(selectTokenInfoFromChain(chainId, tokenAddr));
  return useMemo(() => tokenInfo, [tokenInfo]);
}

export function useTokenInfos(chainId: CHAIN_ID | undefined) {
  const tokenInfos = useAppSelector(selectTokenInfosFromChain(chainId));
  return useMemo(() => tokenInfos, [tokenInfos]);
}

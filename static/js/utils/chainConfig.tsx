import { CHAIN_ID, ChainInfo, getChainInfo } from '@derivation-tech/context';

import { IChainInfo, ISynfConfigInfo } from '@/types/chain';

import { getTokenInfo } from './token';
/**
 * read chainConfig from sdk repo config, https://github.com/SynFutures/v2-sdk
 * @param chainId
 * @returns
 */
export function getChainConfigInfo(chainId: CHAIN_ID, chainInfo?: ChainInfo): IChainInfo {
  if (!chainInfo) chainInfo = getChainInfo(chainId);
  const wrappedNativeToken = getTokenInfo(chainInfo.wrappedNativeToken, chainId);
  const nativeToken = getTokenInfo(chainInfo.nativeToken, chainId);

  const newConfig = {
    ...chainInfo,
    nativeToken,
    wrappedNativeToken: wrappedNativeToken,
    // marketConfig: marketConfig,
  } as ISynfConfigInfo;

  return newConfig;
}

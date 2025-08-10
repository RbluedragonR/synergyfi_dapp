import { CHAIN_ID, TokenInfo as Token } from '@derivation-tech/context';
import { MarketType } from '@synfutures/sdks-perp';
import { BigNumber, constants } from 'ethers';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { DEFAULT_DECIMALS } from '@/constants/global';
import { WrappedInstrument } from '@/entities/WrappedInstrument';
import { TokenInfo, TokenInfoMap } from '@/types/token';

export function getTokenInfo(token: Token, chainId: CHAIN_ID): TokenInfo {
  return {
    ...token,
    id: token.address.toLowerCase(),
    address: token.address.toLowerCase(),
    chainId,
    decimals: token.decimals || DEFAULT_DECIMALS,
  };
}

export function isWrappedNativeToken(chainId: CHAIN_ID, address: string, wrappedNativeToken?: Token): boolean {
  if (!wrappedNativeToken) {
    const dappChainConfig = DAPP_CHAIN_CONFIGS[chainId];
    wrappedNativeToken = dappChainConfig?.wrappedNativeToken;
  }

  return address?.toLowerCase() === wrappedNativeToken?.address?.toLowerCase();
}
export function isNativeWrapNativePair(tokens: TokenInfo[]): boolean {
  return (
    tokens.filter((t) => isNativeTokenAddr(t.address) || isWrappedNativeToken(t.chainId, t.address)).length ===
    tokens.length
  );
}

export function isNativeTokenAddr(tokenAddr: string): boolean {
  if (!tokenAddr) return false;
  return tokenAddr.toLowerCase() === constants.AddressZero;
}

export function isNativeTokenInfo(token: TokenInfo, isSpot?: boolean): boolean {
  if (isSpot) {
    return isNativeTokenAddr(token?.address);
  }
  return isNativeTokenAddr(token?.address) && !token.id.startsWith(`${MarketType.LINK}_`);
}

/**
 * get wrappedNativeToken if token is native token
 * or just return the token
 * @param nativeToken
 * @param chainId
 * @returns
 */
export function wrapNativeToken(nativeToken: TokenInfo, chainId: CHAIN_ID, isSpot?: boolean): TokenInfo {
  const chainConfig = DAPP_CHAIN_CONFIGS[chainId];
  if (chainConfig && isNativeTokenInfo(nativeToken, isSpot) && chainConfig.wrappedNativeToken) {
    return getTokenInfo(chainConfig.wrappedNativeToken, chainId);
  }
  return nativeToken;
}
export function wrapNativeAddress(tokenAddr: string | undefined, chainId: CHAIN_ID | undefined): string | undefined {
  if (chainId && tokenAddr && isNativeTokenAddr(tokenAddr)) {
    const chainConfig = DAPP_CHAIN_CONFIGS[chainId];
    if (chainConfig && chainConfig.wrappedNativeToken) {
      return getTokenInfo(chainConfig.wrappedNativeToken, chainId)?.address;
    }
    return tokenAddr;
  }
  return tokenAddr;
}

/**
 * get nativeToken if token is wrapped native token
 * or just return the token
 * @param wrappedNativeToken
 * @param chainId
 * @returns
 */
export function unWrapNativeToken(wrappedNativeToken: TokenInfo, chainId: CHAIN_ID): TokenInfo | undefined {
  const chainConfig = DAPP_CHAIN_CONFIGS[chainId];
  if (chainConfig && isWrappedNativeToken(chainId, wrappedNativeToken.address)) {
    return chainConfig.nativeToken;
  }
  return wrappedNativeToken;
}

export function fixBalanceNumberDecimalsTo18(num: BigNumber, tokenDecimals: number): BigNumber {
  return num.mul(10 ** (18 - tokenDecimals));
}

export function adjustBalanceNumberToTokenDecimals(num: BigNumber, tokenDecimals: number): BigNumber {
  return num.div(10 ** (18 - tokenDecimals));
}

export function mappingToken({
  token,
  chainId,
  marketType,
  unWrappedNativeToken = false,
}: {
  token: Token;
  marketType?: MarketType;
  chainId: CHAIN_ID;
  unWrappedNativeToken?: boolean;
}): TokenInfo {
  const dappChainConfig = DAPP_CHAIN_CONFIGS[chainId];
  if (dappChainConfig) {
    if (unWrappedNativeToken && isWrappedNativeToken(chainId, token.address)) {
      if (dappChainConfig.nativeToken) token = dappChainConfig.nativeToken;
    }
  }

  const mToken: TokenInfo = getTokenInfo(token, chainId);

  // transform chainlink token's id
  if (marketType && [MarketType.LINK, MarketType.EMG, MarketType.PYTH].includes(marketType)) {
    // if (marketType && [MarketType.CHAINLINK, MarketType.SYNFUTURES].includes(marketType)) {
    mToken.id = `${marketType}_${mToken.symbol}`;
  }
  return mToken;
}

export function getSanitizedFuturesSymbol(futures: WrappedInstrument, chainId: CHAIN_ID | undefined): string {
  if (chainId) {
    if (isWrappedNativeToken(chainId, futures.quoteToken.address)) {
      return `${futures.baseToken.symbol}-${unWrapNativeToken(futures.quoteToken as TokenInfo, chainId)?.symbol}-${
        futures.market.info.type
      }`;
    }
    if (isWrappedNativeToken(chainId, futures.baseToken.address)) {
      return `${unWrapNativeToken(futures.baseToken as TokenInfo, chainId)?.symbol}-${futures.quoteToken.symbol}-${
        futures.market.info.type
      }`;
    }
    return futures.displaySymbol;
  }
  return futures.displaySymbol;
}

export function tokenArrToMap(tokens: Token[], chainId: CHAIN_ID): TokenInfoMap {
  return tokens.reduce((acc, token) => {
    acc[token.address.toLowerCase()] = getTokenInfo(token, chainId);
    return acc;
  }, {} as TokenInfoMap);
}

import { CHAIN_ID } from '@derivation-tech/context';
import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers';
import { Overrides, providers } from 'ethers';

import { ReconnectingWebSocketProvider } from '@/connectors/WebSocketConnector/ReconnectingWebSocketProvider';
import { DAPP_CHAIN_CONFIGS, DEFAULT_CHAIN_ID, SUPPORTED_CHAIN_ID } from '@/constants/chain';
import { CHAIN_HTTP_RPC_URLS, CHAIN_WSS_RPC_URLS } from '@/constants/rpc';
import { APP_CHAIN_ID } from '@/constants/storage';
import { getRpcFromLocalForage } from './storage';
/**
 * get chainName by Chain id
 * @param chainId
 * @returnschain
 */
export function getChainName(chainId: CHAIN_ID): string {
  let chainName = '';
  const dappChainConfig = DAPP_CHAIN_CONFIGS[chainId];
  if (dappChainConfig) {
    chainName = dappChainConfig.network.name || '';
  }

  return chainName;
}

export function getChainShortName(chainId: CHAIN_ID): string {
  let chainName = '';
  if (DAPP_CHAIN_CONFIGS[chainId]) {
    chainName = DAPP_CHAIN_CONFIGS[chainId].network.shortName || '';
  }

  return chainName;
}

export function getChainIdByChainShortName(chainShortName: string): CHAIN_ID | null | undefined {
  if (chainShortName) {
    let chainId: CHAIN_ID | null = null;
    Object.entries(DAPP_CHAIN_CONFIGS).map(([chainIdStr, chainConfig]) => {
      if (chainConfig.network.shortName === chainShortName) {
        chainId = Number(chainIdStr) as CHAIN_ID;
      }
    });

    return chainId;
  }
}

export function getGasSettings(): Overrides {
  return { gasLimit: 2500000 };
}

/**
 * get default chainId from localStorage or default config
 * @returns
 */
export function getDefaultChainId(): number {
  const localChainId = localStorage.getItem(APP_CHAIN_ID);
  if (localChainId !== null) {
    if (SUPPORTED_CHAIN_ID.includes(Number(localChainId))) {
      return Number(localChainId);
    }
  }
  return DEFAULT_CHAIN_ID;
}

export function isTestnet(chainId: number | undefined): boolean {
  return chainId ? DAPP_CHAIN_CONFIGS[chainId]?.network.isTestnet || false : false;
}

export async function getWssProvider(
  chainId: number | undefined,
  url?: string,
): Promise<ReconnectingWebSocketProvider | undefined> {
  if (!chainId || !CHAIN_WSS_RPC_URLS[chainId]) return undefined;
  if (!url) url = CHAIN_WSS_RPC_URLS?.[chainId]?.[0];
  return ReconnectingWebSocketProvider.getInstance(chainId, url);
}

export function getHttpProvider(chainId: number | undefined, url?: string): JsonRpcProvider | undefined {
  if (chainId && !url) url = CHAIN_HTTP_RPC_URLS?.[chainId]?.[0];
  if (chainId && !url) {
    const dappChainConfig = DAPP_CHAIN_CONFIGS[chainId];
    url = dappChainConfig?.network.rpcUrl.public;
  }
  return new JsonRpcProvider(url, chainId);
}

const chainBlockExplorerLinks = Object.values(DAPP_CHAIN_CONFIGS).map((config) => config.network.blockExplorer.url);
export const checkLinkIsBlockExplorer = (link: string) => {
  return chainBlockExplorerLinks.some((blockExplorerLink) =>
    link.toLowerCase().includes(blockExplorerLink.toLowerCase()),
  );
};

export async function getProviderFromLocalOrSetting(chainId: number): Promise<
  | {
      type: 'wss';
      provider: ReconnectingWebSocketProvider;
    }
  | {
      type: 'https';
      provider: JsonRpcProvider;
    }
> {
  const localRpcUrl = await getRpcFromLocalForage(chainId);
  // if no local rpc url, use the default rpc url
  if (!localRpcUrl) {
    const wssRpcUrl = CHAIN_WSS_RPC_URLS?.[chainId]?.[0];
    if (wssRpcUrl) {
      return {
        type: 'wss',
        provider: ReconnectingWebSocketProvider.getInstance(chainId, wssRpcUrl),
      };
    } else {
      return {
        type: 'https',
        provider: getFallbackProvider(chainId, CHAIN_HTTP_RPC_URLS?.[chainId]) as unknown as JsonRpcProvider, //new StaticJsonRpcProvider(httpsUrl, chainId),
      };
    }
  }
  // if local rpc url exists, use the local rpc url
  if (localRpcUrl.type === 'wss') {
    return {
      type: 'wss',
      provider: ReconnectingWebSocketProvider.getInstance(chainId, localRpcUrl.rpc),
    };
  } else {
    return {
      type: 'https',
      provider: new StaticJsonRpcProvider(localRpcUrl.rpc, chainId),
    };
  }
}

export function getFallbackProvider(chainId: number, urls: string[]) {
  const stallTimeout = 1000;
  const proiders = urls.map((url) => new providers.StaticJsonRpcProvider(url, chainId));
  const params = proiders.map((provider, index) => {
    return {
      provider: provider,
      priority: 1 + index,
      weight: 1,
      stallTimeout,
    };
  });
  const provider = new providers.FallbackProvider(params);

  return provider;
}

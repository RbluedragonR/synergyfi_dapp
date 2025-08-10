import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { useCallback, useMemo } from 'react';

import { WEB3_NETWORK_TYPE } from '@/constants';
import { CHAIN_ID, DAPP_CHAIN_CONFIGS, SUPPORTED_CHAIN_ID } from '@/constants/chain';
import { selectCurrentId } from '@/features/chain/chainSlice';
import { useCurrentId } from '@/features/chain/hook';
import { useUserAddrState } from '@/features/user/hooks';
import { useWalletProvider, useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { IDappChainConfig } from '@/types/chain';
import { getChainName, getChainShortName } from '@/utils/chain';
import { getProviderOrSigner, getSignerFromProvider } from '@/utils/signer';

import { useAppProvider } from '@/features/web3/hook';
import { useAppSelector } from '..';

export function useChainId(): CHAIN_ID | undefined {
  const chainId = useAppSelector(selectCurrentId);
  return chainId;
}

export function useChainName(chainId?: CHAIN_ID): string | undefined {
  const defaultChainId = useChainId();

  if (!chainId) chainId = defaultChainId;

  return useMemo(() => {
    return !!chainId ? getChainName(chainId) : undefined;
  }, [chainId]);
}

export function useChainShortName(chainId?: CHAIN_ID): string | undefined {
  const defaultChainId = useChainId();

  if (!chainId) chainId = defaultChainId;

  return useMemo(() => {
    return !!chainId ? getChainShortName(chainId) : undefined;
  }, [chainId]);
}

export const useIsSupportedChain = (): boolean => {
  const chainId = useCurrentId();

  const getIsChainAvailable = useCallback((chainId: number) => {
    return SUPPORTED_CHAIN_ID.includes(chainId);
  }, []);

  const isChainAvailable = useMemo(() => {
    if (!chainId) return false;
    return getIsChainAvailable(chainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return isChainAvailable;
};

export const useAllDappChainConfig = (chainId?: CHAIN_ID): IDappChainConfig | null => {
  const isChainAvailable = useIsSupportedChain();

  const defaultChainId = useChainId();
  const rChainId = chainId || defaultChainId;
  /**
   * return new chain config info
   */
  const chainConfigInfo = useMemo(() => {
    if (rChainId && isChainAvailable) {
      return DAPP_CHAIN_CONFIGS[rChainId];
    }
    return null;
  }, [rChainId, isChainAvailable]);

  return chainConfigInfo;
};

export const useDappChainConfig = (chainId?: CHAIN_ID): IDappChainConfig | null => {
  const isChainAvailable = useIsSupportedChain();

  const defaultChainId = useChainId();
  const rChainId = chainId || defaultChainId;
  /**
   * return new chain config info
   */
  const chainConfigInfo = useMemo(() => {
    if (rChainId && isChainAvailable) {
      return DAPP_CHAIN_CONFIGS[rChainId];
    }
    return null;
  }, [rChainId, isChainAvailable]);

  return chainConfigInfo;
};

export const useEtherscanLink = (): ((data: string, type: 'transaction' | 'token' | 'address' | 'block') => string) => {
  const chainConfigInfo = useDappChainConfig();

  const getEtherscanLink = useCallback(
    (data: string, type: 'transaction' | 'token' | 'address' | 'block'): string => {
      if (!chainConfigInfo) return '';
      const prefix = chainConfigInfo.network.blockExplorer.url;

      switch (type) {
        case 'transaction': {
          return `${prefix}/tx/${data}`;
        }
        case 'token': {
          return `${prefix}/token/${data}`;
        }
        case 'block': {
          return `${prefix}/block/${data}`;
        }
        case 'address':
        default: {
          return `${prefix}/address/${data}`;
        }
      }
    },
    [chainConfigInfo],
  );

  return getEtherscanLink;
};

/**
 * get app or wallet connector's provider
 * @param web3NetworkType
 * @returns
 */
export function useProvider(web3NetworkType?: WEB3_NETWORK_TYPE): JsonRpcProvider | undefined {
  const walletProvider = useWalletProvider();
  const appProvider = useAppProvider();
  return useMemo(() => {
    return web3NetworkType === WEB3_NETWORK_TYPE.Wallet ? walletProvider : appProvider;
  }, [walletProvider, appProvider, web3NetworkType]);
}
export function useUserAddr(): string | undefined {
  return useUserAddrState();
}

export const useSigner = (web3NetworkType?: WEB3_NETWORK_TYPE): JsonRpcSigner | undefined => {
  const provider = useProvider(web3NetworkType);
  const account = useUserAddr();
  const walletSigner = useWalletSigner();
  return useMemo(() => {
    if (web3NetworkType === WEB3_NETWORK_TYPE.Wallet && walletSigner) return walletSigner;
    if (provider && account) {
      return getSignerFromProvider(provider, account);
    }
    return undefined;
  }, [account, provider, walletSigner, web3NetworkType]);
};

export const useProviderOrSigner = (
  provider: JsonRpcProvider | undefined,
  account: string | null | undefined,
): JsonRpcProvider | JsonRpcSigner | undefined => {
  return useMemo(() => {
    if (provider) {
      return getProviderOrSigner(provider, account ?? undefined);
    }
    return undefined;
  }, [account, provider]);
};

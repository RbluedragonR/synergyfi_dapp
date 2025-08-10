import { useMemo } from 'react';

import { SOCIAL_WALLETS, SUPPORTED_WALLETS, WALLET_CONFIGS } from '@/constants/wallets';
import { useAppSelector } from '@/hooks';
import {
  ISocialWalletInfo,
  IWalletConfigInfo,
  IWeb3WalletInfo,
  WALLET_CONNECT_STATUS,
  WalletType,
} from '@/types/wallet';

import { CHAIN_ID } from '@/constants/chain';
import { useWalletIsActive } from '@/hooks/web3/useWalletNetwork';
import { getDefaultChainId } from '@/utils/chain';
import { isMobile } from 'react-device-detect';
import { useConnect } from 'wagmi';
import { useAppChainId } from '../web3/hook';
import { selectWalletChainId, selectWalletConnectStatus, selectWalletType } from './walletSlice';

export function useWeb3WalletConfigList(): IWeb3WalletInfo[] {
  const { connectors } = useConnect();
  return useMemo(() => {
    console.log('🚀 ~ useWeb3WalletConfigList ~ connectors:', connectors);

    return WALLET_CONFIGS.supportedWallets
      .map((walletType) => SUPPORTED_WALLETS[walletType])
      .map((wallet) => {
        const connector = connectors.find((conn) => conn.id === wallet.id);
        if (connector) {
          return {
            ...wallet,
            connector: connector,
          };
        } else if (wallet.type === WalletType.BURRITO) {
          return {
            ...wallet,
            connector: connectors.find((conn) => conn.id === WalletType.WALLET_CONNECT),
          };
        } else if (wallet.type !== WalletType.WALLET_CONNECT) {
          // fallback to injected connector
          return {
            ...wallet,
            connector: connectors.find((conn) => conn.id === 'injected'),
          };
        }
        return wallet;
      });
  }, [connectors]);
}

export function useSocialWalletConfigList(): ISocialWalletInfo[] {
  return useMemo(() => {
    return Object.values(SOCIAL_WALLETS);
  }, []);
}

/**
 * get wallet config
 * @param walletType
 * @returns
 */
export function useWalletConfig(walletType: WalletType): IWalletConfigInfo {
  return useMemo(() => {
    return WALLET_CONFIGS.walletConfig[walletType];
  }, [walletType]);
}

export function useWalletConnectStatus(): WALLET_CONNECT_STATUS {
  const connectStatus = useAppSelector(selectWalletConnectStatus);
  return connectStatus;
}

export function useWalletType(): WalletType | undefined {
  const walletType = useAppSelector(selectWalletType);
  return walletType;
}

export function useWalletChainId(): CHAIN_ID | undefined {
  const walletChainId = useAppSelector(selectWalletChainId);
  return walletChainId;
}

export function useWalletIsWrongNetwork(): boolean {
  const chainId = useWalletChainId();
  const appChainId = useAppChainId();
  const isActive = useWalletIsActive();

  const isWrongNetwork = useMemo(() => {
    if (!isActive) return true;
    if (chainId && appChainId) {
      return appChainId !== chainId;
    }
    return chainId !== getDefaultChainId();
  }, [appChainId, chainId, isActive]);
  return isWrongNetwork;
}

/**
 * Check if a specific type of wallet exists
 * @param walletType
 * @returns boolean
 */
export function useWalletExists(walletType: WalletType): boolean {
  const { connectors } = useConnect();

  return useMemo(() => {
    if (isMobile) {
      return false;
    }
    const wallet = SUPPORTED_WALLETS[walletType];
    if (!wallet) {
      return false;
    } else if (wallet?.hideInstalled) {
      return false;
    }
    const connector = connectors.find((conn) => conn.id === wallet.id);
    return !!connector;
  }, [connectors, walletType]);
}

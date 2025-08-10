import type { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { useMemo } from 'react';

import { CHAIN_ID } from '@/constants/chain';
import { useWalletType } from '@/features/wallet/hook';
import { WalletType } from '@/types/wallet';

import { getSignerFromProvider } from '@/utils/signer';
import { useEthersProvider, useEthersSigner } from '@/utils/wagmi';
import { Connector } from 'wagmi';
import {
  usePrivyChainId,
  usePrivyIsActive,
  usePrivyProvider,
  usePrivyWalletAddress,
} from '../../connectors/privy/usePrivyWallet';
import { useWagmiAccount } from './useWagami';

export function useWalletConnector(): Connector | undefined {
  const { connector } = useWagmiAccount();
  return useMemo(() => {
    return connector;
  }, [connector]);
}

export function useWalletProvider(): JsonRpcProvider | undefined {
  const walletType = useWalletType();
  const walletProvider = useEthersProvider();

  const privyProvider = usePrivyProvider();

  return useMemo(() => {
    return walletType === WalletType.PRIVY ? privyProvider : walletProvider;
  }, [walletType, privyProvider, walletProvider]);
}
export const useWalletSigner = (): JsonRpcSigner | undefined => {
  const provider = useWalletProvider();
  const account = useWalletAccount();
  const signer = useEthersSigner();
  const walletType = useWalletType();
  return useMemo(() => {
    if (walletType === WalletType.PRIVY && provider && account) {
      return getSignerFromProvider(provider, account);
    } else if (signer) {
      return signer;
    }
    return undefined;
  }, [account, provider, signer, walletType]);
};

export const useWalletConnectorChainId = (): CHAIN_ID | undefined => {
  const { chainId } = useWagmiAccount();
  const privyChainId = usePrivyChainId();
  const walletType = useWalletType();

  return useMemo(() => {
    return walletType === WalletType.PRIVY ? privyChainId : chainId;
  }, [privyChainId, chainId, walletType]);
};
export const useWalletAccount = (): string | undefined => {
  const walletType = useWalletType();
  const { address } = useWagmiAccount();
  const addr = address;
  const privyAddr = usePrivyWalletAddress();

  return useMemo(() => {
    return walletType === WalletType.PRIVY ? privyAddr : addr?.toLowerCase();
  }, [addr, privyAddr, walletType]);
};
export const useWalletIsActive = (): boolean => {
  const walletType = useWalletType();
  const { isConnected } = useWagmiAccount();
  const isPrivyActive = usePrivyIsActive();
  return useMemo(() => {
    return walletType === WalletType.PRIVY ? isPrivyActive : isConnected;
  }, [isConnected, isPrivyActive, walletType]);
};

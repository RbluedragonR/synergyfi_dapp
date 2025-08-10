import { CHAIN_ID } from '@derivation-tech/context';
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers';

import { useAppSelector } from '@/hooks';

import { Context } from '@derivation-tech/context';
import { useCurrentId } from '../chain/hook';
import { selectAppProvider, selectSDK } from './web3Slice';

export function useAppProvider(chainId?: CHAIN_ID): WebSocketProvider | JsonRpcProvider | undefined {
  const defaultChainId = useCurrentId();

  const appProvider = useAppSelector(selectAppProvider(chainId || defaultChainId));
  return appProvider;
}

export function useAppChainId(): number {
  const chainId = useCurrentId();
  return chainId;
}

export const useAppIsActive = (): boolean => {
  const provider = useAppProvider();
  return !!provider;
};

export function useSDK(chainId: CHAIN_ID | undefined): Context | undefined {
  const sdkContext = useAppSelector(selectSDK(chainId));
  return sdkContext;
}

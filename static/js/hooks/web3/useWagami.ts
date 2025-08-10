import { clearDisconnectFlag } from '@/utils/wagmi';
import { useCallback } from 'react';
import { useAccount, useConnectorClient, useDisconnect } from 'wagmi';

export function useWagmiAccount(): ReturnType<typeof useAccount> {
  const account = useAccount();
  return account;
}

export function useWagmiConnectorClient(): ReturnType<typeof useConnectorClient> {
  const connectorClient = useConnectorClient();
  return connectorClient;
}

export function useWagmiDisconnect() {
  const { disconnect, connectors } = useDisconnect();
  return useCallback(() => {
    connectors.map((connector) => disconnect({ connector }));
    clearDisconnectFlag();
  }, [connectors, disconnect]);
}

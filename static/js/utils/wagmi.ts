import { getWalletConfigSetting } from '@/configs';
import { providers } from 'ethers';
import { useMemo } from 'react';
import type { Account, Chain, Client, Transport } from 'viem';

import { Config, useClient, useConnectorClient } from 'wagmi';

export function clientToProvider(
  client: Client<Transport, Chain>,
): providers.FallbackProvider | providers.JsonRpcProvider {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    );
  return new providers.JsonRpcProvider(transport.url, network);
}

/** Hook to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider({ chainId }: { chainId?: number | undefined } = {}):
  | providers.JsonRpcProvider
  | undefined {
  const client = useClient<Config>({ chainId });
  return useMemo(() => (client ? (clientToProvider(client) as providers.JsonRpcProvider) : undefined), [client]);
}

export function clientToSigner(client: Client<Transport, Chain, Account>): providers.JsonRpcSigner {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a Viem Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}): providers.JsonRpcSigner | undefined {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

export function clearDisconnectFlag() {
  const wallets = getWalletConfigSetting();
  Object.values(wallets.walletConfig).forEach((wallet) => {
    wallet && localStorage.removeItem(`wagmi.${wallet.id}.disconnected`);
  });
}

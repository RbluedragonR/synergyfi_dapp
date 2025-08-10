import { createConfig, fallback, http } from 'wagmi';
import { Chain, arbitrum, base, blast, blastSepolia, linea } from 'wagmi/chains';

import { QueryClient } from '@tanstack/react-query';

import { injected } from 'wagmi/connectors';
import { binanceConnectorFN } from '../binance';
import { coinbaseWalletConnectorFN } from '../coinbase';
import { walletConnectConnectorFN } from '../walletConnectV2';

export const wagmiChains: Chain[] = [base, blast, blastSepolia, linea, arbitrum];

export const wagmiConfig = createConfig({
  chains: [wagmiChains[0], ...wagmiChains.slice(1)],
  transports: {
    [blast.id]: fallback([http(), http(`https://blast.drpc.org/`)]),
    [blastSepolia.id]: fallback([http(), http(`https://blast-sepolia.blockpi.network/v1/rpc/public`)]),
    [linea.id]: fallback([http(), http(`https://linea.blockpi.network/v1/rpc/public`)]),
    [arbitrum.id]: fallback([http(), http(`https://arbitrum.llamarpc.com`)]),
    [base.id]: fallback([http(), http(`https://base.llamarpc.com`)]),
  },
  connectors: [
    injected(),
    binanceConnectorFN(),
    walletConnectConnectorFN,
    // // burrito,
    // okxConnectorFN,
    coinbaseWalletConnectorFN,
    // bitkeepConnectorFN,
    // trustConnectorFN,
    // coin98ConnectorFN,
  ],
  // cacheTime: 0,
  // multiInjectedProviderDiscovery: false,
});

// declare module 'wagmi' {
//   interface Register {
//     config: typeof wagmiConfig;
//   }
// }

// 2. Create a new Query Client with a default `gcTime`.
const queryClient = new QueryClient({
  // defaultOptions: {
  //   queries: {
  //     gcTime: 1_000 * 60 * 60 * 24, // 24 hours
  //   },
  // },
});

// const queryClient = new QueryClient();
// queryClient.removeQueries();
// 3. Set up the persister.
// const persister = createSyncStoragePersister({
//   serialize,
//   storage: window.localStorage,
//   deserialize,
// });

export { queryClient };

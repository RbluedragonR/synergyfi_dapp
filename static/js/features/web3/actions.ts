import { CHAIN_ID, Context } from '@derivation-tech/context';
import { DefaultEthGasEstimator, txPlugin } from '@derivation-tech/tx-plugin';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { aggregatorPlugin as aggregatorPlugin3 } from '@synfutures/sdks-aggregator';
import { aggregatorDataSourcePlugin as aggregatorDataSourcePlugin3 } from '@synfutures/sdks-aggregator-datasource';
import { airdropPlugin } from '@synfutures/sdks-airdrop';
import { perpPlugin } from '@synfutures/sdks-perp';
import { perpDataSourcePlugin } from '@synfutures/sdks-perp-datasource';
import { perpLaunchpadPlugin } from '@synfutures/sdks-perp-launchpad';
import { perpLaunchpadDataSourcePlugin } from '@synfutures/sdks-perp-launchpad-datasource';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';

import { AppState } from '../store';

import { getVaultConfig } from '@/constants/launchpad/vault';
import { SPOT_HISTORY_GRAPH } from '@/constants/spot';

export const initSDKContext = createAsyncThunk(
  'web3/initSDKContext',

  async (
    { chainId, provider }: { chainId: number; provider: JsonRpcProvider },
    { getState },
  ): Promise<Context | undefined> => {
    const {
      web3: { chainSDK },
    } = getState() as AppState;
    try {
      // dispatch(setAppProvider({ chainId, provider }));
      if (chainSDK[chainId]) {
        return;
      }
      const chainConfig = DAPP_CHAIN_CONFIGS[chainId];

      const vaultConfig = getVaultConfig();
      const chainVaultConfig = vaultConfig?.chainConfig[chainId];

      const ctx = new Context(chainId)
        .use(perpPlugin({ inverse: true }))
        .use(txPlugin({ gasLimitMultiple: 1.7, gasEstimator: new DefaultEthGasEstimator() }))
        .use(
          perpDataSourcePlugin({ endpoint: chainConfig.subgraph, inverse: true }), // dataSourcePlugin
        )
        .use(perpLaunchpadPlugin()) // vaultPlugin
        .use(perpLaunchpadDataSourcePlugin(chainVaultConfig?.graphAddr || '')) // vaultDataSourcePlugin
        .use(aggregatorPlugin3())
        .use(
          aggregatorDataSourcePlugin3(SPOT_HISTORY_GRAPH), // aggregatorDataSourcePlugin
        )
        .use(airdropPlugin());
      ctx.setProvider(provider);
      await ctx.init();
      return ctx;

      return undefined;
    } catch (e) {
      console.error('init sdk error', e);
    }
  },
);

export const setAppProvider = createAsyncThunk(
  'web3/setAppProvider',

  (
    { chainId, provider }: { chainId: CHAIN_ID; provider: JsonRpcProvider },
    { getState },
  ): JsonRpcProvider | undefined => {
    const {
      web3: { chainAppProvider },
    } = getState() as AppState;

    if (chainAppProvider[chainId]) {
      return;
    }
    return provider;
  },
);

export const setAppSigner = createAction<{ chainId: number; signer: JsonRpcSigner | undefined }>('web3/setAppSigner');

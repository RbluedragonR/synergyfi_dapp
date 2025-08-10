import { CHAIN_ID, ChainInfo, Context } from '@derivation-tech/context';
import { JsonRpcProvider } from '@ethersproject/providers';

import { ReconnectingWebSocketProvider } from '@/connectors/WebSocketConnector/ReconnectingWebSocketProvider';
import { CHAIN_HTTP_RPC_URLS, CHAIN_WSS_RPC_URLS } from '@/constants/rpc';
import { getFallbackProvider, getProviderFromLocalOrSetting } from '@/utils/chain';

export class ChainContextWorker {
  private static instances: Map<CHAIN_ID, ChainContextWorker> = new Map();
  chainId: number;
  chainContext: Context;
  constructor(chainId: CHAIN_ID, provider: JsonRpcProvider) {
    this.chainId = chainId;
    this.chainContext = new Context(chainId);
    this.chainContext.info.isOpSdkCompatible = false;
    this.chainContext.setProvider(provider);
  }

  public static getInstance(chainId: CHAIN_ID): ChainContextWorker {
    let instance = this.instances.get(chainId);
    if (!instance) {
      let provider: JsonRpcProvider | undefined = undefined;

      if (CHAIN_WSS_RPC_URLS?.[chainId]?.[0])
        provider = new ReconnectingWebSocketProvider(CHAIN_WSS_RPC_URLS?.[chainId]?.[0], chainId);
      if (!provider) {
        provider = getFallbackProvider(chainId, CHAIN_HTTP_RPC_URLS?.[chainId]) as unknown as JsonRpcProvider;
      }

      instance = new ChainContextWorker(chainId, provider);
      this.instances.set(chainId, instance);
    }
    return instance;
  }

  get chainInfo(): ChainInfo {
    return this.chainContext.info;
  }

  get provider(): JsonRpcProvider {
    return this.chainContext.provider as JsonRpcProvider;
  }

  readProviderFromLocalOrSetting = async (): Promise<void> => {
    const rpcSetting = await getProviderFromLocalOrSetting(this.chainId);
    this.chainContext.setProvider(rpcSetting.provider);
  };
}

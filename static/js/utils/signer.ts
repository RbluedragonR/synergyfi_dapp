import { ERC20, ERC20__factory as ERC20Factory } from '@derivation-tech/contracts';
import { FallbackProvider, JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

export async function getERC2O(tokenAddress: string, signer: JsonRpcSigner | JsonRpcProvider): Promise<ERC20> {
  return ERC20Factory.connect(tokenAddress, signer);
}

export async function getNonnce(signer: JsonRpcSigner, contractAddress: string): Promise<number> {
  return await signer.provider.getTransactionCount(contractAddress);
}

// TODO: merge to getSigner
// account is not optional
export function getSignerFromProvider(provider: JsonRpcProvider, account: string): JsonRpcSigner {
  if (provider instanceof FallbackProvider) {
    const config = provider.providerConfigs[0];
    if (config?.provider) {
      const p = config.provider as JsonRpcProvider;
      return p.getSigner(account);
    }
  }
  return provider.getSigner(account);
}

// account is optional
export function getProviderOrSigner(provider: JsonRpcProvider, account?: string): JsonRpcProvider | JsonRpcSigner {
  return account ? getSignerFromProvider(provider, account) : provider;
}

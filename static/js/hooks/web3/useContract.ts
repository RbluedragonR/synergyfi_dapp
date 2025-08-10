import { CHAIN_ID } from '@derivation-tech/context';
import { ERC20, ERC20__factory } from '@derivation-tech/contracts';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { Instrument, Instrument__factory } from '@synfutures/sdks-perp/dist/typechain';
import { useMemo } from 'react';

import { isTestnet } from '@/utils/chain';

import { useProviderOrSigner } from './useChain';

export function useErc20Contract(tokenAddr: string | undefined, signer: JsonRpcSigner | undefined): ERC20 | undefined {
  return useMemo(() => {
    if (signer && tokenAddr) {
      return ERC20__factory.connect(tokenAddr, signer);
    }
    return undefined;
  }, [signer, tokenAddr]);
}

export function useTestNetErc20Contract(
  tokenAddr: string | undefined,
  provider: JsonRpcProvider | undefined,
  account: string | null | undefined,
  chainId: CHAIN_ID | undefined,
): ERC20 | undefined {
  const providerOrSigner = useProviderOrSigner(provider, account);
  return useMemo(() => {
    if (isTestnet(chainId)) {
      if (providerOrSigner && tokenAddr) {
        return ERC20__factory.connect(tokenAddr, providerOrSigner);
      }
    }

    return undefined;
  }, [chainId, providerOrSigner, tokenAddr]);
}

export function useInstrumentContract(
  instrumentAddr: string | undefined,
  signer: JsonRpcSigner | undefined,
): Instrument | undefined {
  return useMemo(() => {
    if (signer && instrumentAddr) {
      return Instrument__factory.connect(instrumentAddr, signer);
    }

    return undefined;
  }, [instrumentAddr, signer]);
}

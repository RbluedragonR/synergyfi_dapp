import { CHAIN_ID } from '@derivation-tech/context';

import { IDappChainConfig } from '@/types/chain';
import { Chain } from 'viem';

function jsonFileMapping(chainId: CHAIN_ID): string | undefined {
  switch (chainId as number) {
    case CHAIN_ID.GOERLI:
      return 'goerli';
    case CHAIN_ID.LINEA:
      return 'linea';
    case CHAIN_ID.ARBITRUM:
      return 'arbitrum';
    case CHAIN_ID.BLASTSEPOLIA:
      return 'blastSepolia';
    case CHAIN_ID.BLAST:
      return 'blast';
    case CHAIN_ID.BASE:
      return 'base';
  }
}

export function getDappChainConfig(chainId: CHAIN_ID, wagmiChain: Chain): IDappChainConfig {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const chainConfig = require(`./${jsonFileMapping(chainId)}.json`) as IDappChainConfig;
  let config = chainConfig;

  if (chainConfig) {
    config = JSON.parse(JSON.stringify(chainConfig)) as IDappChainConfig;
    config.wagmiChain = wagmiChain;
  }
  return config;
}

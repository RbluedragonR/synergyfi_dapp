import { CHAIN_ID } from '@derivation-tech/context';
import { arbitrum, base, blast, blastSepolia, linea } from 'wagmi/chains';

import { getDappChainConfig } from '@/configs/chain';
import { IDappChainConfig, ISynfConfigInfo } from '@/types/chain';
import { BackendChainsConfig } from '@/types/config';
import { getChainConfigInfo } from '@/utils/chainConfig';

/**
 * available chain id array
 */
let SUPPORTED_CHAIN_ID = [CHAIN_ID.BLAST, CHAIN_ID.BASE];

if (process.env.REACT_APP_AVAILABLE_CHAIN_ID) {
  const arr = process.env.REACT_APP_AVAILABLE_CHAIN_ID.split(',');
  if (arr && arr.length > 0) {
    SUPPORTED_CHAIN_ID = arr.map((chainIdStr) => Number(chainIdStr));
  }
}

/**
 * display chain id array in [Select a Network] modal
 * Usually remove the test network
 */
let DISPLAYABLE_CHAIN_ID = [CHAIN_ID.BASE, CHAIN_ID.BLAST];

if (process.env.REACT_APP_DISPLAYABLE_CHAIN_ID) {
  const arr = process.env.REACT_APP_DISPLAYABLE_CHAIN_ID.split(',');
  if (arr && arr.length > 0) {
    DISPLAYABLE_CHAIN_ID = arr.map((chainIdStr) => Number(chainIdStr));
  }
}

/**
 * default chain id for wrong network
 */
const DEFAULT_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? '1');

const chainConfigs: {
  [chainId: number]: ISynfConfigInfo;
} = {
  [CHAIN_ID.LINEA]: getChainConfigInfo(CHAIN_ID.LINEA),
  [CHAIN_ID.BLASTSEPOLIA]: getChainConfigInfo(CHAIN_ID.BLASTSEPOLIA),
  [CHAIN_ID.BLAST]: getChainConfigInfo(CHAIN_ID.BLAST),
  [CHAIN_ID.ARBITRUM]: getChainConfigInfo(CHAIN_ID.ARBITRUM),
  [CHAIN_ID.BASE]: getChainConfigInfo(CHAIN_ID.BASE),
};

const DAPP_CHAIN_CONFIGS: {
  [chainId: number]: IDappChainConfig;
} = {
  [CHAIN_ID.LINEA]: getDappChainConfig(CHAIN_ID.LINEA, linea),
  [CHAIN_ID.BLASTSEPOLIA]: getDappChainConfig(CHAIN_ID.BLASTSEPOLIA, blastSepolia),
  [CHAIN_ID.BLAST]: getDappChainConfig(CHAIN_ID.BLAST, blast),
  [CHAIN_ID.ARBITRUM]: getDappChainConfig(CHAIN_ID.ARBITRUM, arbitrum),
  [CHAIN_ID.BASE]: getDappChainConfig(CHAIN_ID.BASE, base),
};

export const getAllDisplayableChainMarketCustomPairs = (backendChainsConfig: BackendChainsConfig) =>
  DISPLAYABLE_CHAIN_ID.reduce(
    (prev, curr) => {
      return [
        ...prev,
        ...(backendChainsConfig[curr]?.marketCustomPairs || []).map((pairInfo) => ({ ...pairInfo, chainId: curr })),
      ];
    },
    [] as {
      id: string;
      title: string;
      pairs: string[];
      chainId: CHAIN_ID;
    }[],
  );
export const quoteTokenSymbolColors = [
  '#00BFBF',
  '#00CC99',
  '#1B9844',
  '#30E84F',
  '#396A93',
  '#4D88FF',
  '#5555F6',
  '#5C5CD6',
  '#6495ED',
  '#66CCFF',
  '#7C67E4',
  '#88CC00',
  '#8FBC8F',
  '#99BBFF',
  '#BF40BF',
  '#C270C2',
  '#CCAA00',
  '#F98686',
  '#FF69B4',
  '#FF8C00',
  '#FF4500',
  '#FFD700',
  '#ADFF2F',
  '#7FFF00',
  '#32CD32',
  '#00FA9A',
  '#00CED1',
  '#4682B4',
  '#4169E1',
  '#8A2BE2',
  '#9400D3',
  '#9932CC',
  '#8B008B',
  '#FF1493',
  '#FF6347',
  '#FF7F50',
  '#FFDAB9',
  '#EEE8AA',
  '#98FB98',
  '#AFEEEE',
  '#DDA0DD',
];

const CHAIN_NAME_ID: { [key: string]: number } = {
  base: CHAIN_ID.BASE,
  blast: CHAIN_ID.BLAST,
  blastsepolia: CHAIN_ID.BLASTSEPOLIA,
  arbitrum: CHAIN_ID.ARBITRUM,
  linea: CHAIN_ID.LINEA,
  goerli: CHAIN_ID.GOERLI,
};

export const SHOW_BUILD_CHAIN = [CHAIN_ID.BLAST, CHAIN_ID.BASE];

export const MARKET_CHAIN_DISPLAY = [CHAIN_ID.BASE];

export {
  CHAIN_ID,
  CHAIN_NAME_ID,
  chainConfigs,
  DAPP_CHAIN_CONFIGS,
  DEFAULT_CHAIN_ID,
  DISPLAYABLE_CHAIN_ID,
  SUPPORTED_CHAIN_ID,
};

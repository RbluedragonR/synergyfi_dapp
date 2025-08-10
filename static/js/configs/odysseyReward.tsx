import blastGoldSrc from '@/assets/svg/icon_blast_gold.svg';
import blastPointsSrc from '@/assets/svg/icon_blast_points.svg';
import { ReactComponent as IconEigenlayerDarkTag } from '@/assets/svg/icon_eigenlayer_12.svg';
import eigenlayerPointsSrc from '@/assets/svg/icon_eigenlayer_points.svg';
import { ReactComponent as IconEtherFiPointsTag } from '@/assets/svg/icon_etherfi_12.svg';
import etherFiPointsSrc from '@/assets/svg/icon_etherfi_points.svg';
import { ReactComponent as IconEzPointsDarkTag } from '@/assets/svg/icon_ezpoints_12.svg';
import kelpMilesSrc from '@/assets/svg/icon_kelp_miles.svg';
import OOPointsSrc from '@/assets/svg/icon_o_o_points.svg';
import ezPointsSrc from '@/assets/svg/icon_renzo_ezpoints.svg';
import { ReactComponent as IconKelpTag } from '@/assets/svg/kelp-icon.svg';
import { IOdysseyChainConfig } from '@/types/odyssey';
import { CHAIN_ID } from '@derivation-tech/context';
export enum OdysseyRewardId {
  OO_POINTS = 'OO_POINTS',
  BLAST_POINTS = 'BLAST_POINTS',
  BLAST_GOLD = 'BLAST_GOLD',
  EZ_POINTS = 'EZ_POINTS',
  EIGEN_LAYER_POINTS = 'EIGEN_LAYER_POINTS',
  KELP_MILES = 'KELP_MILES',
  ETHER_FI_POINTS = 'ETHER_FI_POINTS',
}

export const getMultiplerForNonBlastAndOoPointReward = (
  config: IOdysseyChainConfig,
  quoteSymbol: string,
  id: OdysseyRewardId,
): number | undefined => {
  return config?.nonBlastAndOoPointReward?.[id]?.quotes.find((item) => item.symbol === quoteSymbol && item.multiplier)
    ?.multiplier;
};

export const odysseyRewardInfos: {
  [id in OdysseyRewardId]: {
    iconSvgNodeForTag: React.ReactNode;
    tagBgColor?: string;
    textColor?: string;
    iconSrcForRewardCard: string;
    checkIsDisplay?: (config: IOdysseyChainConfig, quoteSymbol: string, chainId?: CHAIN_ID) => boolean;
    order: number;
  };
} = {
  [OdysseyRewardId.OO_POINTS]: {
    iconSrcForRewardCard: OOPointsSrc,
    order: 0,
    iconSvgNodeForTag: <></>,
  },
  [OdysseyRewardId.BLAST_POINTS]: {
    iconSrcForRewardCard: blastPointsSrc,
    checkIsDisplay: (config, quoteSymbol, chainId) => {
      return config?.earnBlastPointQuotes?.includes(quoteSymbol) && chainId === CHAIN_ID.BLAST;
    },
    order: 1,
    iconSvgNodeForTag: <></>,
  },
  [OdysseyRewardId.BLAST_GOLD]: {
    iconSrcForRewardCard: blastGoldSrc,
    order: 2,
    iconSvgNodeForTag: <></>,
    checkIsDisplay: (config, quoteSymbol, chainId) => {
      return config?.earnBlastPointQuotes?.includes(quoteSymbol) && chainId === CHAIN_ID.BLAST;
    },
  },

  [OdysseyRewardId.EZ_POINTS]: {
    iconSrcForRewardCard: ezPointsSrc,
    checkIsDisplay: (config, quoteSymbol) => {
      return getMultiplerForNonBlastAndOoPointReward(config, quoteSymbol, OdysseyRewardId.EZ_POINTS) !== undefined;
    },
    order: 3,
    iconSvgNodeForTag: <IconEzPointsDarkTag />,
    tagBgColor: '#8c0',
  },
  [OdysseyRewardId.ETHER_FI_POINTS]: {
    iconSrcForRewardCard: etherFiPointsSrc,
    checkIsDisplay: (config, quoteSymbol) => {
      return (
        getMultiplerForNonBlastAndOoPointReward(config, quoteSymbol, OdysseyRewardId.ETHER_FI_POINTS) !== undefined
      );
    },
    order: 4,
    iconSvgNodeForTag: <IconEtherFiPointsTag />,
    tagBgColor: 'linear-gradient(131deg, #af5bf9 26.01%, #557ae9 62.03%)',
  },
  [OdysseyRewardId.KELP_MILES]: {
    iconSrcForRewardCard: kelpMilesSrc,
    checkIsDisplay: (config, quoteSymbol) => {
      return getMultiplerForNonBlastAndOoPointReward(config, quoteSymbol, OdysseyRewardId.KELP_MILES) !== undefined;
    },
    order: 5,
    iconSvgNodeForTag: <IconKelpTag />,
    tagBgColor: '#009293',
  },
  [OdysseyRewardId.EIGEN_LAYER_POINTS]: {
    iconSrcForRewardCard: eigenlayerPointsSrc,
    checkIsDisplay: (config, quoteSymbol) => {
      return (
        getMultiplerForNonBlastAndOoPointReward(config, quoteSymbol, OdysseyRewardId.EIGEN_LAYER_POINTS) !== undefined
      );
    },
    order: 6,
    iconSvgNodeForTag: <IconEigenlayerDarkTag />,
    tagBgColor: '#9494d1',
  },
};

export const nonBlastAndOoPointRewardIds: OdysseyRewardId[] = Object.values(OdysseyRewardId)
  .filter((id) => ![OdysseyRewardId.BLAST_GOLD, OdysseyRewardId.BLAST_POINTS, OdysseyRewardId.OO_POINTS].includes(id))
  .sort((aId, bId) => {
    return odysseyRewardInfos[aId].order - odysseyRewardInfos[bId].order;
  });

import { ReactComponent as DefaultDexV2Icon } from '@/assets/svg/oracle/DEXV2/default.svg';
import { ReactComponent as UniDexIcon } from '@/assets/svg/oracle/DEXV2/uni.svg';
import { ReactComponent as DefaultEmergingcIcon } from '@/assets/svg/oracle/EMG/default.svg';
import { ReactComponent as DefaultLinkIcon } from '@/assets/svg/oracle/LINK/default.svg';
import { ReactComponent as DefaultPythIcon } from '@/assets/svg/oracle/PYTH/default.svg';
import { CHAIN_ID } from '@derivation-tech/context';
import { MarketType } from '@synfutures/sdks-perp';
type MarketOraclesInfo = {
  [id in MarketType]: { oracleIcon: JSX.Element | null; oracleNameForI18nTooltip: string };
};

export const i18nIdOracleTooltipMap = {
  [MarketType.LINK]: 'common.tradePage.oracleTooltip.LINK',
  [MarketType.DEXV2]: 'common.tradePage.oracleTooltip.DEXV2',
  [MarketType.PYTH]: 'common.tradePage.oracleTooltip.PYTH',
  [MarketType.EMG]: 'common.tradePage.oracleTooltip.EMG',
};

const defaultMarketOraclesInfo: MarketOraclesInfo = {
  [MarketType.LINK]: {
    oracleIcon: <DefaultLinkIcon />,
    oracleNameForI18nTooltip: 'Chainlink',
  },
  [MarketType.DEXV2]: {
    oracleIcon: <DefaultDexV2Icon />,
    oracleNameForI18nTooltip: 'DEX',
  },
  [MarketType.PYTH]: {
    oracleIcon: <DefaultPythIcon />,
    oracleNameForI18nTooltip: 'PYTH',
  },
  [MarketType.EMG]: {
    oracleIcon: <DefaultEmergingcIcon />,
    oracleNameForI18nTooltip: 'EMERGING',
  },
};

const marketOraclesInfoInChains: { [id in CHAIN_ID]?: MarketOraclesInfo } = {
  [CHAIN_ID.BASE]: {
    ...defaultMarketOraclesInfo,
    [MarketType.DEXV2]: {
      oracleIcon: <UniDexIcon />,
      oracleNameForI18nTooltip: 'Uniswap',
    },
  },
};

export const getMarketOraclesInfo = (chainId: CHAIN_ID): MarketOraclesInfo => {
  return marketOraclesInfoInChains[chainId] || defaultMarketOraclesInfo;
};

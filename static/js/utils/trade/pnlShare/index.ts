import { CHAIN_ID } from '@/constants/chain';
import { PnlLevel } from '@/constants/trade/pnlShare';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import _ from 'lodash';

export type TSynSharePnlIdTimestampMaps = {
  [chainId in string]?: {
    [userAddress in string]?: { [pairId in string]?: { [shareId in string]?: number } };
  };
  // number refines to timestamp
};
export const filterSynSharePnlIdTimestampMaps = (oldSynSharePnlIdTimestampMaps: TSynSharePnlIdTimestampMaps) => {
  const timestamp = Date.now();
  const newSynSharePnlIdTimestampMaps = _.cloneDeep(oldSynSharePnlIdTimestampMaps);
  _.forOwn(newSynSharePnlIdTimestampMaps, (userAddresses, chainId) => {
    _.forOwn(userAddresses, (pairs, userAddress) => {
      _.forOwn(pairs, (shares, pairId) => {
        _.forOwn(shares, (prevTimestamp, shareId) => {
          const differenceInMinutes = prevTimestamp ? Math.abs(prevTimestamp - timestamp) / (1000 * 60) : null;
          if ((differenceInMinutes !== null && differenceInMinutes >= 30) || !prevTimestamp) {
            delete pairs[pairId][shareId];
          }
        });
        // Clean up empty objects
        if (_.isEmpty(pairs[pairId])) {
          delete userAddresses?.[userAddress]?.[pairId];
        }
      });
      if (_.isEmpty(userAddresses?.[userAddress])) {
        delete newSynSharePnlIdTimestampMaps[chainId]?.[userAddress];
      }
    });
    if (_.isEmpty(newSynSharePnlIdTimestampMaps[chainId])) {
      delete newSynSharePnlIdTimestampMaps[chainId];
    }
  });
  return newSynSharePnlIdTimestampMaps;
};
export enum OptionId {
  leverage = 'leverage',
  pnlAmount = 'pnlAmount',
  price = 'price',
}
export const pnlShareSettingStorageKey = 'SYN_SHARE_PNL_SETTING_ID_TIMESTAMP_MAP_0.0.1';
const defaultPnlShareSetting: {
  [id in OptionId]: boolean;
} = {
  [OptionId.leverage]: true,
  [OptionId.pnlAmount]: true,
  [OptionId.price]: true,
};
export type PnlShareSettingProps = {
  [id in OptionId]: boolean;
};
export const getInitPnlShareSetting = () => {
  const pnlShareSettingStr = localStorage.getItem(pnlShareSettingStorageKey);
  if (pnlShareSettingStr === null) {
    localStorage.setItem(pnlShareSettingStorageKey, JSON.stringify(defaultPnlShareSetting));
    return defaultPnlShareSetting;
  }
  return JSON.parse(pnlShareSettingStr) as PnlShareSettingProps;
};

export const getIconPath = (chainId: CHAIN_ID) => {
  try {
    return require(`../../../assets/svg/chain/shareIcon/${chainId}.svg`);
  } catch (error) {
    console.log('Please add src/assets/svg/chain/shareIcon');
    return '';
  }
};

export const getPnlLevel = (pnlRatio: WrappedBigNumber | undefined) => {
  if (!pnlRatio) return PnlLevel.gainLte50;
  if (pnlRatio.gte(0)) {
    return pnlRatio.gt(100 / 100)
      ? PnlLevel.gainGt100
      : pnlRatio.gt(50 / 100) && pnlRatio.lte(100 / 100)
      ? PnlLevel.gainGt50Lte100
      : PnlLevel.gainLte50;
  }
  if (pnlRatio.lt(0)) {
    return pnlRatio.abs().gt(50 / 100)
      ? PnlLevel.lossGt50
      : pnlRatio.abs().gt(10 / 100) && pnlRatio.abs().lte(50 / 100)
      ? PnlLevel.lossGt10Lte50
      : PnlLevel.lossLte10;
  }
  return PnlLevel.gainLte50;
};

export const getTokenImgPath = (tokenSymbol: string, level: PnlLevel) => {
  const pnlType = level.includes('gain') ? 'gain' : 'loss';
  try {
    return {
      bodySrc: require(`../../../components/Card/PnlShareCard/asset/level/${level}.png`),
      tokenSrc: require(`../../../components/Card/PnlShareCard/asset/level/token/${pnlType}/${tokenSymbol.toUpperCase()}.png`),
    };
  } catch (error) {
    console.log(
      `Please add ../../../components/Card/PnlShareCard/asset/level/${level}.png ../../../components/Card/PnlShareCard/asset/level/token/${pnlType}/default.png`,
    );
    return {
      bodySrc: require(`../../../components/Card/PnlShareCard/asset/level/${level}.png`),
      tokenSrc: require(`../../../components/Card/PnlShareCard/asset/level/token/${pnlType}/default.png`),
    };
  }
};

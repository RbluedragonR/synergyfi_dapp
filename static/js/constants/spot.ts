import { PoolType as SynPoolType } from '@synfutures/sdks-aggregator';
import _ from 'lodash';
import Aero from './assets/icon_aerodrome.png';
import ALB from './assets/icon_crypto_alb.png';
import Uni from './assets/icon_oracle_dexv2_uni.svg';
import Pancake from './assets/icon_pancakeswap.svg';
import Sushi from './assets/icon_sushiswap.svg';

export enum SPOT_KLINE_INTERVAL {
  H_1 = '1h',
  D_1 = '1d',
  W_1 = '1w',
}
export const SPOT_KLINE_INTERVAL_TICK_GAP = {
  // 5 min
  [SPOT_KLINE_INTERVAL.H_1]: 1000 * 60 * 5,
  // 2 hours
  [SPOT_KLINE_INTERVAL.D_1]: 1000 * 60 * 60 * 2,
  // 1 Day
  [SPOT_KLINE_INTERVAL.W_1]: 1000 * 60 * 60 * 24,
};

export const getSpotApiUrl = (url: string) => `/v3/public/aggregator/${url}`;

const CustomPoolType = {
  OTHER: 100,
} as const;

export const SpotDexType = { ...SynPoolType, ...CustomPoolType } as const;

export const spotDexInfos: { [id in number]?: { name: string; imageSrc: string; version: string; color: string } } = {
  [SpotDexType.PANCAKE_V3]: { name: 'Pancake V3', imageSrc: Pancake, version: 'V3', color: '#fa0' },
  [SpotDexType.UNISWAP_V3]: { name: 'Uniswap V3', imageSrc: Uni, version: 'V3', color: '#fc74fe' },
  [SpotDexType.UNISWAP_V2]: { name: 'Uniswap V2', imageSrc: Uni, version: 'V2', color: '#fc74fe' },
  [SpotDexType.AERODROME_V3]: { name: 'Aerodrome V3', imageSrc: Aero, version: 'V3', color: '#00bfbf' },
  [SpotDexType.AERODROME_V2]: { name: 'Aerodrome V2', imageSrc: Aero, version: 'V2', color: '#00bfbf' },
  [SpotDexType.SUSHISWAP_V3]: { name: 'Sushiswap V3', imageSrc: Sushi, version: 'V3', color: '#b54848' },
  [SpotDexType.ALB_V3]: { name: 'ALB V3', imageSrc: ALB, version: 'V3', color: '#4d88ff' },
  [SpotDexType.OTHER]: { name: 'Others', imageSrc: '', version: '', color: '#000000' },
};

export const spotStepRatio = [5, 10, 20];
export const defaultStepRatioOverride = 10;
// base block time
export const SPOT_DETAIL_POLLING_INTERVAL = 1000 * 8;
export const SPOT_SIMULATION_TIME_OUT = 1000 * 4;
export const SPOT_HISTORY_GRAPH = 'https://api.synfutures.com/thegraph/base-aggregator';
export const SPOT_BALANCE_BATCH_SIZE = 500;
export const PoolTypePools = _.orderBy(
  Object.values(SynPoolType).filter((value) => typeof value === 'number'),
  [(pool) => _.get(spotDexInfos, [pool])?.name.toLowerCase()],
  ['asc'],
);

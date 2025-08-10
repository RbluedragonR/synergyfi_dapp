import { LIQUIDITY_SORTER } from '@/types/liquidity';

export enum EARN_TYPE {
  ADD_LIQ = '0',
  REMOVE_LIQ = '1',
  DEPOSIT_NATIVE = '3',
}
export enum EARN_ADD_LIQ_SIMULATION_TYPE {
  BASE = '0',
  CHAIN = '1',
}

export const DEFAULT_ALPHA = 4;
export const DEFAULT_MIN_TICK_DELTA = 1000;
export const POOL_LIST_SCROLL_KEY = 'poolListScrollTop';
export const EARN_FILTER_ALL = 'all';
export const DEFUALT_SORTER = LIQUIDITY_SORTER.TVL;
export const IL_LOSS_BASE = 0.1;
export const IL_LOSS_VOLUME_THRESHOLD = 5000;

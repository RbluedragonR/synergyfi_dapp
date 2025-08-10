import { CHAIN_ID } from '@derivation-tech/context';
import { KlineData, KlineInterval, VolumeChartData } from '@synfutures/sdks-perp-datasource';
import _ from 'lodash';
import { useMemo } from 'react';

import { FETCHING_STATUS } from '@/constants';
import { WrappedPair } from '@/entities/WrappedPair';
import { useAppSelector } from '@/hooks';
import { IDepthChartData, ILiqChartConvertedData } from '@/types/chart';
import { getAdjustTradePrice } from '@/utils/pairs';
import { currentUTCExpiryTime } from '@/utils/timeUtils';

import {
  selectKlineChartData,
  selectKlineChartFetchingFirstTime,
  selectKlineChartFetchingStatus,
  selectLiqChartData,
  selectLiqChartDataStatus,
  selectOrderBookData,
  selectOrderBookDataStatus,
  selectVolumeChartData,
  selectVolumeChartDataFetchingStatus,
} from './slice';

export function useOrderBookData(
  chainId: CHAIN_ID | undefined,
  pair: WrappedPair | undefined,
  stepRatio: number | undefined,
): IDepthChartData | undefined {
  const data = useAppSelector(selectOrderBookData(chainId, pair?.id, stepRatio));

  return useMemo(() => {
    if (data && pair) {
      const [left, right] = [data.left, data.right];
      return {
        ...data,
        left: [
          // currentPoint,
          ...left.map((item) => {
            return {
              ...item,
              // price: getAdjustTradePrice(item.price, pair.isInverse).toNumber(),
              pair: pair,
            };
          }),
        ],
        right: [
          // currentPoint,
          ...right.map((item) => {
            return {
              ...item,
              // price: getAdjustTradePrice(item.price, pair.isInverse).toNumber(),
              pair: pair,
            };
          }),
        ],
      };
    }
  }, [data, pair]);
}
export function useOrderBookDataStatus(
  chainId: CHAIN_ID | undefined,
  pairId: string | undefined,
  stepRatio: number | undefined,
): FETCHING_STATUS {
  const status = useAppSelector(selectOrderBookDataStatus(chainId, pairId, stepRatio));
  return status;
}
export function useLiqChartData(
  chainId: CHAIN_ID | undefined,
  pair: WrappedPair | undefined,
): ILiqChartConvertedData[] | undefined {
  const data = useAppSelector(selectLiqChartData(chainId, pair?.id));
  return useMemo(() => {
    if (data && pair) {
      return _.orderBy(
        data.map((item) => {
          return {
            ...item,
            price: item.price,
            pair: pair,
          };
        }),
        ['price'],
      );
    }
    return [];
  }, [data, pair]);
}

export function useLiqChartDataStatus(chainId: CHAIN_ID | undefined, pairId: string | undefined): FETCHING_STATUS {
  const status = useAppSelector(selectLiqChartDataStatus(chainId, pairId));
  return status;
}

export function useVolumeDataStatus(
  chainId: CHAIN_ID | undefined,
  pairId: string | undefined,
): FETCHING_STATUS | undefined {
  const status = useAppSelector(selectVolumeChartDataFetchingStatus(chainId, pairId));
  return status;
}
export function useVolumeChartData(
  chainId: CHAIN_ID | undefined,
  pair: WrappedPair | undefined,
): VolumeChartData[] | undefined {
  const data = useAppSelector(selectVolumeChartData(chainId, pair?.id));

  return useMemo(() => {
    const list = _.clone(data) || [];
    // fill the missing data when the data is not enough
    if (list?.length > 0 && list.length < 30) {
      for (let i = 0; i < 30 - list.length; i++) {
        i > 0 &&
          list.unshift({
            timestamp: list[0].timestamp - 60 * 60 * 24 * i,
            baseVolume: 0,
            quoteVolume: 0,
          });
      }
    } else if (!list || list?.length === 0) {
      const timestamp = currentUTCExpiryTime();
      for (let i = 0; i < 30; i++) {
        list.unshift({
          timestamp: Math.floor(timestamp / 1000) - 60 * 60 * 24 * i,
          baseVolume: 0,
          quoteVolume: 0,
        });
      }
    }
    return list;
  }, [data]);
}

export function useKlineChartData(
  chainId: CHAIN_ID | undefined,
  pair: WrappedPair | undefined,
  chartDuration: KlineInterval,
): KlineData[] | undefined {
  const data = useAppSelector(selectKlineChartData(chainId, pair?.id, chartDuration));
  return useMemo(() => {
    if (data && pair) {
      return data.map((item) => {
        return {
          ...item,
          open: getAdjustTradePrice(item.open, pair.isInverse).toNumber(),
          close: getAdjustTradePrice(item.close, pair.isInverse).toNumber(),
          high: getAdjustTradePrice(item.high, pair.isInverse).toNumber(),
          low: getAdjustTradePrice(item.low, pair.isInverse).toNumber(),
          pair: pair,
        };
      });
    }
  }, [data, pair]);
}

export function useKlineChartFetchingStatus(
  chainId: CHAIN_ID | undefined,
  pairId: string | undefined,
  chartDuration: KlineInterval,
): FETCHING_STATUS {
  return useAppSelector(selectKlineChartFetchingStatus(chainId, pairId, chartDuration));
}

export function useKlineChartNotFirstTimeLoad(
  chainId: CHAIN_ID | undefined,
  pairId: string | undefined,
  chartDuration: KlineInterval,
): boolean {
  return useAppSelector(selectKlineChartFetchingFirstTime(chainId, pairId, chartDuration));
}

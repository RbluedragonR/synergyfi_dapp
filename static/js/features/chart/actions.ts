import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { IDepthChartData, ILiqChartConvertedData } from '@/types/chart';
import { currentUnixTime } from '@/utils/timeUtils';
import { CHAIN_ID, Context } from '@derivation-tech/context';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { KlineData, KlineInterval, VolumeChartData } from '@synfutures/sdks-perp-datasource';
import { BigNumber } from 'ethers';
import moment from 'moment';
import { fetchFuturesPairKlineChart } from '../futures/api';
import { AppState } from '../store';

export const getPairVolumeChartData = createAsyncThunk(
  'chart/getPairVolumeChartData',

  async ({
    pair,
    sdk,
    startTime,
    endTime,
  }: {
    chainId: CHAIN_ID;
    pair: WrappedPair;
    sdk: Context;
    startTime: number;
    endTime: number;
  }): Promise<VolumeChartData[] | undefined> => {
    try {
      const data = await sdk.perpDataSource.volume.getVolumeData(
        pair.rootInstrument.instrumentAddr,
        pair.expiry,
        startTime,
        endTime,
      );
      return data;
    } catch (e) {
      console.log('🚀 ~ file: actions.ts:69 ~ e:', e);
      return undefined;
    }
  },
);

export const getTVLAndVolumeChartData = createAsyncThunk(
  'chart/getTVLAndVolumeChartData',
  async (
    {
      chainId,
      pair,
      sdk,
    }: {
      chainId: CHAIN_ID;
      pair: WrappedPair;
      sdk: Context;
    },
    { dispatch },
  ): Promise<void> => {
    try {
      const utcNow = moment.utc();
      const startTs = utcNow.add(-30, 'day').unix();

      const endTs = currentUnixTime();
      await dispatch(getPairVolumeChartData({ chainId, pair, sdk, startTime: startTs, endTime: endTs }));
    } catch (e) {
      console.log('🚀 ~ file: actions.ts:95 ~ e:', e);
      throw e;
    }
  },
);

export const getPairLiqChartData = createAsyncThunk(
  'chart/getPairLiqChartData',
  async ({
    instrumentAddr,
    expiry,
    sdk,
  }: {
    chainId: CHAIN_ID;
    instrumentAddr: string;
    expiry: number;
    sdk: Context;
  }): Promise<ILiqChartConvertedData[] | undefined> => {
    try {
      const data = await sdk.perpDataSource.liquidity.getLiquidityData(instrumentAddr, expiry);
      return data.map((d) => ({
        ...d,
        liqNumber: WrappedBigNumber.from(d.liquidity).toNumber(),
      }));
    } catch (e) {
      console.log('🚀 ~ file: actions.ts:69 ~ e:', e);
      return undefined;
    }
  },
);

export const getPairOrderBookData = createAsyncThunk(
  'chart/getPairOrderBookData',
  async (
    {
      instrumentAddr,
      expiry,
      sdkContext,
      stepRatio,
      chainId,
      length,
    }: {
      chainId: CHAIN_ID;
      instrumentAddr: string;
      expiry: number;
      stepRatio?: number;
      length?: number;
      sdkContext: Context;
    },
    { getState },
  ): Promise<IDepthChartData | undefined> => {
    try {
      const {
        trade: { chainStepRatio },
      } = getState() as AppState;
      if (!stepRatio) {
        stepRatio = chainStepRatio[chainId];
      }
      if (!stepRatio || !instrumentAddr || !expiry) return;

      //used to be getDepthDataFromObserver
      const data = await sdkContext.perpDataSource.depth.getDepthData(instrumentAddr, expiry, stepRatio, length);
      // data.left = data.left.map((item) => {
      //   return {
      //     ...item,
      //     base: !item.base ? 0.0000000000000000001 : item.base,
      //   };
      // });
      return data;
    } catch (e) {
      console.error('🚀 ~ getPairOrderBookData e:', e);
      return undefined;
    }
  },
);

export const getPairKlineData = createAsyncThunk(
  'chart/getPairKlineData',
  async ({
    instrumentAddr,
    expiry,
    chartDuration,
    timeEnd,
    chainId,
  }: {
    chainId: CHAIN_ID;
    instrumentAddr: string;
    expiry: number;
    chartDuration: KlineInterval;
    timeEnd?: number;
    minTradeValue: BigNumber;
  }): Promise<KlineData[] | null> => {
    return fetchFuturesPairKlineChart({
      chainId,
      instrumentAddr,
      expiry,
      chartDuration,
      timeEnd,
    });
  },
);

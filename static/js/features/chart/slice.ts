import { createSlice } from '@reduxjs/toolkit';
import { KlineData, KlineInterval, VolumeChartData } from '@synfutures/sdks-perp-datasource';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { IDepthChartData, ILiqChartConvertedData } from '@/types/chart';
import { ListArrayStatus, getDefaultListArrayStatus, setFulfilledListArrayStatus } from '@/types/redux';
import { getPairId } from '@/utils/transform/transformId';

import { AppState } from '../store';
import { getPairKlineData, getPairLiqChartData, getPairOrderBookData, getPairVolumeChartData } from './actions';

export interface IAccountState {
  chainVolumeData: {
    [chainID: number]: {
      [pairId: string]: VolumeChartData[];
    };
  };
  chainVolumeDataFetchingStatus: {
    [chainID: number]: {
      [pairId: string]: FETCHING_STATUS;
    };
  };

  chainOrderBookData: {
    [chainID: number]: {
      [pairId: string]: { [stepRatio: string]: IDepthChartData };
    };
  };
  chainOrderBookDataFetchingStatus: {
    [chainID: number]: {
      [pairId: string]: { [stepRatio: string]: FETCHING_STATUS };
    };
  };
  chainLiqData: {
    [chainID: number]: {
      [pairId: string]: ILiqChartConvertedData[];
    };
  };
  chainLiqDataFetchingStatus: {
    [chainID: number]: {
      [pairId: string]: FETCHING_STATUS;
    };
  };
  chainKlineData: {
    [chainID: number]: {
      [pairId: string]: { [chartDuration in KlineInterval]: ListArrayStatus<KlineData> };
    };
  };
  chainKlineDataIsFirstTimeLoad: {
    [chainID: number]: {
      [pairId: string]: { [chartDuration in KlineInterval]: boolean };
    };
  };
}

const initialState: IAccountState = {
  chainVolumeData: {},
  chainVolumeDataFetchingStatus: {},
  chainLiqData: {},
  chainLiqDataFetchingStatus: {},
  chainOrderBookData: {},
  chainKlineData: {},
  chainKlineDataIsFirstTimeLoad: {},
  chainOrderBookDataFetchingStatus: {},
};

export const chartSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPairVolumeChartData.pending, (state, action) => {
        const { chainId, pair } = action.meta.arg;
        _.set(state.chainVolumeDataFetchingStatus, [chainId, pair.id], FETCHING_STATUS.FETCHING);
      })
      .addCase(getPairVolumeChartData.fulfilled, (state, action) => {
        const { chainId, pair } = action.meta.arg;
        if (action.payload) {
          _.set(state.chainVolumeData, [chainId, pair.id], action.payload);
        }
        _.set(state.chainVolumeDataFetchingStatus, [chainId, pair.id], FETCHING_STATUS.DONE);
      })
      .addCase(getPairLiqChartData.pending, (state, action) => {
        const { chainId, instrumentAddr, expiry } = action.meta.arg;
        _.set(state.chainLiqDataFetchingStatus, [chainId, getPairId(instrumentAddr, expiry)], FETCHING_STATUS.FETCHING);
      })
      .addCase(getPairLiqChartData.fulfilled, (state, action) => {
        const { chainId, instrumentAddr, expiry } = action.meta.arg;
        if (action.payload) {
          _.set(state.chainLiqData, [chainId, getPairId(instrumentAddr, expiry)], action.payload);
        }
        _.set(state.chainLiqDataFetchingStatus, [chainId, getPairId(instrumentAddr, expiry)], FETCHING_STATUS.DONE);
      })
      .addCase(getPairLiqChartData.rejected, (state, action) => {
        const { chainId, instrumentAddr, expiry } = action.meta.arg;
        _.set(state.chainLiqDataFetchingStatus, [chainId, getPairId(instrumentAddr, expiry)], FETCHING_STATUS.DONE);
      })
      .addCase(getPairOrderBookData.pending, (state, action) => {
        const { chainId, instrumentAddr, expiry, stepRatio } = action.meta.arg;
        const pairId = getPairId(instrumentAddr, expiry);
        if (!_.get(state.chainOrderBookDataFetchingStatus, [chainId, pairId, `${stepRatio}_step` || ''])) {
          _.set(
            state.chainOrderBookDataFetchingStatus,
            [chainId, pairId, `${stepRatio}_step` || ''],
            FETCHING_STATUS.FETCHING,
          );
        }
      })
      .addCase(getPairOrderBookData.fulfilled, (state, action) => {
        const { chainId, instrumentAddr, expiry, stepRatio } = action.meta.arg;
        if (action.payload) {
          const pairId = getPairId(instrumentAddr, expiry);
          _.set(state.chainOrderBookData, [chainId, pairId, `${stepRatio}_step` || ''], action.payload);
          _.set(
            state.chainOrderBookDataFetchingStatus,
            [chainId, pairId, `${stepRatio}_step` || ''],
            FETCHING_STATUS.DONE,
          );
        }
      })
      .addCase(getPairOrderBookData.rejected, (state, action) => {
        const { chainId, instrumentAddr, expiry, stepRatio } = action.meta.arg;
        const pairId = getPairId(instrumentAddr, expiry);
        _.set(
          state.chainOrderBookDataFetchingStatus,
          [chainId, pairId, `${stepRatio}_step` || ''],
          FETCHING_STATUS.DONE,
        );
      })
      .addCase(getPairKlineData.pending, (state, action) => {
        const { chainId, instrumentAddr, expiry, chartDuration } = action.meta.arg;
        const pairId = getPairId(instrumentAddr, expiry);
        if (!_.get(state.chainKlineData, [chainId, pairId, chartDuration])) {
          _.set(
            state.chainKlineData,
            [chainId, pairId, chartDuration],
            getDefaultListArrayStatus(FETCHING_STATUS.FETCHING),
          );
          _.set(state.chainKlineDataIsFirstTimeLoad, [chainId, pairId, chartDuration], true);
        } else {
          _.set(state.chainKlineData, [chainId, pairId, 'status'], FETCHING_STATUS.FETCHING);
          _.set(state.chainKlineDataIsFirstTimeLoad, [chainId, pairId, chartDuration], false);
        }
      })
      .addCase(getPairKlineData.fulfilled, (state, action) => {
        const { chainId, instrumentAddr, expiry, chartDuration } = action.meta.arg;
        if (action.payload) {
          const pairId = getPairId(instrumentAddr, expiry);
          const klineData = _.get(state.chainKlineData, [chainId, pairId, chartDuration, 'list'], []);
          const list = _.chain([...klineData, ...action.payload])
            .groupBy('timestamp')
            .map((group) => _.merge({}, ...group))
            .orderBy(['timestamp'], ['asc'])
            .value();

          _.set(state.chainKlineData, [chainId, pairId, chartDuration], setFulfilledListArrayStatus(list));
        }
      })
      .addCase(getPairKlineData.rejected, (state, action) => {
        const { chainId, instrumentAddr, expiry, chartDuration } = action.meta.arg;
        if (action) {
          const pairId = getPairId(instrumentAddr, expiry);
          _.set(state.chainKlineData, [chainId, pairId, chartDuration, 'status'], FETCHING_STATUS.DONE);
        }
      });
  },
});
export const selectLiqChartData =
  (chainId: number | undefined, pairId: string | undefined) =>
  (state: AppState): ILiqChartConvertedData[] =>
    _.get(state.chart.chainLiqData, [chainId || '', pairId || '']);
export const selectLiqChartDataStatus =
  (chainId: number | undefined, pairId: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.chart.chainLiqDataFetchingStatus, [chainId || '', pairId || ''], FETCHING_STATUS.INIT);
export const selectOrderBookData =
  (chainId: number | undefined, pairId: string | undefined, stepRatio: number | undefined) =>
  (state: AppState): IDepthChartData =>
    _.get(state.chart.chainOrderBookData, [chainId || '', pairId || '', `${stepRatio}_step` || '']);
export const selectOrderBookDataStatus =
  (chainId: number | undefined, pairId: string | undefined, stepRatio: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(
      state.chart.chainOrderBookDataFetchingStatus,
      [chainId || '', pairId || '', `${stepRatio}_step` || ''],
      FETCHING_STATUS.INIT,
    );
export const selectVolumeChartData =
  (chainId: number | undefined, pairId: string | undefined) =>
  (state: AppState): VolumeChartData[] =>
    _.get(state.chart.chainVolumeData, [chainId || '', pairId || '']);
export const selectVolumeChartDataFetchingStatus =
  (chainId: number | undefined, pairId: string | undefined) =>
  (state: AppState): FETCHING_STATUS | undefined =>
    _.get(state.chart.chainVolumeDataFetchingStatus, [chainId || '', pairId || '']);

export const selectKlineChartData =
  (chainId: number | undefined, pairId: string | undefined, chartDuration: KlineInterval) =>
  (state: AppState): KlineData[] =>
    _.get(state.chart.chainKlineData, [chainId || '', pairId || '', chartDuration, 'list']);

export const selectKlineChartFetchingStatus =
  (chainId: number | undefined, pairId: string | undefined, chartDuration: KlineInterval) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.chart.chainKlineData, [chainId || '', pairId || '', chartDuration, 'status'], FETCHING_STATUS.INIT);

export const selectKlineChartFetchingFirstTime =
  (chainId: number | undefined, pairId: string | undefined, chartDuration: KlineInterval) =>
  (state: AppState): boolean =>
    _.get(state.chart.chainKlineDataIsFirstTimeLoad, [chainId || '', pairId || '', chartDuration], true);

export default chartSlice.reducer;

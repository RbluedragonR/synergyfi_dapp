import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { HISTORY_RANGE } from '@/constants/history';
import { IAccountBalanceHistory, IFundingHistory, ILiquidityHistory, ITransferHistory } from '@/types/graph';
import { ItemStatus, ListArrayStatus, getDefaultItemStatus, setFulfilledItemStatus } from '@/types/redux';

import { DailyVolumeDetail } from '@/types/portfolio';
import { AppState } from '../store';
import { getOpenOrderCreateTime, resetHistory, setHistoryRange } from './actions';

export type TOpenOrderCreateTimeMap = {
  [instrumentAddrTickSizeId in string]: number;
};
export interface IGraphState {
  historyRange: HISTORY_RANGE;
  chainOpenOrderCreateTime: {
    [chainID: number]: {
      [userAddr: string]: ItemStatus<TOpenOrderCreateTimeMap>;
    };
  };
  chainFundingHistory: {
    [chainID: number]: {
      [userAddr: string]: ListArrayStatus<IFundingHistory>;
    };
  };
  chainTransferHistory: {
    [chainID: number]: {
      [userAddr: string]: ListArrayStatus<ITransferHistory>;
    };
  };
  chainLiquidityHistory: {
    [chainID: number]: {
      [userAddr: string]: ListArrayStatus<ILiquidityHistory>;
    };
  };
  chainAccountBalanceHistory: {
    [chainID: number]: {
      [userAddr: string]: ListArrayStatus<IAccountBalanceHistory>;
    };
  };
  chainDailyVolumeDetails: {
    [chainID: number]: {
      [userAddr: string]: ListArrayStatus<DailyVolumeDetail>;
    };
  };
}
const initialState: IGraphState = {
  historyRange: HISTORY_RANGE.D_7,
  chainOpenOrderCreateTime: {},
  chainFundingHistory: {},
  chainTransferHistory: {},
  chainLiquidityHistory: {},
  chainAccountBalanceHistory: {},
  chainDailyVolumeDetails: {},
};

export const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetHistory, (state, {}) => {
      state.historyRange = HISTORY_RANGE.D_7;
    });
    builder.addCase(setHistoryRange, (state, { payload }) => {
      state.historyRange = payload;
    });
    builder.addCase(getOpenOrderCreateTime.pending, (state, { meta }) => {
      const { chainId, userAddr } = meta.arg;
      if (!_.get(state.chainOpenOrderCreateTime, [chainId, userAddr])) {
        _.set(state.chainOpenOrderCreateTime, [chainId, userAddr], getDefaultItemStatus(FETCHING_STATUS.FETCHING));
      }
    });
    builder
      .addCase(getOpenOrderCreateTime.fulfilled, (state, { meta, payload }) => {
        const { chainId, userAddr } = meta.arg;
        if (payload) {
          const prevState = _.get(state.chainOpenOrderCreateTime, [chainId, userAddr]);
          _.set(
            state.chainOpenOrderCreateTime,
            [chainId, userAddr],
            setFulfilledItemStatus(
              payload.reduce(
                (prev, curr) => {
                  return {
                    ...prev,
                    [`${curr.instrumentAddr}_${curr.tick}_${curr.size.toString()}`.toLowerCase()]:
                      curr.createdTimestamp,
                  };
                },
                { ...prevState },
              ),
            ),
          );
        }
      })
      .addCase(getOpenOrderCreateTime.rejected, (state, { meta }) => {
        const { chainId, userAddr } = meta.arg;
        _.set(state.chainOpenOrderCreateTime, [chainId, userAddr, 'status'], FETCHING_STATUS.DONE);
      });
  },
});

export const selectGraphState = (state: AppState): IGraphState => state.graph;

export const selectOpenOrderCreateTime =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): TOpenOrderCreateTimeMap | undefined =>
    (
      _.get(
        state.graph.chainOpenOrderCreateTime,
        [chainId || '', userAddr || ''],
        [],
      ) as ItemStatus<TOpenOrderCreateTimeMap>
    ).item;

export const selectHistoryRange = (state: AppState): HISTORY_RANGE => state.graph.historyRange;

export const selectChainDailyVolumeDetailsStatus =
  (chainId: number | undefined, userAddr: string | undefined): ((state: AppState) => FETCHING_STATUS) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.graph.chainDailyVolumeDetails, [chainId || '', userAddr || '', 'status'], FETCHING_STATUS.INIT);

export const selectChainDailyVolumeDetails =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): DailyVolumeDetail[] =>
    _.get(state.graph.chainDailyVolumeDetails, [chainId || '', userAddr || '', 'list'], []);

export default graphSlice.reducer;

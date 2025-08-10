import { createSlice } from '@reduxjs/toolkit';
import { BigNumber } from 'ethers';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { IMetaInstrument } from '@/types/pair';
import { getDefaultListStatus, ListStatus, setFulfilledListStatus } from '@/types/redux';
import { ISpotState } from '@/types/spot';
import {} from '@/types/trade';
import { BlockyResult } from '@/types/worker';

import { AppState } from '../store';
import {
  parseInstrumentToMeta,
  setFuturesCore,
  updateFuturesFromChain,
  updateInstrumentSpotRawPriceMapFromChain,
  updateInstrumentSpotStateMapFromChain,
} from './actions';

export interface IFuturesState {
  chainMetaFutures: {
    [chainID: number]: ListStatus<IMetaInstrument>;
  };
  chainInstrumentSpotStateMap: {
    [chainID: number]: { [instrumentAddr: string]: BlockyResult<ISpotState> };
  };
  chainInstrumentSpotRawPriceMap: {
    [chainID: number]: { [instrumentAddr: string]: BlockyResult<BigNumber> };
  };
}

const initialState: IFuturesState = {
  chainMetaFutures: {},
  chainInstrumentSpotStateMap: {},
  chainInstrumentSpotRawPriceMap: {},
};

export const futuresSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setFuturesCore, (state, { payload }) => {
        const underlying = _.get(state.chainMetaFutures, [payload.chainId, 'list', payload.underlyingId]);
        _.set(
          state.chainMetaFutures,
          [payload.chainId, 'list', payload.underlyingId],
          _.merge({}, underlying, payload.underlying),
        );
      })
      .addCase(parseInstrumentToMeta.pending, (state, action) => {
        const { arg } = action.meta;
        if (!state.chainMetaFutures[arg.chainId]) {
          state.chainMetaFutures[arg.chainId] = getDefaultListStatus(FETCHING_STATUS.FETCHING);
        }
      })
      .addCase(parseInstrumentToMeta.fulfilled, (state, action) => {
        const { arg } = action.meta;
        let futuresRes = {} as Record<string, IMetaInstrument>;
        if (action.payload) {
          const { futuresMap, blockInfo } = action.payload;

          const futuresStates = _.get(state.chainMetaFutures, [arg.chainId, 'list']);
          if (futuresStates?.length) {
            const topFutures = Object.values(futuresStates)[0];
            // if the block height is lower than the current block height, we don't need to update the state
            if ((topFutures?.blockInfo?.height || 0) > (blockInfo?.height || 0)) {
              return;
            }
          }

          futuresRes = _.merge({}, futuresStates, futuresMap);
        }
        _.set(state.chainMetaFutures, [arg.chainId], setFulfilledListStatus(futuresRes));
      })
      .addCase(parseInstrumentToMeta.rejected, (state, action) => {
        const { arg } = action.meta;
        _.set(state.chainMetaFutures, [arg.chainId, 'status'], FETCHING_STATUS.DONE);
      })
      .addCase(updateFuturesFromChain.fulfilled, (state, action) => {
        const { arg } = action.meta;
        let futuresRes = {} as Record<string, IMetaInstrument>;
        if (action.payload) {
          const { futuresMap, blockInfo } = action.payload;

          const futuresStates = _.get(state.chainMetaFutures, [arg.chainId, 'list']);
          if (futuresStates?.length) {
            const topFutures = Object.values(futuresStates)[0];
            // if the block height is lower than the current block height, we don't need to update the state
            if ((topFutures?.blockInfo?.height || 0) > (blockInfo?.height || 0)) {
              return;
            }
          }

          futuresRes = _.merge({}, futuresStates, futuresMap);
        }
        _.set(state.chainMetaFutures, [arg.chainId], setFulfilledListStatus(futuresRes));
      })
      .addCase(updateInstrumentSpotStateMapFromChain.fulfilled, (state, action) => {
        const { arg } = action.meta;
        if (action.payload) {
          const instrumentSpotStateMap = action.payload;
          const spotStateMap = _.get(state.chainInstrumentSpotStateMap, [arg.chainId], {});
          _.set(state.chainInstrumentSpotStateMap, [arg.chainId], _.merge({}, spotStateMap, instrumentSpotStateMap));
        }
      })
      .addCase(updateInstrumentSpotRawPriceMapFromChain.fulfilled, (state, action) => {
        const { arg } = action.meta;
        if (action.payload) {
          const instrumentSpotRawPriceMap = action.payload;
          const spotRawPriceMap = _.get(state.chainInstrumentSpotRawPriceMap, [arg.chainId], {});
          _.set(
            state.chainInstrumentSpotRawPriceMap,
            [arg.chainId],
            _.merge({}, spotRawPriceMap, instrumentSpotRawPriceMap),
          );
        }
      });
  },
});

export const selectChainMetaFutures =
  (chainId: number | undefined) =>
  (state: AppState): Record<string, IMetaInstrument> =>
    _.get(state.futures.chainMetaFutures, [chainId || '', 'list'], {});

export const selectChainMetaFuturesStatus =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS | undefined =>
    _.get(state.futures.chainMetaFutures, [chainId || '', 'status']);

export const selectInstrumentSpotState =
  (chainId: number | undefined, instrumentAddr: string | undefined) =>
  (state: AppState): BlockyResult<ISpotState> =>
    _.get(state.futures.chainInstrumentSpotStateMap, [chainId || '', instrumentAddr || '']);

export const selectInstrumentSpotRawPrice =
  (chainId: number | undefined, instrumentAddr: string | undefined) =>
  (state: AppState): BlockyResult<BigNumber> =>
    _.get(state.futures.chainInstrumentSpotRawPriceMap, [chainId || '', instrumentAddr || '']);

export default futuresSlice.reducer;

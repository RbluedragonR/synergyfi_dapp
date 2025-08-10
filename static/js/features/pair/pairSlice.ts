import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { IChainPairsFavorites, IMetaPair } from '@/types/pair';
import { ListStatus, getDefaultListStatus, setFulfilledListStatus } from '@/types/redux';

import { parseInstrumentToMeta, updateFuturesFromChain } from '../futures/actions';
import { AppState } from '../store';
import { setChainPairFavorites, setMetaPair } from './actions';
export interface IPairState {
  chainMetaPair: {
    [chainID: number]: ListStatus<IMetaPair>;
  };
  chainPairFavorites: IChainPairsFavorites;
}

const initialState: IPairState = {
  chainMetaPair: {},
  chainPairFavorites: {},
};

export const pairSlice = createSlice({
  name: 'pair',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setChainPairFavorites, (state, { payload }) => {
        state.chainPairFavorites = payload;
      })
      .addCase(setMetaPair, (state, { payload }) => {
        const pair = _.get(state.chainMetaPair, [payload.chainId, 'list', payload.pairId]);
        _.set(state.chainMetaPair, [payload.chainId, 'list', payload.pairId], _.merge({}, pair, payload.pair));
      })
      .addCase(parseInstrumentToMeta.pending, (state, action) => {
        const { arg } = action.meta;
        if (!state.chainMetaPair[arg.chainId]) {
          state.chainMetaPair[arg.chainId] = getDefaultListStatus(FETCHING_STATUS.FETCHING);
        }
      })
      .addCase(parseInstrumentToMeta.fulfilled, (state, action) => {
        const { arg } = action.meta;
        let pairsRes = {};
        if (action.payload) {
          const { pairMap } = action.payload;
          pairsRes = _.merge({}, _.get(state.chainMetaPair, [arg.chainId, 'list']), pairMap);
        }

        _.set(state.chainMetaPair, [arg.chainId], setFulfilledListStatus(pairsRes));
      })
      .addCase(parseInstrumentToMeta.rejected, (state, action) => {
        const { arg } = action.meta;
        _.set(state.chainMetaPair, [arg.chainId, 'status'], FETCHING_STATUS.DONE);
      })
      .addCase(updateFuturesFromChain.fulfilled, (state, action) => {
        const { arg } = action.meta;
        let pairsRes = {} as Record<string, IMetaPair>;
        if (action.payload) {
          const { pairMap, blockInfo } = action.payload;

          const pairsStates = _.get(state.chainMetaPair, [arg.chainId, 'list']);
          if (pairsStates?.length) {
            const topPair = Object.values(pairsStates)[0];
            // if the block height is lower than the current block height, we don't need to update the state
            if ((topPair?.blockInfo?.height || 0) > (blockInfo?.height || 0)) {
              return;
            }
          }

          pairsRes = _.merge({}, pairsStates, pairMap);
        }
        _.set(state.chainMetaPair, [arg.chainId, 'list'], pairsRes);
        _.set(state.chainMetaPair, [arg.chainId, 'status'], FETCHING_STATUS.DONE);
      });
  },
});

export const selectChainMetaPair =
  (chainId: number | undefined) =>
  (state: AppState): Record<string, IMetaPair> | undefined =>
    _.get(state.pair.chainMetaPair, [chainId || '', 'list'], {});

export const selectChainMetaPairStatus =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.pair.chainMetaPair, [chainId || '', 'status'], FETCHING_STATUS.INIT);

export const selectMetaPair =
  (chainId: number | undefined, pairId: string | undefined) =>
  (state: AppState): IMetaPair =>
    _.get(state.pair.chainMetaPair, [chainId || '', 'list', pairId || '']);

export const selectChainPairFavorites = (state: AppState): IChainPairsFavorites => state.pair.chainPairFavorites;

export default pairSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { EARN_TYPE } from '@/constants/earn';
import { TABLE_TYPES } from '@/constants/global';
import {
  getDefaultAddLiquidityFormState,
  IAddLiquidityFormState,
  IAddLiquiditySimulation,
  IRemoveLiquidityFormState,
  IRemoveLiquiditySimulation,
} from '@/types/earn';
import { ILiquidityFilters } from '@/types/liquidity';
import { getDefaultListArrayStatus, ListArrayStatus, setFulfilledListArrayStatus } from '@/types/redux';
import { getDefaultSimulation } from '@/types/trade';

import { AppState } from '../store';
import {
  addLiquidity,
  addLiquidityAsymmetricSimulate,
  addLiquiditySimulate,
  fetchEarnWhitelistConfig,
  removeLiquidity,
  removeLiquiditySimulate,
  resetLiquidityFormByChainId,
  setAddLiqFormState,
  setCurrentRange,
  setEarnFormType,
  setEarnPortfolioTab,
  setIsAddLiquidityInputRisky,
  setPoolFilters,
} from './action';

export interface IEarnState {
  chainFormType: {
    [chainId: number]: EARN_TYPE;
  };
  chainAddLiquidityFormState: {
    [chainId: number]: IAddLiquidityFormState;
  };
  chainPoolListFilters: {
    [chainId: number]: ILiquidityFilters;
  };
  chainRemoveLiquidityFormState: {
    [chainId: number]: IRemoveLiquidityFormState;
  };

  chainCurrentRangeId: {
    [chainId: number]: string;
  };

  chainAddLiquidityFormStatus: {
    [chainId: number]: FETCHING_STATUS;
  };

  chainRemoveLiquidityFormStatus: {
    [chainId: number]: FETCHING_STATUS;
  };

  chainAddLiquiditySimulation: {
    [chainId: number]: IAddLiquiditySimulation;
  };
  chainRemoveLiquiditySimulation: {
    [chainId: number]: IRemoveLiquiditySimulation;
  };
  chainRemoveLiquiditySuccess: {
    [chainId: number]: boolean;
  };
  chainAllowUnauthorizedLPs: {
    [chainId: number]: {
      [quoteAddr: string]: boolean;
    };
  };
  chainWhitelist: {
    [chainId: number]: {
      [quoteAddr: string]: ListArrayStatus<string>;
    };
  };
  earnPortfolioTab: TABLE_TYPES;
  isAddLiquidityInputRisky: boolean;
}

const initialState: IEarnState = {
  chainAddLiquidityFormState: {},
  chainAddLiquidityFormStatus: {},
  chainRemoveLiquidityFormState: {},
  chainRemoveLiquidityFormStatus: {},
  chainAddLiquiditySimulation: {},
  chainRemoveLiquiditySimulation: {},
  chainRemoveLiquiditySuccess: {},
  chainCurrentRangeId: {},
  chainFormType: {},
  chainAllowUnauthorizedLPs: {},
  chainWhitelist: {},
  chainPoolListFilters: {},
  earnPortfolioTab: TABLE_TYPES.LIQUIDITY,
  isAddLiquidityInputRisky: false,
};

export const earnSlice = createSlice({
  name: 'earn',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setIsAddLiquidityInputRisky, (state, { payload }) => {
        state.isAddLiquidityInputRisky = payload;
      })
      .addCase(resetLiquidityFormByChainId, (state, { payload }) => {
        _.set(state.chainAddLiquidityFormState, [payload.chainId], getDefaultAddLiquidityFormState(payload.chainId));
        _.set(state.chainAddLiquiditySimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainRemoveLiquiditySimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainFormType, [payload.chainId], EARN_TYPE.ADD_LIQ);
        _.set(state.chainCurrentRangeId, [payload.chainId], '');
      })
      .addCase(setAddLiqFormState, (state, { payload }) => {
        _.set(state.chainAddLiquidityFormState, [payload.chainId], payload);
      })
      .addCase(setEarnFormType, (state, { payload }) => {
        _.set(state.chainFormType, [payload.chainId], payload.formType);
        _.set(state.chainRemoveLiquiditySuccess, [payload.chainId], false);
      })
      .addCase(setEarnPortfolioTab, (state, { payload }) => {
        state.earnPortfolioTab = payload;
      })
      .addCase(setCurrentRange, (state, { payload }) => {
        _.set(state.chainCurrentRangeId, [payload.chainId], payload.rangeId);
        _.set(state.chainRemoveLiquiditySimulation, [payload.chainId], undefined);
      })
      .addCase(addLiquiditySimulate.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        if (payload) {
          _.set(state.chainAddLiquiditySimulation, [chainId], payload);
        }
      })
      .addCase(addLiquidityAsymmetricSimulate.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        if (payload) {
          _.set(state.chainAddLiquiditySimulation, [chainId], payload);
        }
      })
      .addCase(removeLiquiditySimulate.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        if (payload) {
          _.set(state.chainRemoveLiquiditySimulation, [chainId], payload);
        }
        _.set(state.chainRemoveLiquiditySuccess, [chainId], false);
      })
      .addCase(addLiquidity.pending, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainAddLiquidityFormStatus, [chainId], FETCHING_STATUS.FETCHING);
      })
      .addCase(addLiquidity.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        if (payload) {
          const oldState = _.get(state.chainAddLiquidityFormState, [chainId]);
          _.set(state.chainAddLiquidityFormState, [chainId], {
            ...getDefaultAddLiquidityFormState(chainId),
            alpha: oldState?.alpha,
          });
          _.set(state.chainCurrentRangeId, [chainId], '');
        }
        _.set(state.chainAddLiquidityFormStatus, [chainId], FETCHING_STATUS.DONE);
      })
      .addCase(addLiquidity.rejected, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainAddLiquidityFormStatus, [chainId], FETCHING_STATUS.DONE);
      })
      .addCase(removeLiquidity.pending, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainRemoveLiquidityFormStatus, [chainId], FETCHING_STATUS.FETCHING);
      })
      .addCase(removeLiquidity.fulfilled, (state, { meta, payload }) => {
        const { chainId, isMobile } = meta.arg;
        if (payload?.status === 1) {
          const simulate = _.get(state.chainRemoveLiquiditySimulation, [chainId]);
          _.set(state.chainRemoveLiquidityFormState, [chainId], getDefaultAddLiquidityFormState(chainId));
          _.set(state.chainRemoveLiquiditySuccess, [chainId], true);
          _.set(state.chainRemoveLiquiditySimulation, [chainId], undefined);
          if (simulate.data?.simulationMainPosition?.size?.eq(0) && !isMobile) {
            _.set(state.chainFormType, [chainId], EARN_TYPE.ADD_LIQ);
          }
          _.set(state.chainCurrentRangeId, [chainId], '');
        }
        _.set(state.chainRemoveLiquidityFormStatus, [chainId], FETCHING_STATUS.DONE);
      })
      .addCase(removeLiquidity.rejected, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainRemoveLiquidityFormStatus, [chainId], FETCHING_STATUS.DONE);
      })
      .addCase(fetchEarnWhitelistConfig.pending, (state, { meta }) => {
        const { chainId, quote } = meta.arg;
        const whilte = _.get(state.chainWhitelist, [chainId, quote.address]);
        if (!whilte) {
          _.set(state.chainWhitelist, [chainId, quote.address], getDefaultListArrayStatus(FETCHING_STATUS.FETCHING));
        }
      })
      .addCase(fetchEarnWhitelistConfig.fulfilled, (state, { meta, payload }) => {
        const { chainId, userAddr, quote } = meta.arg;
        if (payload) {
          _.set(state.chainAllowUnauthorizedLPs, [chainId, quote.address], payload.allowUnauthorizedLPs);
          const whiteList: string[] = _.get(state.chainWhitelist, [chainId, quote.address, 'list'], []);
          if (payload.isInWhiteList) {
            whiteList.push(userAddr);
          }
          _.set(state.chainWhitelist, [chainId, quote.address], setFulfilledListArrayStatus(whiteList));
        }
      })
      .addCase(setPoolFilters, (state, { payload }) => {
        if (payload) {
          _.set(state.chainPoolListFilters, [payload.chainId], payload);
        }
      });
  },
});
export default earnSlice.reducer;

export const selectEarnFormType =
  (chainId: number | undefined) =>
  (state: AppState): EARN_TYPE =>
    _.get(state.earn.chainFormType, [chainId || ''], EARN_TYPE.ADD_LIQ);

export const selectAddLiquiditySimulation =
  (chainId: number | undefined) =>
  (state: AppState): IAddLiquiditySimulation | undefined =>
    _.get(state.earn.chainAddLiquiditySimulation, [chainId || '']);
export const selectAddLiquidityFormStateByChainId =
  (chainId: number | undefined) =>
  (state: AppState): IAddLiquidityFormState =>
    _.get(state.earn.chainAddLiquidityFormState, [chainId || ''], { chainId });
export const selectAddLiquidityFormStatusByChainId =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.earn.chainAddLiquidityFormStatus, [chainId || ''], FETCHING_STATUS.DONE);

export const selectRemoveLiquiditySimulation =
  (chainId: number | undefined) =>
  (state: AppState): IRemoveLiquiditySimulation | undefined =>
    _.get(state.earn.chainRemoveLiquiditySimulation, [chainId || '']);
export const selectRemoveLiquidityFormStateByChainId =
  (chainId: number | undefined) =>
  (state: AppState): IRemoveLiquidityFormState =>
    _.get(state.earn.chainRemoveLiquidityFormState, [chainId || ''], { chainId });
export const selectRemoveLiquidityFormStatusByChainId =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.earn.chainRemoveLiquidityFormStatus, [chainId || ''], FETCHING_STATUS.DONE);
export const selectRemoveLiquiditySuccess =
  (chainId: number | undefined) =>
  (state: AppState): boolean =>
    _.get(state.earn.chainRemoveLiquiditySuccess, [chainId || '']);

export const selectCurrentRangeId =
  (chainId: number | undefined) =>
  (state: AppState): string =>
    _.get(state.earn.chainCurrentRangeId, [chainId || '']);

export const selectAllowUnauthorizedLPs =
  (chainId: number | undefined, quoteAddr: string | undefined) =>
  (state: AppState): boolean =>
    _.get(state.earn.chainAllowUnauthorizedLPs, [chainId || '', quoteAddr || '']);

export const selectWhiteList =
  (chainId: number | undefined, quoteAddr: string | undefined) =>
  (state: AppState): string[] =>
    _.get(state.earn.chainWhitelist, [chainId || '', quoteAddr || '', 'list'], []);

export const selectWhiteListFetchingStatus =
  (chainId: number | undefined, quoteAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.earn.chainWhitelist, [chainId || '', quoteAddr || '', 'status']);

export const selectChainPoolFilters =
  (chainId: number | undefined) =>
  (state: AppState): ILiquidityFilters | undefined =>
    _.get(state.earn.chainPoolListFilters, [chainId || '']);

export const selectEarnPortfolioTab = (state: AppState): TABLE_TYPES => state.earn.earnPortfolioTab;

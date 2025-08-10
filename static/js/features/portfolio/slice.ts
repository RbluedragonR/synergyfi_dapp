import { BlockInfo } from '@derivation-tech/context';
import { createSlice } from '@reduxjs/toolkit';
import { Pending } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { ItemStatus, getDefaultItemStatus, setFulfilledItemStatus } from '@/types/redux';
import { TokenInfo } from '@/types/token';

import { IAssetsBalance } from '@/types/assets';
import { IFundFlow, IFundFlowMap, ITotalVolume, TQuoteHistoryPrices } from '@/types/portfolio';
import { AppState } from '../store';
import {
  clickOpenSettledPairModal,
  getFundFlows,
  getQuoteHistoryPrices,
  getTokenPendingParams,
  getTotalVolume,
  getUserPendings,
  setPortfolioAssetSelect,
  setPortfolioDepositOrWithdrawOperateToken,
  settle,
} from './actions';

export interface IPortfolioState {
  portfolioAssetSelected: IAssetsBalance | null;
  chainSettlingPortfolioModalState: {
    [chainID: number]: {
      [userAddr: string]: ItemStatus<WrappedPortfolio>;
    };
  };
  chainFundFlows: {
    [chainId: number]: { [userAddr: string]: ItemStatus<IFundFlowMap> };
  };
  chainUserTotalVolume: {
    [chainId: number]: { [userAddr: string]: ItemStatus<ITotalVolume> };
  };
  quoteHistoryPrices: ItemStatus<TQuoteHistoryPrices | undefined>;
  chainBalanceOperateToken: {
    [chainID: number]: {
      [userAddr: string]: TokenInfo;
    };
  };
  chainClaimWithdrawOperateToken: {
    [chainID: number]: {
      [userAddr: string]: ItemStatus<TokenInfo>;
    };
  };
  chainWithdrawPendingConfig: {
    [chainID: number]: {
      pendingDuration: number;
    };
  };
  chainTokenWithdrawPendingParams: {
    [chainID: number]: {
      [tokenAddress: string]: TokenInfo & { threshold: BigNumber };
    };
  };
  chainUserTokenWithdrawPendings: {
    [chainID: number]: {
      [userAddr: string]: {
        [tokenAddress: string]: TokenInfo & { maxWithdrawable: BigNumber; pending: Pending; blockInfo?: BlockInfo };
      };
    };
  };
}

const initialState: IPortfolioState = {
  portfolioAssetSelected: null,
  chainSettlingPortfolioModalState: {},
  chainBalanceOperateToken: {},
  quoteHistoryPrices: getDefaultItemStatus(),
  chainUserTotalVolume: {},
  chainClaimWithdrawOperateToken: {},
  chainWithdrawPendingConfig: {},
  chainFundFlows: {},
  chainTokenWithdrawPendingParams: {},
  chainUserTokenWithdrawPendings: {},
};

export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setPortfolioAssetSelect, (state, action) => {
      state.portfolioAssetSelected = action.payload.assetSelected;
    });
    builder.addCase(clickOpenSettledPairModal.fulfilled, (state, action) => {
      const { arg } = action.meta;
      _.set(state.chainSettlingPortfolioModalState, [arg.chainId, arg.userAddr, 'item'], action.payload);
    });
    builder.addCase(settle.pending, (state, action) => {
      const { arg } = action.meta;
      _.set(state.chainSettlingPortfolioModalState, [arg.chainId, arg.userAddr, 'status'], FETCHING_STATUS.FETCHING);
    });
    builder.addCase(settle.fulfilled, (state, action) => {
      const { arg } = action.meta;
      _.set(state.chainSettlingPortfolioModalState, [arg.chainId, arg.userAddr, 'status'], FETCHING_STATUS.DONE);
      _.set(state.chainSettlingPortfolioModalState, [arg.chainId, arg.userAddr, 'item'], undefined);
    });
    builder.addCase(settle.rejected, (state, action) => {
      const { arg } = action.meta;
      _.set(state.chainSettlingPortfolioModalState, [arg.chainId, arg.userAddr, 'status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(setPortfolioDepositOrWithdrawOperateToken, (state, action) => {
      _.set(
        state.chainBalanceOperateToken,
        [action.payload.chainId, action.payload.userAddr],
        action.payload.tokenInfo,
      );
    });
    builder.addCase(getTokenPendingParams.fulfilled, (state, action) => {
      const { arg } = action.meta;
      if (action.payload) {
        if (action.payload.tokenWithThresholds) {
          action.payload.tokenWithThresholds.forEach((token) => {
            _.set(state.chainTokenWithdrawPendingParams, [arg.chainId, token.address], token);
          });
        }
        _.set(state.chainWithdrawPendingConfig, [arg.chainId, 'pendingDuration'], action.payload.pendingDuration);
      }
    });
    builder.addCase(getUserPendings.fulfilled, (state, action) => {
      const { arg } = action.meta;
      if (action.payload) {
        if (action.payload.tokenWithPendings) {
          action.payload.tokenWithPendings.forEach((token) => {
            const stateTokenInfo = _.get(state.chainUserTokenWithdrawPendings, [
              arg.chainId,
              arg.userAddr,
              token.address,
            ]);
            if (stateTokenInfo && (stateTokenInfo.blockInfo?.height || 0) > (action?.payload?.blockInfo?.height || 0))
              return;
            _.set(state.chainUserTokenWithdrawPendings, [arg.chainId, arg.userAddr, token.address], {
              ...token,
              blockInfo: action?.payload?.blockInfo,
            });
          });
        }
      }
    });
    builder.addCase(getFundFlows.pending, (state, { meta }) => {
      _.set(state.chainFundFlows, [meta.arg.chainId, meta.arg.userAddr, 'status'], FETCHING_STATUS.FETCHING);
    });
    builder.addCase(getFundFlows.fulfilled, (state, { meta, payload }) => {
      if (payload) {
        const current = _.get(state.chainFundFlows, [meta.arg.chainId, meta.arg.userAddr, 'item'], {});
        _.set(
          state.chainFundFlows,
          [meta.arg.chainId, meta.arg.userAddr],
          setFulfilledItemStatus(_.merge({}, current, payload)),
        );
      }
    });
    builder.addCase(getFundFlows.rejected, (state, { meta }) => {
      _.set(state.chainFundFlows, [meta.arg.chainId, meta.arg.userAddr, 'status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(getTotalVolume.pending, (state, { meta }) => {
      _.set(state.chainUserTotalVolume, [meta.arg.chainId, meta.arg.userAddr, 'status'], FETCHING_STATUS.FETCHING);
    });
    builder.addCase(getTotalVolume.fulfilled, (state, { meta, payload }) => {
      if (payload) {
        _.set(state.chainUserTotalVolume, [meta.arg.chainId, meta.arg.userAddr], setFulfilledItemStatus(payload));
      }
    });
    builder.addCase(getTotalVolume.rejected, (state, { meta }) => {
      _.set(state.chainUserTotalVolume, [meta.arg.chainId, meta.arg.userAddr, 'status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(getQuoteHistoryPrices.pending, (state, {}) => {
      _.set(state.quoteHistoryPrices, ['status'], FETCHING_STATUS.FETCHING);
    });
    builder.addCase(getQuoteHistoryPrices.fulfilled, (state, { payload }) => {
      if (payload) {
        state.quoteHistoryPrices = setFulfilledItemStatus(payload);
      }
    });
    builder.addCase(getQuoteHistoryPrices.rejected, (state, {}) => {
      _.set(state.quoteHistoryPrices, ['status'], FETCHING_STATUS.DONE);
    });
  },
});

export const selectFundFlows =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): IFundFlow[] | undefined =>
    _.values(_.get(state.portfolio.chainFundFlows, [chainId || '', userAddr || '', 'item']));
export const selectFundFlowsStatus =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.portfolio.chainFundFlows, [chainId || '', userAddr || '', 'status']);
export const selectTotalVolume =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): ITotalVolume | undefined =>
    _.get(state.portfolio.chainUserTotalVolume, [chainId || '', userAddr || '', 'item']);
export const selectTotalVolumeStatus =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.portfolio.chainUserTotalVolume, [chainId || '', userAddr || '', 'status']);

export const selectQuoteHistoryPriceList =
  () =>
  (state: AppState): TQuoteHistoryPrices | undefined =>
    state.portfolio.quoteHistoryPrices.item;
export const selectQuoteHistoryPriceListStatus =
  () =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.portfolio.quoteHistoryPrices, ['status']);

export const selectSettlePortfolioState =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): WrappedPortfolio | undefined =>
    _.get(state.portfolio.chainSettlingPortfolioModalState, [chainId || '', userAddr || '', 'item']);

export const selectSettleFetchingStatus =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(
      state.portfolio.chainSettlingPortfolioModalState,
      [chainId || '', userAddr || '', 'status'],
      FETCHING_STATUS.INIT,
    );

export const selectOperateToken =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): TokenInfo | undefined =>
    _.get(state.portfolio.chainBalanceOperateToken, [chainId || '', userAddr || '']);

export const selectWithdrawPendingConfig =
  (chainId: number | undefined) =>
  (
    state: AppState,
  ):
    | {
        pendingDuration: number;
      }
    | undefined =>
    _.get(state.portfolio.chainWithdrawPendingConfig, [chainId || '']);

export const selectTokenWithdrawPendingParams =
  (chainId: number | undefined, tokenAddr: string | undefined) =>
  (state: AppState): (TokenInfo & { threshold: BigNumber }) | undefined =>
    _.get(state.portfolio.chainTokenWithdrawPendingParams, [chainId || '', tokenAddr || '']);

export const selectUserTokenWithdrawPendings =
  (chainId: number | undefined, userAddr: string | undefined, tokenAddr: string | undefined) =>
  (state: AppState): (TokenInfo & { maxWithdrawable: BigNumber; pending: Pending }) | undefined =>
    _.get(state.portfolio.chainUserTokenWithdrawPendings, [chainId || '', userAddr || '', tokenAddr || '']);

export const selectUserAllTokenWithdrawPendings =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (
    state: AppState,
  ):
    | {
        [tokenAddress: string]: TokenInfo & { maxWithdrawable: BigNumber; pending: Pending; blockInfo?: BlockInfo };
      }
    | undefined =>
    _.get(state.portfolio.chainUserTokenWithdrawPendings, [chainId || '', userAddr || '']);

export default portfolioSlice.reducer;

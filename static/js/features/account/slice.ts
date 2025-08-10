import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { IMetaAccount, IMetaOrder, IMetaPortfolio, IMetaPosition, IMetaRange } from '@/types/account';
import { ListStatus, getDefaultListStatus, setFulfilledListStatus } from '@/types/redux';
import { getPairId } from '@/utils/transform/transformId';

import { AppState } from '../store';
import { getAllAccountsFromChain, updatePortfolio, updatePortfolioList } from './actions';
export interface IAccountState {
  chainMetaAccount: {
    [chainID: number]: {
      [userAddr: string]: ListStatus<IMetaAccount>;
    };
  };
  chainMetaPortfolio: {
    [chainID: number]: {
      [userAddr: string]: ListStatus<IMetaPortfolio>;
    };
  };
  chainMetaPosition: {
    [chainID: number]: {
      [userAddr: string]: ListStatus<IMetaPosition>;
    };
  };
  chainMetaOrder: {
    [chainID: number]: {
      [userAddr: string]: ListStatus<IMetaOrder>;
    };
  };
  chainMetaRange: {
    [chainID: number]: {
      [userAddr: string]: ListStatus<IMetaRange>;
    };
  };
}

const initialState: IAccountState = {
  chainMetaAccount: {},
  chainMetaPortfolio: {},
  chainMetaPosition: {},
  chainMetaOrder: {},
  chainMetaRange: {},
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(getAllAccountsFromChain.pending, (state, action) => {
        const { arg } = action.meta;

        if (!_.get(state.chainMetaAccount, [arg.chainId, arg.userAddr])) {
          _.set(state.chainMetaAccount, [arg.chainId, arg.userAddr], getDefaultListStatus(FETCHING_STATUS.FETCHING));
        }

        if (!_.get(state.chainMetaPortfolio, [arg.chainId, arg.userAddr])) {
          _.set(state.chainMetaPortfolio, [arg.chainId, arg.userAddr], getDefaultListStatus(FETCHING_STATUS.FETCHING));
        }

        if (!_.get(state.chainMetaPosition, [arg.chainId, arg.userAddr])) {
          _.set(state.chainMetaPosition, [arg.chainId, arg.userAddr], getDefaultListStatus(FETCHING_STATUS.FETCHING));
        }

        if (!_.get(state.chainMetaOrder, [arg.chainId, arg.userAddr])) {
          _.set(state.chainMetaOrder, [arg.chainId, arg.userAddr], getDefaultListStatus(FETCHING_STATUS.FETCHING));
        }
        if (!_.get(state.chainMetaRange, [arg.chainId, arg.userAddr])) {
          _.set(state.chainMetaRange, [arg.chainId, arg.userAddr], getDefaultListStatus(FETCHING_STATUS.FETCHING));
        }
      })
      .addCase(getAllAccountsFromChain.fulfilled, (state, action) => {
        const { arg } = action.meta;
        let metaAccountMap = {} as Record<string, IMetaAccount>;
        let metaPortfolioMap = {} as Record<string, IMetaPortfolio>;
        let metaPositionMap = {} as Record<string, IMetaPosition>;
        let metaOrderMap = {} as Record<string, IMetaOrder>;
        let metaRangeMap = {} as Record<string, IMetaRange>;
        if (action.payload) {
          const {
            accountMap: accountMap,
            portfolioMap: portfolioMap,
            positionMap: positionMap,
            orderMap: orderMap,
            rangeMap,
            blockInfo,
          } = action.payload;

          const metaAccountListInState = _.get(state.chainMetaAccount, [arg.chainId, arg.userAddr, 'list']);
          const topHoldingFuturesCore = Object.values(metaAccountListInState || {})[0];
          // if the block height is lower than the current block height, we don't need to update the state

          if ((topHoldingFuturesCore?.blockInfo?.height || 0) > (blockInfo?.height || 0)) {
            return;
          }

          metaAccountMap = _.merge(
            {},
            // metaAccountListInState,
            accountMap,
          );
          metaPortfolioMap = _.merge(
            {},
            // _.get(state.chainMetaPortfolio, [arg.chainId, arg.userAddr, 'list']),
            portfolioMap,
          );
          metaPositionMap = _.merge(
            {},
            // _.get(state.chainMetaPosition, [arg.chainId, arg.userAddr, 'list']),
            positionMap,
          );
          metaOrderMap = _.merge(
            {},
            //  _.get(state.chainMetaOrder, [arg.chainId, arg.userAddr, 'list']),
            orderMap,
          );
          metaRangeMap = _.merge(
            {},
            //  _.get(state.chainMetaRange, [arg.chainId, arg.userAddr, 'list']),
            rangeMap,
          );
          _.set(state.chainMetaAccount, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaAccountMap));
          _.set(state.chainMetaPortfolio, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaPortfolioMap));
          _.set(state.chainMetaPosition, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaPositionMap));
          _.set(state.chainMetaOrder, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaOrderMap));
          _.set(state.chainMetaRange, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaRangeMap));
        }
      })
      .addCase(getAllAccountsFromChain.rejected, (state, action) => {
        const { arg } = action.meta;
        _.set(state.chainMetaAccount, [arg.chainId, arg.userAddr, 'status'], FETCHING_STATUS.DONE);
        _.set(state.chainMetaPortfolio, [arg.chainId, arg.userAddr, 'status'], FETCHING_STATUS.DONE);
        _.set(state.chainMetaPosition, [arg.chainId, arg.userAddr, 'status'], FETCHING_STATUS.DONE);
        _.set(state.chainMetaOrder, [arg.chainId, arg.userAddr, 'status'], FETCHING_STATUS.DONE);
        _.set(state.chainMetaRange, [arg.chainId, arg.userAddr, 'status'], FETCHING_STATUS.DONE);
      })
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        const { arg } = action.meta;
        let metaAccountRes = {} as Record<string, IMetaAccount>;
        let metaPortfolioRes = {} as Record<string, IMetaPortfolio>;
        let metaPositionRes = {} as Record<string, IMetaPosition>;
        let metaOrderRes = {} as Record<string, IMetaOrder>;
        let metaRangeRes = {} as Record<string, IMetaRange>;
        if (action.payload) {
          const pairId = getPairId(arg.instrumentAddr, arg.expiry);
          const { accountMap, portfolioMap, positionMap, orderMap, rangeMap, blockInfo } = action.payload;

          const metaAccountListInState = _.get(state.chainMetaAccount, [arg.chainId, arg.userAddr, 'list']);
          const metaPositionListInState = _.get(state.chainMetaPosition, [arg.chainId, arg.userAddr, 'list']);
          const metaOrderListInState = _.get(state.chainMetaOrder, [arg.chainId, arg.userAddr, 'list']);
          const metaRangeListInState = _.get(state.chainMetaRange, [arg.chainId, arg.userAddr, 'list']);
          const topAccount = Object.values(metaAccountListInState || {})[0];
          // if the block height is lower than the current block height, we don't need to update the state
          if ((topAccount?.blockInfo?.height || 0) > (blockInfo?.height || 0)) {
            return;
          }

          metaPortfolioRes = _.merge(
            _.get(state.chainMetaPortfolio, [arg.chainId, arg.userAddr, 'list']),
            portfolioMap,
          );

          metaAccountRes = _.reduce(
            metaPortfolioRes,
            (acc, portfolio) => {
              const { accountId, id, instrumentId } = portfolio;
              if (!acc[accountId]) {
                acc[accountId] = {
                  id: accountId,
                  userAddr: arg.userAddr,
                  instrumentId: instrumentId,
                  portfolioIds: [id],
                  blockInfo: blockInfo,
                };
              } else {
                if (!acc[accountId].portfolioIds.includes(id)) {
                  acc[accountId].portfolioIds.push(id);
                }
                acc[accountId].blockInfo = blockInfo;
              }
              return acc;
            },
            _.merge({}, metaAccountListInState, accountMap) as Record<string, IMetaAccount>,
          );

          metaPositionRes = _.merge({}, metaPositionListInState, positionMap) as Record<string, IMetaPosition>;
          metaOrderRes = _.merge({}, metaOrderListInState, orderMap) as Record<string, IMetaOrder>;
          metaRangeRes = _.merge({}, metaRangeListInState, rangeMap) as Record<string, IMetaRange>;

          if (metaOrderListInState) {
            // remove order from metaOrderRes if it is not in orderMap
            for (const [key, order] of Object.entries(metaOrderListInState)) {
              if (order.pairId === pairId) {
                if (Object.keys(orderMap || {}).length) {
                  const pairOrders = Object.values(orderMap);
                  if (!orderMap[key] && pairOrders.find((o) => o.pairId === order.pairId)) {
                    delete metaOrderRes[key];
                  }
                } else {
                  delete metaOrderRes[key];
                }
              }
            }
          }
          if (metaRangeListInState) {
            // remove range from metaRangeRes if it is not in rangeMap
            for (const [key, range] of Object.entries(metaRangeListInState)) {
              if (range.pairId === pairId) {
                if (Object.keys(rangeMap || {}).length) {
                  const pairOrders = Object.values(rangeMap);
                  if (!rangeMap[key] && pairOrders.find((o) => o.pairId === range.pairId)) {
                    delete metaRangeRes[key];
                  }
                } else {
                  delete metaRangeRes[key];
                }
              }
            }
          }
        }

        _.set(state.chainMetaAccount, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaAccountRes));
        _.set(state.chainMetaPortfolio, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaPortfolioRes));
        _.set(state.chainMetaPosition, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaPositionRes));
        _.set(state.chainMetaOrder, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaOrderRes));
        _.set(state.chainMetaRange, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaRangeRes));
      });
    builder.addCase(updatePortfolioList.fulfilled, (state, action) => {
      const { arg } = action.meta;
      let metaAccountMap = {} as Record<string, IMetaAccount>;
      let metaPortfolioMap = {} as Record<string, IMetaPortfolio>;
      let metaPositionMap = {} as Record<string, IMetaPosition>;
      let metaOrderMap = {} as Record<string, IMetaOrder>;
      let metaRangeMap = {} as Record<string, IMetaRange>;
      if (action.payload) {
        const {
          accountMap: accountMap,
          portfolioMap: portfolioMap,
          positionMap: positionMap,
          orderMap: orderMap,
          rangeMap,
          blockInfo,
        } = action.payload;

        const metaAccountListInState = _.get(state.chainMetaAccount, [arg.chainId, arg.userAddr, 'list']);
        const topHoldingFuturesCore = Object.values(metaAccountListInState || {})[0];
        // if the block height is lower than the current block height, we don't need to update the state

        if ((topHoldingFuturesCore?.blockInfo?.height || 0) > (blockInfo?.height || 0)) {
          return;
        }

        metaAccountMap = _.merge(
          {},
          // metaAccountListInState,
          accountMap,
        );
        metaPortfolioMap = _.merge(
          {},
          // _.get(state.chainMetaPortfolio, [arg.chainId, arg.userAddr, 'list']),
          portfolioMap,
        );
        metaPositionMap = _.merge(
          {},
          // _.get(state.chainMetaPosition, [arg.chainId, arg.userAddr, 'list']),
          positionMap,
        );
        metaOrderMap = _.merge(
          {},
          //  _.get(state.chainMetaOrder, [arg.chainId, arg.userAddr, 'list']),
          orderMap,
        );
        metaRangeMap = _.merge(
          {},
          //  _.get(state.chainMetaRange, [arg.chainId, arg.userAddr, 'list']),
          rangeMap,
        );
        _.set(state.chainMetaAccount, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaAccountMap));
        _.set(state.chainMetaPortfolio, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaPortfolioMap));
        _.set(state.chainMetaPosition, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaPositionMap));
        _.set(state.chainMetaOrder, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaOrderMap));
        _.set(state.chainMetaRange, [arg.chainId, arg.userAddr], setFulfilledListStatus(metaRangeMap));
      }
    });
  },
});

export const selectChainMetaAccount =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): ListStatus<IMetaAccount> =>
    _.get(state.account.chainMetaAccount, [chainId || '', userAddr || '']);

export const selectAccountMap =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): { [accountId: string]: IMetaAccount } =>
    _.get(state.account.chainMetaAccount, [chainId || '', userAddr || '', 'list']);

export const selectMetaAccount =
  (chainId: number | undefined, userAddr: string | undefined, accountId: string | undefined) =>
  (state: AppState): IMetaAccount | undefined =>
    _.get(state.account.chainMetaAccount, [chainId || '', userAddr || '', 'list', accountId || '']);

export const selectAccountStatus =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.account.chainMetaAccount, [chainId || '', userAddr || '', 'status']);

export const selectChainMetaPortfolio =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (
    state: AppState,
  ): {
    [chainID: number]: ListStatus<IMetaPortfolio>;
  } =>
    _.get(state.account.chainMetaPortfolio, [chainId || '', userAddr || '']);

export const selectPortfolioMap =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): { [portfolioId: string]: IMetaPortfolio } =>
    _.get(state.account.chainMetaPortfolio, [chainId || '', userAddr || '', 'list']);

export const selectMetaPortfolio =
  (chainId: number | undefined, userAddr: string | undefined, portfolioId: string | undefined) =>
  (state: AppState): IMetaPortfolio | undefined =>
    _.get(state.account.chainMetaPortfolio, [chainId || '', userAddr || '', 'list', portfolioId || '']);

export const selectMetaPortfolioByPairId =
  (chainId: number | undefined, userAddr: string | undefined, pairId: string | undefined) =>
  (state: AppState): IMetaPortfolio | undefined =>
    _.get(state.account.chainMetaPortfolio, [
      chainId || '',
      userAddr || '',
      'list',
      userAddr && pairId ? `${userAddr}-${pairId}` : '',
    ]);

export const selectChainMetaPosition =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (
    state: AppState,
  ): {
    [chainID: number]: ListStatus<IMetaPosition>;
  } =>
    _.get(state.account.chainMetaPosition, [chainId || '', userAddr || '']);

export const selectPositionMap =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): { [positionId: string]: IMetaPosition } =>
    _.get(state.account.chainMetaPosition, [chainId || '', userAddr || '', 'list']);

export const selectMetaPosition =
  (chainId: number | undefined, userAddr: string | undefined, positionId: string | undefined) =>
  (state: AppState): IMetaPosition | undefined =>
    _.get(state.account.chainMetaPosition, [chainId || '', userAddr || '', 'list', positionId || '']);

export const selectMetaPositionByPairId =
  (chainId: number | undefined, userAddr: string | undefined, pairId: string | undefined) =>
  (state: AppState): IMetaPosition | undefined =>
    _.get(state.account.chainMetaPosition, [
      chainId || '',
      userAddr || '',
      'list',
      userAddr && pairId ? `${userAddr}-${pairId}` : '',
    ]);

export const selectChainMetaOrder =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (
    state: AppState,
  ): {
    [chainID: number]: ListStatus<IMetaOrder>;
  } =>
    _.get(state.account.chainMetaOrder, [chainId || '', userAddr || '']);

export const selectOrderMap =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): { [orderId: string]: IMetaOrder } =>
    _.get(state.account.chainMetaOrder, [chainId || '', userAddr || '', 'list']);

export const selectMetaOrder =
  (chainId: number | undefined, userAddr: string | undefined, orderId: string | undefined) =>
  (state: AppState): IMetaOrder | undefined =>
    _.get(state.account.chainMetaOrder, [chainId || '', userAddr || '', 'list', orderId || '']);

export const selectMetaOrderByPairId =
  (chainId: number | undefined, userAddr: string | undefined, pairId: string | undefined) =>
  (state: AppState): { [orderId: string]: IMetaOrder } | undefined =>
    _.pickBy(
      _.get(state.account.chainMetaOrder, [chainId || '', userAddr || '', 'list']),
      (metaOrder) => metaOrder.pairId === pairId,
    );

export const selectRangeMap =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): { [rangeId: string]: IMetaRange } =>
    _.get(state.account.chainMetaRange, [chainId || '', userAddr || '', 'list']);

export const selectMetaRange =
  (chainId: number | undefined, userAddr: string | undefined, rangeId: string | undefined) =>
  (state: AppState): IMetaRange | undefined =>
    _.get(state.account.chainMetaRange, [chainId || '', userAddr || '', 'list', rangeId || '']);

export const selectMetaRangeByPairId =
  (chainId: number | undefined, userAddr: string | undefined, pairId: string | undefined) =>
  (state: AppState): { [rangeId: string]: IMetaRange } | undefined =>
    _.pickBy(
      _.get(state.account.chainMetaRange, [chainId || '', userAddr || '', 'list']),
      (metaRange) => metaRange.pairId === pairId,
    );

export default accountSlice.reducer;

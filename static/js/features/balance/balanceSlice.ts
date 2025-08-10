import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { ZERO } from '@/constants';
import { IGateAccountState, ITokenBalanceInfo, ITokenBalanceInfoMap } from '@/types/balance';

import { AppState } from '../store';
import {
  changeTokenBalanceAction,
  depositOrWithdrawBalance,
  fetchAllTokenBalanceAction,
  fetchTokenBalanceAction,
  resetChainDefaultBalanceMapAction,
  setGateAccountState,
} from './actions';

export interface IBalanceState {
  chainBalanceMap: {
    [chainId: number]: {
      [userAddr: string]: ITokenBalanceInfoMap;
    };
  };
  chainGateAccountState: {
    [chainId: number]: IGateAccountState;
  };
}

const initialState: IBalanceState = {
  chainBalanceMap: {},
  chainGateAccountState: {},
};

export const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetChainDefaultBalanceMapAction.pending, (state, action) => {
        const { arg } = action.meta;
        if (!state.chainBalanceMap[arg.chainId]) {
          state.chainBalanceMap[arg.chainId] = {};
        }
        const balanceMapInState = _.get(state.chainBalanceMap, [arg.chainId, arg.traderAddress]);
        if (balanceMapInState) {
          const balanceList = _.cloneDeep(_.values(balanceMapInState));
          if (balanceList.length > 0) {
            const list = balanceList
              .map((b) => ({ ...b, isLoadingMarginBalance: true, isLoading: true }))
              .filter((b) => !!b.address);
            _.set(state.chainBalanceMap, [arg.chainId, arg.traderAddress], _.keyBy(list, 'address'));
          }
        }
        // if(!state.chainBalanceMap[arg.chainId][arg.traderAddress]){
        //   state.chainBalanceMap[arg.chainId][arg.traderAddress]={};
        // }
      })
      .addCase(resetChainDefaultBalanceMapAction.fulfilled, (state, action) => {
        const { arg } = action.meta;
        if (action.payload) {
          _.set(state.chainBalanceMap, [arg.chainId, arg.traderAddress], action.payload.balanceList);
        }
      })
      .addCase(resetChainDefaultBalanceMapAction.rejected, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { arg } = action.meta;
      })
      .addCase(fetchAllTokenBalanceAction.fulfilled, (state, action) => {
        const { arg } = action.meta;
        if (action.payload) {
          const chainId = arg.chainId;
          action.payload.forEach(({ token, balance, block }) => {
            _.set(
              state.chainBalanceMap,
              [chainId, arg.userAddr, token.address],
              _.merge({}, _.get(state.chainBalanceMap, [chainId, arg.userAddr, token.address]), {
                balance: balance || ZERO,
                block: block || 0,
                isLoading: false,
              }),
            );
          });
        }
      })

      .addCase(fetchTokenBalanceAction.pending, (state, action) => {
        const { arg } = action.meta;

        if (arg.token && arg.token.address) {
          const chainId = arg.token.chainId || arg.chainId;
          const balanceInState = _.get(state.chainBalanceMap, [chainId, arg.userAddr, arg.token.address]);
          if (balanceInState) {
            // _.set(
            //   state.chainBalanceMap,
            //   [chainId, arg.traderAddress, arg.token.address, 'isLoading'],
            //   true,
            // );
          }
        }
      })
      .addCase(fetchTokenBalanceAction.fulfilled, (state, action) => {
        const { arg } = action.meta;
        if (arg.token && arg.token.address) {
          const chainId = arg.token.chainId || arg.chainId;
          const balanceInState = _.get(state.chainBalanceMap, [chainId, arg.userAddr, arg.token.address]);
          if (balanceInState) {
            // if the block height is lower than the current block height, we don't need to update the state
            if ((balanceInState?.block || 0) > (action.payload?.block || 0)) {
              return;
            }
            _.set(
              state.chainBalanceMap,
              [chainId, arg.userAddr, arg.token.address],
              _.merge({}, balanceInState, {
                balance: ZERO,
                block: 0,
                ...action.payload,
                isLoading: false,
              }),
            );
          }
        }
      })
      .addCase(fetchTokenBalanceAction.rejected, (state, action) => {
        const { arg } = action.meta;
        if (action.error.message === 'no change') {
          return;
        }
        if (arg.token && arg.token.address) {
          const chainId = arg.token.chainId || arg.chainId;
          const balanceInState = _.get(state.chainBalanceMap, [chainId, arg.userAddr, arg.token.address]);
          if (balanceInState) {
            _.set(state.chainBalanceMap, [chainId, arg.userAddr, arg.token?.address, 'isLoading'], true);
          }
        }
      })

      .addCase(changeTokenBalanceAction.fulfilled, (state, action) => {
        const { arg } = action.meta;
        if (arg.token && arg.token.address) {
          const chainId = arg.chainId;
          const balanceInState = _.get(state.chainBalanceMap, [chainId, arg.userAddr, arg.token.address]);
          if (balanceInState) {
            // if the block height is lower than the current block height, we don't need to update the state
            if ((balanceInState?.block || 0) > (action.payload?.block || 0)) {
              return;
            }
          }
          _.set(
            state.chainBalanceMap,
            [chainId, arg.userAddr, arg.token.address],
            _.merge({}, balanceInState, {
              balance: ZERO,
              block: 0,
              ...action.payload,
              isLoading: false,
            }),
          );
        }
      })
      // .addCase(changeTokenGateBalanceAction.fulfilled, (state, action) => {
      //   const { arg } = action.meta;
      //   if (arg.token && arg.token.address) {
      //     const chainId = arg.chainId;
      //     const balanceInState = _.get(state.chainGateBalanceMap, [chainId, arg.userAddr, arg.token.address]);
      //     if (balanceInState) {
      //       // if the block height is lower than the current block height, we don't need to update the state
      //       if ((balanceInState?.block || 0) > (action.payload?.block || 0)) {
      //         return;
      //       }
      //     }
      //     _.set(
      //       state.chainGateBalanceMap,
      //       [chainId, arg.userAddr, arg.token.address],
      //       _.merge({}, balanceInState, {
      //         balance: ZERO,
      //         block: 0,
      //         ...action.payload,
      //         isLoading: false,
      //       }),
      //     );
      //   }
      // })

      .addCase(depositOrWithdrawBalance.pending, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainGateAccountState, [chainId, 'isOperating'], true);
      })
      .addCase(depositOrWithdrawBalance.fulfilled, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainGateAccountState, [chainId], {
          isOperating: false,
          depositAmountStr: '',
        });
      })
      .addCase(depositOrWithdrawBalance.rejected, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainGateAccountState, [chainId, 'isOperating'], false);
      })
      .addCase(setGateAccountState, (state, { payload }) => {
        const currentState = _.get(state.chainGateAccountState, [payload.chainId]);
        _.set(state.chainGateAccountState, [payload.chainId], { ...currentState, ...payload });
      });
  },
});

export const { resetState } = balanceSlice.actions;
export { fetchTokenBalanceAction, resetChainDefaultBalanceMapAction };

export const selectBalanceState = (state: AppState): IBalanceState => state.balance;
export const selectBalanceMapState = (
  state: AppState,
): {
  [chainId: number]: {
    [traderAddr: string]: ITokenBalanceInfoMap;
  };
} => state.balance.chainBalanceMap;
export const selectTokenBalanceByChainIdAndAddress =
  (
    chainId: number | undefined,
    traderAddress: string | undefined,
    tokenAddress: string | undefined,
  ): ((state: AppState) => ITokenBalanceInfo) =>
  (state: AppState): ITokenBalanceInfo =>
    _.get(state.balance.chainBalanceMap, [chainId || '', traderAddress || '', tokenAddress || '']);

export const selectGateAccountState = (
  state: AppState,
): {
  [chainId: number]: IGateAccountState;
} => state.balance.chainGateAccountState;

export default balanceSlice.reducer;

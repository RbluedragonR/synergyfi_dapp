import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { ISpenderTokenAllowanceMap, ITokenAllowanceMap } from '@/types/user';

import { AppState } from '../store';
import { approveToken, changeTokenAllowance, checkTokenAllowance } from './actions';
export interface IUserState {
  currentUserAddr: string;
  prevUserAddr: string;
  impostorAddress: string;
  chainTokenAllowance: ITokenAllowanceMap;
  chainTokenAllowanceWithSpender: ISpenderTokenAllowanceMap;
}

export const initialState: IUserState = {
  currentUserAddr: '',
  prevUserAddr: '',
  impostorAddress: '',
  chainTokenAllowance: {},
  chainTokenAllowanceWithSpender: {},
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUserAddr: (state, { payload: { account } }) => {
      account = account?.toLowerCase();
      if (state.prevUserAddr === '') {
        state.prevUserAddr = account;
      }
      state.currentUserAddr = account;
    },
    setPrevUserAddr: (state, { payload: { account } }) => {
      account = account?.toLowerCase();
      state.prevUserAddr = account || state.currentUserAddr;
    },
    setImpostorAddress: (state, { payload: { account } }) => {
      account = account?.toLowerCase();
      state.impostorAddress = account;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkTokenAllowance.fulfilled, (state, { meta, payload }) => {
        const { chainId, marginToken, userAddress, spenderAddress, sdk } = meta.arg;
        if (!payload) return;

        if (!spenderAddress) {
          const tokenAllowance = _.get(state.chainTokenAllowance, [
            chainId,
            userAddress,
            marginToken.address.toLowerCase(),
          ]);
          // if the block height is lower than the current block height, we don't need to update the state
          if (tokenAllowance?.block > payload.block) {
            return;
          }
          _.set(state.chainTokenAllowance, [chainId, userAddress, marginToken.address.toLowerCase()], payload);
        }

        const finalSpenderAddress = spenderAddress || sdk.perp.contracts.gate.address.toLowerCase();

        const tokenAllowance = _.get(state.chainTokenAllowanceWithSpender, [
          chainId,
          userAddress,
          marginToken?.address.toLowerCase(),
          finalSpenderAddress,
        ]);
        // if the block height is lower than the current block height, we don't need to update the state
        if (tokenAllowance?.block > payload.block) {
          return;
        }
        _.set(
          state.chainTokenAllowanceWithSpender,
          [chainId, userAddress, marginToken.address.toLowerCase(), finalSpenderAddress],
          payload,
        );
      })
      .addCase(changeTokenAllowance.fulfilled, (state, { meta, payload }) => {
        const { chainId, token, userAddr, allowanceInfo } = meta.arg;
        if (!payload?.allowanceInfo) return;

        if (payload.spender) {
          _.set(
            state.chainTokenAllowanceWithSpender,
            [chainId, userAddr, token.address.toLowerCase(), allowanceInfo.spender, 'checking'],
            false,
          );
          _.set(
            state.chainTokenAllowanceWithSpender,
            [chainId, userAddr, token.address.toLowerCase(), allowanceInfo.spender, 'allowance'],
            payload.allowanceInfo.allowance,
          );
          _.set(
            state.chainTokenAllowanceWithSpender,
            [chainId, userAddr, token.address.toLowerCase(), allowanceInfo.spender, 'block'],
            payload.allowanceInfo.block,
          );
        } else {
          _.set(state.chainTokenAllowance, [chainId, userAddr, token.address.toLowerCase(), 'checking'], false);
          _.set(
            state.chainTokenAllowance,
            [chainId, userAddr, token.address.toLowerCase(), 'allowance'],
            payload.allowanceInfo.allowance,
          );
          _.set(
            state.chainTokenAllowance,
            [chainId, userAddr, token.address.toLowerCase(), 'block'],
            payload.allowanceInfo.block,
          );
        }
      })

      .addCase(approveToken.pending, (state, { meta }) => {
        const { chainId, userAddr: userAddr, marginToken, spenderAddress } = meta.arg;
        if (spenderAddress) {
          console.log('spenderAddress', spenderAddress, 'approveToken.pending');
          _.set(
            state.chainTokenAllowanceWithSpender,
            [chainId, userAddr, marginToken.address.toLowerCase(), spenderAddress, 'approving'],
            true,
          );
        } else {
          _.set(state.chainTokenAllowance, [chainId, userAddr, marginToken.address.toLowerCase(), 'approving'], true);
        }
      })
      .addCase(approveToken.fulfilled, (state, { meta }) => {
        const { chainId, userAddr: account, marginToken, spenderAddress } = meta.arg;
        if (spenderAddress) {
          _.set(
            state.chainTokenAllowanceWithSpender,
            [chainId, account, marginToken.address.toLowerCase(), spenderAddress, 'approving'],
            false,
          );
        } else {
          _.set(state.chainTokenAllowance, [chainId, account, marginToken.address.toLowerCase(), 'approving'], false);
        }
      })
      .addCase(approveToken.rejected, (state, { meta }) => {
        const { chainId, userAddr: account, marginToken, spenderAddress } = meta.arg;
        if (spenderAddress) {
          _.set(
            state.chainTokenAllowanceWithSpender,
            [chainId, account, marginToken.address.toLowerCase(), spenderAddress, 'approving'],
            false,
          );
        } else {
          _.set(state.chainTokenAllowance, [chainId, account, marginToken.address.toLowerCase(), 'approving'], false);
        }
      });
  },
});

export const { setCurrentUserAddr, setPrevUserAddr, setImpostorAddress } = userSlice.actions;

export const selectUserState = (state: AppState): IUserState => state.user;
export const selectCurrentUserAddr = (state: AppState): string => state.user.currentUserAddr;
export const selectImpostorAddress = (state: AppState): string => state.user.impostorAddress;
export const selectChainTokenAllowanceMap = (state: AppState): ITokenAllowanceMap => state.user.chainTokenAllowance;
export const selectSpenderChainTokenAllowanceMap = (state: AppState): ISpenderTokenAllowanceMap =>
  state.user.chainTokenAllowanceWithSpender;
export default userSlice.reducer;

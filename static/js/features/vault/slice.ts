import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { ITokenBalanceInfoMap } from '@/types/balance';
import {
  getDefaultItemStatus,
  getDefaultListArrayStatus,
  getDefaultListStatus,
  ItemStatus,
  ListStatus as ListArrayStatus,
  ListStatus,
  setFulfilledListArrayStatus,
  setFulfilledListStatus,
} from '@/types/redux';
import { IVaultPointsDistribution, IVaultTokenHoldingValue, WrappedArrear } from '@/types/vault';
import { BlockInfo } from '@derivation-tech/context';
import { DepositInfo, DepositWithdraw } from '@synfutures/sdks-perp-launchpad-datasource';
import { AppState } from '../store';
import {
  depositToVault,
  fetchUserDepositInfo,
  fetchVaultHistory,
  fetchVaultTokenHoldingValue,
  getUserPendingWithdraw,
  withdrawFromVault,
} from './action';
export interface IVaultState {
  chainUserDepositInfoBlockInfo: {
    [chainId: number]: { [userAddr: string]: BlockInfo | undefined };
  };
  chainUserDepositInfo: {
    [chainId: number]: { [userAddr: string]: ListStatus<DepositInfo> };
  };
  chainUserVaultPoints: {
    [chainId: number]: { [userAddr: string]: ListStatus<DepositInfo> };
  };
  chainVaultPoints: {
    [chainId: number]: ItemStatus<IVaultPointsDistribution>;
  };

  selectedVaultAddress: string | null;
  chainBalanceMap: {
    [chainId: number]: {
      [userAddr: string]: ITokenBalanceInfoMap;
    };
  };
  chainClaimStatus: {
    [chainId: number]: {
      [userAddr: string]: {
        [vaultAddr: string]: FETCHING_STATUS;
      };
    };
  };
  input: {
    depositAmount: string;
    withdrawAmount: string;
  };
  chainPendingWithdraw: {
    [chainId: number]: {
      [userAddr: string]: {
        [vaultAddr: string]: ItemStatus<WrappedArrear>;
      };
    };
  };
  chainUserVaultHistory: {
    [chainId: number]: {
      [userAddr: string]: {
        [vaultAddr: string]: ListArrayStatus<DepositWithdraw>;
      };
    };
  };
  chainUserVaultTokenHoldingValue: {
    [chainId: number]: {
      [userAddr: string]: {
        deposits: ListStatus<IVaultTokenHoldingValue>;
        blockHeight: number;
      };
    };
  };
}

const initialState: IVaultState = {
  chainUserDepositInfoBlockInfo: {},

  chainUserDepositInfo: {},
  chainUserVaultPoints: {},
  chainVaultPoints: {},
  selectedVaultAddress: null,
  chainBalanceMap: {},
  chainClaimStatus: {},
  input: {
    depositAmount: '',
    withdrawAmount: '',
  },
  chainPendingWithdraw: {},
  chainUserVaultHistory: {},
  chainUserVaultTokenHoldingValue: {},
};

export const vaultSlice = createSlice({
  name: 'earn',
  initialState,
  reducers: {
    setDepositAmount: (state, action: PayloadAction<string>) => {
      state.input.depositAmount = action.payload;
    },
    setWithdrawAmount: (state, action: PayloadAction<string>) => {
      state.input.withdrawAmount = action.payload;
    },
    setSelectedVaultAddress: (state, action: PayloadAction<string | null>) => {
      state.selectedVaultAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDepositInfo.pending, (state, { meta }) => {
        const curData = _.get(
          state.chainUserDepositInfo,
          [meta.arg.chainId, meta.arg.userAddr],
          getDefaultListArrayStatus(),
        );
        _.set(state.chainUserDepositInfo, [meta.arg.chainId, meta.arg.userAddr], curData);
      })
      .addCase(fetchUserDepositInfo.fulfilled, (state, { meta, payload }) => {
        _.set(
          state.chainUserDepositInfo,
          [meta.arg.chainId, meta.arg.userAddr],
          setFulfilledListStatus(payload?.userDepositInfo || {}),
        );
        // _.set(state.chainUserDepositInfoBlockInfo, [meta.arg.chainId, meta.arg.userAddr], payload?.blockInfo);
      });
    builder
      .addCase(depositToVault.pending, (state, { meta }) => {
        const { chainId } = meta.arg;
        console.log('🚀 ~ .addCase ~ chainId:', chainId);
        // TODO: update form status
        // _.set(state.chainGateAccountState, [chainId, 'isOperating'], true);
      })
      .addCase(depositToVault.fulfilled, (state, { meta }) => {
        const { chainId } = meta.arg;
        console.log('🚀 ~ .addCase ~ chainId:', chainId);
        // TODO: update form status
        // _.set(state.chainGateAccountState, [chainId], {
        //   isOperating: false,
        //   depositAmountStr: '',
        // });
      })
      .addCase(depositToVault.rejected, (state, { meta }) => {
        const { chainId } = meta.arg;
        console.log('🚀 ~ .addCase ~ chainId:', chainId);
        // TODO: update form status
        // _.set(state.chainGateAccountState, [chainId, 'isOperating'], false);
      });
    builder
      .addCase(withdrawFromVault.pending, (state, { meta }) => {
        const { chainId } = meta.arg;
        console.log('🚀 ~ .addCase ~ chainId:', chainId);
        // TODO: update form status
        // _.set(state.chainGateAccountState, [chainId, 'isOperating'], true);
      })
      .addCase(withdrawFromVault.fulfilled, (state, { meta }) => {
        const { chainId } = meta.arg;
        console.log('🚀 ~ .addCase ~ chainId:', chainId);
        // TODO: update form status
        // _.set(state.chainGateAccountState, [chainId], {
        //   isOperating: false,
        //   depositAmountStr: '',
        // });
      })
      .addCase(withdrawFromVault.rejected, (state, { meta }) => {
        const { chainId } = meta.arg;
        console.log('🚀 ~ .addCase ~ chainId:', chainId);
        // TODO: update form status
        // _.set(state.chainGateAccountState, [chainId, 'isOperating'], false);
      });
    // builder
    //   .addCase(claimWithdrawFromVault.pending, (state, { meta }) => {
    //     const { chainId, vaultAddr } = meta.arg;
    //     _.set(state.chainClaimStatus, [chainId, meta.arg.userAddr, vaultAddr], FETCHING_STATUS.FETCHING);
    //   })
    //   .addCase(claimWithdrawFromVault.fulfilled, (state, { meta }) => {
    //     const { chainId, vaultAddr } = meta.arg;
    //     _.set(state.chainClaimStatus, [chainId, meta.arg.userAddr, vaultAddr], FETCHING_STATUS.DONE);
    //   })
    //   .addCase(claimWithdrawFromVault.rejected, (state, { meta }) => {
    //     const { chainId, vaultAddr } = meta.arg;
    //     _.set(state.chainClaimStatus, [chainId, meta.arg.userAddr, vaultAddr], FETCHING_STATUS.INIT);
    //   });
    // pending withdraw
    builder
      .addCase(getUserPendingWithdraw.pending, (state, { meta }) => {
        const { chainId, userAddr, vaultAddr } = meta.arg;
        const pendingWithdraw = _.get(state.chainPendingWithdraw, [chainId, userAddr, vaultAddr]);
        if (!pendingWithdraw)
          _.set(
            state.chainPendingWithdraw,
            [chainId, userAddr, vaultAddr],
            getDefaultItemStatus(FETCHING_STATUS.FETCHING),
          );
        else _.set(state.chainPendingWithdraw, [chainId, userAddr, vaultAddr, 'status'], FETCHING_STATUS.FETCHING);
      })
      .addCase(getUserPendingWithdraw.fulfilled, (state, { meta, payload }) => {
        const { chainId, userAddr, vaultAddr } = meta.arg;
        if (payload) {
          _.set(state.chainPendingWithdraw, [chainId, userAddr, vaultAddr, 'item'], payload);
        }
        _.set(state.chainPendingWithdraw, [chainId, userAddr, vaultAddr, 'status'], FETCHING_STATUS.DONE);
      })
      .addCase(getUserPendingWithdraw.rejected, (state, { meta }) => {
        const { chainId, userAddr, vaultAddr } = meta.arg;
        _.set(state.chainPendingWithdraw, [chainId, userAddr, vaultAddr, 'status'], FETCHING_STATUS.DONE);
      });
    builder
      .addCase(fetchVaultHistory.pending, (state, { meta }) => {
        const { chainId, userAddr } = meta.arg;
        _.set(state.chainUserVaultHistory, [chainId, userAddr, 'status'], FETCHING_STATUS.FETCHING);
      })
      .addCase(fetchVaultHistory.fulfilled, (state, { meta, payload }) => {
        const { chainId, userAddr } = meta.arg;
        _.set(state.chainUserVaultHistory, [chainId, userAddr], setFulfilledListArrayStatus(payload));
      });
    builder
      .addCase(fetchVaultTokenHoldingValue.pending, (state, { meta }) => {
        const { chainId, userAddr } = meta.arg;
        const list = _.get(state.chainUserVaultTokenHoldingValue, [chainId, userAddr]);
        if (!list)
          _.set(
            state.chainUserVaultTokenHoldingValue,
            [chainId, userAddr, 'deposits'],
            getDefaultListStatus(FETCHING_STATUS.FETCHING),
          );
      })
      .addCase(fetchVaultTokenHoldingValue.fulfilled, (state, { meta, payload }) => {
        const { chainId, userAddr } = meta.arg;
        const depositInState = _.get(state.chainUserVaultTokenHoldingValue, [chainId, userAddr]);
        if ((depositInState?.blockHeight || 0) > (payload?.blockHeight || 0)) {
          return;
        }
        const newList = _.merge({}, depositInState?.deposits?.list, payload?.deposits);
        _.set(state.chainUserVaultTokenHoldingValue, [chainId, userAddr, 'deposits'], setFulfilledListStatus(newList));
        _.set(state.chainUserVaultTokenHoldingValue, [chainId, userAddr, 'blockHeight'], payload?.blockHeight);
        _.set(state.chainUserDepositInfoBlockInfo, [meta.arg.chainId, meta.arg.userAddr], {
          timestamp: 0,
          height: payload?.blockHeight,
        });
        // if the block height is lower than the current block height, we don't need to update the state
      });
  },
});

export const selectUserDepositInfo =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): Record<string, DepositInfo> | undefined =>
    _.get(state.vault.chainUserDepositInfo, [chainId || '', userAddr || '', 'list']);

export const selectUserDepositInfoStatus =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS | undefined =>
    _.get(state.vault.chainUserDepositInfo, [chainId || '', userAddr || '', 'status']);

export const selectVaultClaimStatus =
  (chainId: number | undefined, userAddr: string | undefined, vaultAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.vault.chainClaimStatus, [chainId || '', userAddr || '', vaultAddr || ''], FETCHING_STATUS.INIT);

export const selectVaultUserPendingWithdraw =
  (chainId: number | undefined, userAddr: string | undefined, vaultAddr: string | undefined) =>
  (state: AppState): WrappedArrear | undefined =>
    _.get(state.vault.chainPendingWithdraw, [chainId || '', userAddr || '', vaultAddr || '', 'item']);

export const selectVaultUserPendingWithdrawFetchingStatus =
  (chainId: number | undefined, userAddr: string | undefined, vaultAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(
      state.vault.chainPendingWithdraw,
      [chainId || '', userAddr || '', vaultAddr || '', 'status'],
      FETCHING_STATUS.INIT,
    );

export const selectUserVaultHistory =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): DepositWithdraw[] =>
    _.get(state.vault.chainUserVaultHistory, [chainId || '', userAddr || '', 'list'], []);

export const selectUserVaultHistoryStatus =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS | undefined =>
    _.get(state.vault.chainUserVaultHistory, [chainId || '', userAddr || '', 'status'], FETCHING_STATUS.INIT);

export const selectChainUserDepositInfoBlockInfo =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): BlockInfo | undefined =>
    _.get(state.vault.chainUserDepositInfoBlockInfo, [chainId || '', userAddr || '']);

export const selectUserVaultTokenHoldingValue =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): Record<string, IVaultTokenHoldingValue> | undefined =>
    _.get(state.vault.chainUserVaultTokenHoldingValue, [chainId || '', userAddr || '', 'deposits', 'list']);

export const selectUserVaultTokenHoldingValueStatus =
  (chainId: number | undefined, userAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS | undefined =>
    _.get(
      state.vault.chainUserVaultTokenHoldingValue,
      [chainId || '', userAddr || '', 'deposits', 'status'],
      FETCHING_STATUS.INIT,
    );

export const selectVaultTokenHoldingValue =
  (chainId: number | undefined, userAddr: string | undefined, vaultAddr: string | undefined) =>
  (state: AppState): IVaultTokenHoldingValue | undefined =>
    _.get(state.vault.chainUserVaultTokenHoldingValue, [
      chainId || '',
      userAddr || '',
      'deposits',
      'list',
      vaultAddr || '',
    ]);

export default vaultSlice.reducer;

export const { setSelectedVaultAddress, setDepositAmount, setWithdrawAmount } = vaultSlice.actions;

import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { ITransactionInfo, ITxError } from '@/types/transaction';

import { AppState } from '../store';
import {
  addTransaction,
  checkedTransaction,
  clearAllTransactions,
  clearLatestTransaction,
  clearLatestTxErrorMessage,
  deleteTransaction,
  finalizeTransaction,
  replaceTransaction,
  sendTransaction,
} from './actions';

export interface ITransactionState {
  txList: {
    [chainId: number]: {
      [traderAddr: string]: {
        [txHash: string]: ITransactionInfo;
      };
    };
  };
  latestTx: ITransactionInfo | null;
  latestTxError: ITxError | null;
  txErrorMapping: {
    [chainId: number]: {
      [traderAddr: string]: {
        [txError: string]: ITxError;
      };
    };
  };
}

export const initialState: ITransactionState = {
  txList: {},
  latestTx: null,
  latestTxError: null,
  txErrorMapping: {},
};

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(addTransaction, (state, { payload }) => {
        const tx = {
          addedTime: new Date().getTime(),
          ...payload.txInfo,
        };
        const txList = _.get(state.txList, [payload.txInfo.chainId, payload.traderAddr.toLowerCase()]);
        // remove old tx first
        if (txList && Object.values(txList).length >= 5) {
          const sortList = _.orderBy(Object.values(txList), ['addedTime'], ['asc']);
          if (sortList[0]) {
            _.unset(state.txList, [payload.txInfo.chainId, payload.traderAddr.toLowerCase(), sortList[0].txHash]);
          }
        }

        _.set(state.txList, [payload.txInfo.chainId, payload.traderAddr.toLowerCase(), payload.txInfo.txHash], tx);
        state.latestTx = tx;
      })

      .addCase(clearLatestTransaction, (state) => {
        state.latestTx = null;
      })
      .addCase(clearAllTransactions, (state, { payload }) => {
        _.set(state.txList, [payload.chainId, payload.traderAddr.toLowerCase()], {});
      })
      .addCase(checkedTransaction, (state, { payload: { chainId, hash, blockNumber, traderAddr } }) => {
        const tx = _.get(state.txList, [chainId, traderAddr, hash]);
        if (!tx) {
          return;
        }
        if (!tx.lastCheckedBlockNumber) {
          tx.lastCheckedBlockNumber = blockNumber;
        } else {
          tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber);
        }
      })
      .addCase(deleteTransaction, (state, { payload: { chainId, hash, traderAddr } }) => {
        const tx = _.get(state.txList, [chainId, traderAddr, hash]);
        if (!tx) {
          return;
        }
        _.unset(state.txList, [chainId, traderAddr.toLowerCase(), hash]);
      })

      .addCase(finalizeTransaction, (state, { payload: { hash, chainId, receipt, traderAddr } }) => {
        const tx = _.get(state.txList, [chainId, traderAddr, hash]);
        if (!tx) {
          return;
        }
        tx.receipt = receipt;
        tx.confirmedTime = new Date().getTime();
      })
      .addCase(
        replaceTransaction,
        (state, { payload: { oldHash, newHash, chainId, receipt, traderAddr, transactionResponse } }) => {
          const oldTx = _.get(state.txList, [chainId, traderAddr, oldHash]) as ITransactionInfo;
          if (!oldTx) {
            return;
          }
          _.unset(state.txList, [chainId, traderAddr, oldHash]);
          const tx: ITransactionInfo = {
            ...oldTx,
            txHash: newHash,
            transactionResponse,
          };
          if (receipt) {
            tx.receipt = receipt;
            tx.confirmedTime = new Date().getTime();
          }
          _.set(state.txList, [chainId, traderAddr, newHash], tx);
        },
      )
      .addCase(sendTransaction.rejected, (state, { meta, error }) => {
        const { chainId, userAddr, txParams } = meta.arg;
        if (error?.code === 'ACTION_REJECTED' || error?.message?.toString().startsWith(`user rejected transaction`)) {
          return;
        }
        if (error.message) {
          const errorM = {
            msg: error.message,
            txType: txParams.type,
          };
          _.set(state.txErrorMapping, [chainId, userAddr, error.message], errorM);
          state.latestTxError = errorM;
        }
      })
      .addCase(clearLatestTxErrorMessage, (state) => {
        state.latestTxError = null;
      });
  },
});

export const selectTransactionState = (state: AppState): ITransactionState => state.transaction;
export const selectLatestTxErrorState = (state: AppState): ITxError | null => state.transaction.latestTxError;

export const selectTxErrorMappingState =
  (chainId: number | undefined, account: string | undefined) =>
  (
    state: AppState,
  ):
    | {
        [txError: string]: ITxError;
      }
    | undefined =>
    _.get(state.transaction.txErrorMapping, [chainId || '', account || '']);

export default transactionSlice.reducer;

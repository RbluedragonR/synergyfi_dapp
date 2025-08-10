import { CHAIN_ID } from '@derivation-tech/context';
import _ from 'lodash';
import { useMemo } from 'react';

import { useAppSelector } from '@/hooks';
import { ITransactionInfo, ITxError } from '@/types/transaction';

import { ITransactionState, selectLatestTxErrorState, selectTransactionState } from './transactionSlice';

export function useTransactionState(): ITransactionState {
  const transactionState = useAppSelector(selectTransactionState);
  return transactionState;
}

export function useLatestTransaction(): ITransactionInfo | null {
  const { latestTx } = useTransactionState();
  return latestTx;
}

export function useAllTransactionMap(
  chainId: CHAIN_ID | undefined,
  traderAddr: string | undefined,
):
  | {
      [txHash: string]: ITransactionInfo;
    }
  | undefined {
  const { txList } = useTransactionState();
  return useMemo(() => {
    return _.get(txList, [chainId || 0, traderAddr || '']);
  }, [chainId, traderAddr, txList]);
}

export function useAllTransactionList(
  chainId: CHAIN_ID | undefined,
  traderAddr: string | undefined,
): ITransactionInfo[] {
  const txMap = useAllTransactionMap(chainId, traderAddr);
  return useMemo(() => {
    return txMap ? (Object.values(txMap) || []).filter((tx) => !tx.isDisableNotification) : [];
  }, [txMap]);
}

export function useSortedTransactionList(
  chainId: CHAIN_ID | undefined,
  traderAddr: string | undefined,
): ITransactionInfo[] {
  const allTransactions = useAllTransactionList(chainId, traderAddr);
  const sortedRecentTransactions = useMemo(() => {
    return _.cloneDeep(allTransactions).sort((a, b) => b.addedTime - a.addedTime);
  }, [allTransactions]);
  return sortedRecentTransactions;
}

export function usePendingTransactionList(
  chainId: CHAIN_ID | undefined,
  traderAddr: string | undefined,
): ITransactionInfo[] {
  const allTransactions = useAllTransactionList(chainId, traderAddr);
  const pendingTransactions = useMemo(() => {
    return allTransactions.filter((tx) => !tx.receipt);
  }, [allTransactions]);
  return pendingTransactions;
}

export function useLatestTxError(): ITxError | null {
  const latestError = useAppSelector(selectLatestTxErrorState);
  return latestError;
}

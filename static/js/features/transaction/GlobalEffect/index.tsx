import { CHAIN_ID } from '@derivation-tech/context';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider';
import { ErrorCode } from '@ethersproject/logger';
import { useCallback, useEffect, useMemo } from 'react';

import { updateBlockNumber } from '@/features/chain/chainSlice';
import { useBlockNumber } from '@/features/chain/hook';
import { useAppProvider } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ISerializableTransactionReceipt, ITransactionInfo } from '@/types/transaction';
import { IRetryOptions, RetryableError, retry } from '@/utils/retry';

import {
  checkedTransaction,
  clearLatestTransaction,
  clearLatestTxErrorMessage,
  deleteTransaction,
  replaceTransaction,
} from '../actions';
import { useLatestTransaction, useLatestTxError, usePendingTransactionList } from '../hook';
import { useSendTxError, useSendTxNotify, useShowConfirmedTxNotify } from '../useTxNotify';

// import { useAddPopup, useBlockNumber } from '../application/hooks';

interface ITxInterface {
  addedTime: number;
  receipt?: ISerializableTransactionReceipt;
  lastCheckedBlockNumber?: number;
}

// prevent duplicate tx requests
const processingTx: Record<string, ITransactionInfo> = {};

/**
 * check tx
 * 1. have no receipt
 * 2. not lastBlockNumber
 * 3. if pending time >5min, check every 3 block
 * 4. if pending time >1h, check every 10 block
 * @param lastBlockNumber
 * @param tx
 * @returns
 */
export function shouldCheck(lastBlockNumber: number, tx: ITxInterface): boolean {
  if (tx.receipt) return false;
  if (!tx.lastCheckedBlockNumber) return true;
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) return false;
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60;
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9;
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2;
  } else {
    // otherwise every block
    return true;
  }
}

const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: IRetryOptions } = {
  [CHAIN_ID.ARBITRUM]: { n: 10, minWait: 250, maxWait: 1000 },
};
const DEFAULT_RETRY_OPTIONS: IRetryOptions = { n: 3, minWait: 1000, maxWait: 3000 };

export default function TransactionGlobalEffect(): null {
  const appProvider = useAppProvider();
  const chainId = useChainId();
  const account = useUserAddr();

  const lastBlockNumber = useBlockNumber();

  const dispatch = useAppDispatch();
  const latestTx = useLatestTransaction();
  const latestTxError = useLatestTxError();

  const transactionList = usePendingTransactionList(chainId, account);

  // wait func is available
  const couldWaitTransactionList = useMemo(() => {
    return transactionList.filter((tx) => !!tx?.transactionResponse?.wait);
  }, [transactionList]);

  const unCheckedTransactionList = useMemo(() => {
    if (!lastBlockNumber) return [];
    return transactionList.filter((tx) => !tx?.transactionResponse?.wait && !tx.receipt);
  }, [lastBlockNumber, transactionList]);

  // show popup on confirm
  const confirmedTxNotify = useShowConfirmedTxNotify(appProvider, account);
  const sendTxNotify = useSendTxNotify();
  const sendTxError = useSendTxError();

  const getReceipt = useCallback(
    (hash: string) => {
      if (!appProvider || !chainId) throw new Error('No provider or chainId');
      const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId] ?? DEFAULT_RETRY_OPTIONS;
      return retry(
        appProvider.getTransactionReceipt(hash).then((receipt) => {
          if (receipt === null) {
            console.debug('Retrying for hash', hash);
            throw new RetryableError();
          }
          return receipt;
        }),
        retryOptions,
      );
    },
    [chainId, appProvider],
  );

  const handleReceiptAfter = useCallback(
    async (
      receipt: ISerializableTransactionReceipt,
      hash: string,
      txInfo: ITransactionInfo,
      lastBlockNumber?: number,
    ) => {
      if (!chainId || !account) return;

      if (receipt) {
        const serializableReceipt = receipt;

        try {
          await confirmedTxNotify({
            chainId,
            hash,
            transaction: {
              ...txInfo,
              receipt: serializableReceipt,
              confirmedTime: new Date().getTime(),
            },
          });
          delete processingTx[txInfo.txHash];
        } catch (error) {
          console.error('🚀 ~ file: index.tsx ~ line 128 ~ TransactionGlobalEffect ~ error', error);
        }
        if (lastBlockNumber) {
          // the receipt was fetched before the block, fast forward to that block to trigger balance updates
          if (receipt.blockNumber > lastBlockNumber) {
            const block = await appProvider?.getBlock(receipt.blockHash);
            if (block) {
              dispatch(updateBlockNumber({ chainId, blockNumber: block.number, timestamp: block.timestamp }));
            }
          }
        }
      } else {
        lastBlockNumber &&
          dispatch(checkedTransaction({ chainId, traderAddr: account, hash, blockNumber: lastBlockNumber }));
      }
    },
    [account, appProvider, chainId, confirmedTxNotify, dispatch],
  );

  const checkReceiptEveryBlock = useCallback(
    (hash: string, txInfo: ITransactionInfo) => {
      if (!chainId || !account || !appProvider || !lastBlockNumber) return;

      const { promise, cancel } = getReceipt(hash);

      promise
        .then((receipt) => {
          handleReceiptAfter({ ...receipt, success: receipt.status === 1 }, hash, txInfo, lastBlockNumber);
        })
        .catch((error) => {
          if (error instanceof RetryableError) {
            console.error('🚀 ~ file: index.tsx ~ line 140 ~ .map ~ error', error);
          }
          if (!error.isCancelledError) {
            console.error(`Failed to check transaction hash: ${hash}`, error);
          }
        })
        .finally(() => {
          dispatch(checkedTransaction({ chainId, traderAddr: account, hash, blockNumber: lastBlockNumber }));
        });
      return cancel;
    },
    [account, chainId, dispatch, getReceipt, handleReceiptAfter, lastBlockNumber, appProvider],
  );

  const waitTxResponse = useCallback(
    async (hash: string, txInfo: ITransactionInfo) => {
      if (!chainId || !account) return;
      try {
        const transactionResponse = txInfo?.transactionResponse;
        // already in process
        if (processingTx[txInfo.txHash]) {
          return;
        }

        if (transactionResponse && transactionResponse.wait) {
          let receipt: TransactionReceipt;
          processingTx[txInfo.txHash] = txInfo;
          // use websocket provider first
          if (appProvider) {
            receipt = await appProvider.waitForTransaction(transactionResponse.hash);
          } else {
            receipt = await transactionResponse.wait();
          }

          handleReceiptAfter({ ...receipt, success: receipt.status === 1 }, hash, txInfo);
          return receipt;
        } else {
          return;
        }
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        if (error?.code === ErrorCode.TRANSACTION_REPLACED) {
          const response: TransactionResponse = error.replacement;

          const txParams: {
            chainId: CHAIN_ID;
            oldHash: string;
            newHash: string;
            receipt?: ISerializableTransactionReceipt;
            traderAddr: string;
            transactionResponse: TransactionResponse;
          } = {
            chainId,
            traderAddr: account,
            oldHash: hash,
            newHash: response.hash,
            transactionResponse: response,
          };
          if (error.receipt) {
            txParams.receipt = {
              ...error.receipt,
              success: !error.cancelled && error.receipt.status === 1,
              cancelled: error.cancelled,
              reason: error.reason,
            };

            txParams.receipt && handleReceiptAfter(txParams.receipt, hash, txInfo);
          }

          dispatch(replaceTransaction({ ...txParams }));
        } else if (error.receipt) {
          const receipt = error.receipt;
          handleReceiptAfter({ ...receipt, success: receipt.status === 1 }, hash, txInfo);
        }
      }
    },
    [account, chainId, dispatch, handleReceiptAfter, appProvider],
  );

  useEffect(() => {
    couldWaitTransactionList.forEach((txInfo) => {
      waitTxResponse(txInfo.txHash, txInfo);
    });
  }, [couldWaitTransactionList, waitTxResponse]);

  // no transaction response check receipt every block
  useEffect(() => {
    if (!chainId || !account || !appProvider || !lastBlockNumber) return;
    const cancels = unCheckedTransactionList.map((txInfo) => {
      const minutesPending = (new Date().getTime() - txInfo.addedTime) / 1000 / 60;
      if (minutesPending >= 15) {
        // clear it > 15 min
        dispatch(deleteTransaction({ chainId: txInfo.chainId, hash: txInfo.txHash, traderAddr: account }));
        return undefined;
      }
      const cancel = checkReceiptEveryBlock(txInfo.txHash, txInfo);
      return cancel;
    });

    return () => {
      cancels.forEach((cancel) => cancel && cancel());
    };
  }, [account, chainId, checkReceiptEveryBlock, lastBlockNumber, appProvider, unCheckedTransactionList]);

  // send notify immediately, then clear state
  useEffect(() => {
    if (latestTx) {
      sendTxNotify({
        chainId: latestTx.chainId,
        hash: latestTx.txHash,
        transaction: latestTx,
      });
      dispatch(clearLatestTransaction());
    }
  }, [dispatch, latestTx, sendTxNotify]);

  // send error notify immediately, then clear state
  useEffect(() => {
    if (latestTxError) {
      sendTxError({
        error: latestTxError.msg,
        txType: latestTxError.txType,
      });
      dispatch(clearLatestTxErrorMessage());
    }
  }, [dispatch, latestTxError, sendTxError]);

  return null;
}

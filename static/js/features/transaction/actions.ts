import { OPERATION_TX_TYPE } from '@/constants';
import { TX_INTERFACE_MAPPING } from '@/constants/tx';
import { IParsedError } from '@/types/error';
import { IParsedTemplate, ISendTxParams, ISerializableTransactionReceipt, ITransactionInfo } from '@/types/transaction';
import { shortenAddress } from '@/utils/address';
import { getNewRevertReasonsByTxType, replaceRevert } from '@/utils/tx';
import { CHAIN_ID } from '@derivation-tech/context';
import { decodeRevertData } from '@derivation-tech/tx-plugin';
import { ErrorDescription } from '@ethersproject/abi/lib.esm/interface';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider';
import { JsonRpcSigner } from '@ethersproject/providers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ContractReceipt, ContractTransaction } from 'ethers';

import SentryService from '@/entities/SentryService';
import { fetchIpIsBlocked } from '../global/actions';
import { AppState } from '../store';

export const addTransaction = createAction<{
  chainId: CHAIN_ID;
  txInfo: Omit<ITransactionInfo, 'addedTime'>;
  traderAddr: string;
}>('transaction/addTransaction');
export const clearAllTransactions = createAction<{ chainId: CHAIN_ID; traderAddr: string }>(
  'transaction/clearAllTransactions',
);
/**
 * fill tx receipt
 */
export const finalizeTransaction = createAction<{
  chainId: CHAIN_ID;
  hash: string;
  receipt: ISerializableTransactionReceipt;
  traderAddr: string;
}>('transaction/finalizeTransaction');
export const checkedTransaction = createAction<{
  chainId: CHAIN_ID;
  hash: string;
  blockNumber: number;
  traderAddr: string;
}>('transaction/checkedTransaction');

export const deleteTransaction = createAction<{
  chainId: CHAIN_ID;
  hash: string;
  traderAddr: string;
}>('transaction/deleteTransaction');
export const clearLatestTransaction = createAction('transaction/clearLatestTransaction');

export const replaceTransaction = createAction<{
  chainId: CHAIN_ID;
  oldHash: string;
  newHash: string;
  receipt?: ISerializableTransactionReceipt;
  traderAddr: string;
  transactionResponse: TransactionResponse;
}>('transaction/replaceTransaction');

export const sendTransaction = createAsyncThunk(
  'transaction/sendTransaction',
  async (
    {
      chainId,
      userAddr,
      signer,
      sendFunc,
      txParams,
      needWaitReceipt = true,
      notifyCatchingError = true,
      wssProvider,
    }: {
      signer: JsonRpcSigner;
      sendFunc: () => Promise<ContractReceipt | ContractTransaction>;
      needWaitReceipt?: boolean;
      notifyCatchingError?: boolean;
      txParams: {
        isDisableNotification?: boolean;
        type: OPERATION_TX_TYPE;
        instrument?: {
          baseSymbol: string;
          quoteSymbol: string;
          isInverse: boolean;
          quoteDecimal?: number;
          baseDecimal?: number;
        };
        sendingTemplate?: IParsedTemplate;
        extra?: { [key: string]: unknown };
      };
    } & ISendTxParams,
    { dispatch, getState },
  ): Promise<TransactionReceipt | undefined> => {
    if (sendFunc) {
      try {
        try {
          const ipBlocked = await dispatch(fetchIpIsBlocked()).unwrap();
          if (ipBlocked) {
            return;
          }

          const txResult = (await sendFunc()) as ContractTransaction;

          dispatch(
            addTransaction({
              chainId,
              traderAddr: userAddr,
              txInfo: {
                ...txParams,
                chainId,
                from: userAddr,
                // gasLimit: formatEther(txResult?.gasLimit),
                txHash: txResult.hash,
                transactionResponse: txResult,
                instrument: txParams.instrument,
                sendingTemplate: txParams.sendingTemplate,
              },
            }),
          );
          console.record(
            'tx',
            `[${txParams.type}] operation tx [${shortenAddress(txResult.hash)}] sent, waiting for confirmation...`,
            { txResult },
            { chainId, txParams, userAddr, sendFunc },
          );
          if (needWaitReceipt) {
            let waitProvider = wssProvider;
            if (!waitProvider) {
              const {
                web3: { chainAppProvider },
              } = getState() as AppState;
              waitProvider = chainAppProvider[chainId];
            }
            // use websocket provider
            let receipt: TransactionReceipt | undefined = undefined;
            if (waitProvider) {
              receipt = await waitProvider.waitForTransaction(txResult.hash, chainId === CHAIN_ID.BASE ? 0 : 1);
            } else {
              receipt = await txResult.wait(chainId === CHAIN_ID.BASE ? 0 : 1);
            }
            if (!receipt) {
              if (waitProvider) {
                receipt = await waitProvider.waitForTransaction(txResult.hash, 1);
              } else {
                receipt = await txResult.wait(1);
              }
            }
            // console.log(`------ ${txParams.type} ------:${txParams.type} succeed with receipt`, {
            //   chainId,
            //   userAddr,
            //   txParams,
            //   underlying,
            //   txResult,
            //   receipt,
            // });
            return receipt;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          const originalError = error?.error?.data?.originalError;
          let errorData = error?.error?.data?.originalError?.data || error?.data;
          if (typeof errorData !== 'string') {
            errorData = null;
          }

          const errorMsg = originalError?.message;

          // user rejected transaction
          if (
            error?.code === 4001 ||
            error?.code === 'ACTION_REJECTED' ||
            error?.message?.startsWith(`user rejected transaction`) ||
            error?.message?.startsWith(`user rejected the request`)
          ) {
            // throw error;
            return;
          }

          console.log('🚀 ~ file: actions.ts:131 ~ error:', { error, errorData });
          // if throw error with revert data, parse it and show parsed error in notify
          if (errorData) {
            // if (NEED_PARSE_NEW_REVERT[txParams.type]) {
            if (TX_INTERFACE_MAPPING[txParams.type] && TX_INTERFACE_MAPPING[txParams.type]?.length) {
              let errorDesc: ErrorDescription | undefined = undefined;
              const parsedErrorDescs = getNewRevertReasonsByTxType(txParams.type, errorData);
              if (parsedErrorDescs && parsedErrorDescs?.length > 0) {
                // TODO: maybe multiple error?
                errorDesc = parsedErrorDescs[0];
              }

              if (notifyCatchingError && errorDesc) {
                const err = new Error(errorDesc.name, { cause: error }) as IParsedError;
                err.parsedError = errorDesc;
                console.record('tx', `[${txParams.type}] operation tx failed`, err, {
                  chainId,
                  txParams,
                  userAddr,
                  sendFunc,
                  wssProvider,
                });
                throw err;
              }
              // try parse old error if is not new error type
            }
            // }
          }

          // only call when error no data
          if (!errorData && error.transaction) {
            if (wssProvider) {
              try {
                errorData = await wssProvider.call(error.transaction);
              } catch (ee) {
                console.log('🚀 ~ file: actions.ts:140 ~ ee:', ee);
              }
            }
          }

          // if throw error with revert data, parse it and show parsed error in notify
          if (errorData) {
            let msg = (errorData?.substr && decodeRevertData(errorData || '')) || errorData;
            console.log('🚀 ~ file: actions.ts:185 ~ msg:', msg, errorData);
            if (msg) {
              if (msg.startsWith('0x')) {
                msg = msg.slice(0, 10);
              }
              const err = new Error(msg, { cause: error }) as IParsedError;
              console.record('tx', `[${txParams.type}] operation tx failed`, err, {
                chainId,
                txParams,
                userAddr,
                sendFunc,
                wssProvider,
              });
              throw err;
            }
          }

          if (error?.reason) {
            const reason: string = error.reason;
            const err = new Error(reason, { cause: error }) as IParsedError;
            console.record('tx', `[${txParams.type}] operation tx failed`, err, {
              chainId,
              txParams,
              userAddr,
              sendFunc,
              wssProvider,
            });
            throw err;
          }

          const orginError = replaceRevert(errorMsg);
          if (orginError) {
            let msg = orginError;
            if (msg.startsWith('0x')) {
              msg = msg.slice(0, 10);
            }
            const err = new Error(msg, { cause: error }) as IParsedError;
            console.record('tx', `[${txParams.type}] operation tx failed`, err, {
              chainId,
              txParams,
              userAddr,
              sendFunc,
              wssProvider,
            });
            throw err;
          }
          throw error;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        SentryService.captureException(error, {
          name: 'transaction/sendTransaction',
          chainId,
          userAddr,
          sendFunc: sendFunc?.name,
          txParams: {
            ...txParams,
            instrument: JSON.stringify(txParams.instrument),
            sendingTemplate: txParams.sendingTemplate?.descTemplate,
          },
          needWaitReceipt,
          notifyCatchingError,
          wssRpc: wssProvider?.connection?.url,
          signerRpc: signer?.provider?.connection?.url,
        });

        throw error;
      }
    }

    return undefined;
  },
);

export const clearLatestTxErrorMessage = createAction('transaction/clearLatestTxErrorMessage');

import { CHAIN_ID } from '@derivation-tech/context';
import { getRevertReason } from '@derivation-tech/tx-plugin';
import { JsonRpcProvider } from '@ethersproject/providers';
import { cloneDeep as _cloneDeep, omit as _omit } from 'lodash';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalModalType, OPERATION_TX_TYPE } from '@/constants';
import { useAppDispatch } from '@/hooks';
import { useEventMapping } from '@/hooks/useEventMapping';
import { useGa } from '@/hooks/useGa';
import { useTxNotification } from '@/hooks/useTxNotification';
import { ITransactionInfo } from '@/types/transaction';
import { shortenAddress } from '@/utils/address';
import { GaCategory } from '@/utils/analytics';
import { getContractError, getMappedRevertReason } from '@/utils/error';
import { mapObjectValue } from '@/utils/notification';
import { getSDKRevertReasons } from '@/utils/tx';

import SentryService from '@/entities/SentryService';
import { setOpenModal } from '../global/actions';
import { useGlobalModalType } from '../global/hooks';
import { finalizeTransaction } from './actions';
export function useShowConfirmedTxNotify(
  provider: JsonRpcProvider | undefined,
  account: string | undefined,
): ({ chainId, hash, transaction }: { chainId: CHAIN_ID; hash: string; transaction: ITransactionInfo }) => void {
  // const { open } = useMessage();
  const { open } = useTxNotification();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const eventMappingFn = useEventMapping();
  const gaEvent = useGa();
  const closeModalAfterTx = useCloseModalAfterTx();

  return useCallback(
    async ({ chainId, hash, transaction }: { chainId: CHAIN_ID; hash: string; transaction: ITransactionInfo }) => {
      let message: React.ReactNode = ``;
      if (transaction.receipt) {
        if (transaction.receipt?.status === 1) {
          try {
            if (transaction.isDisableNotification) {
              return;
            }
            if ([OPERATION_TX_TYPE.MINT, OPERATION_TX_TYPE.APPROVE].includes(transaction.type)) {
              throw new Error('tx no mapping template');
            }

            if (account) {
              const mappings = await eventMappingFn({
                chainId,
                extra: transaction.extra,
                txType: transaction.type,
                receipt: transaction.receipt,
                userAddr: account,
                instrument: transaction?.instrument || { baseSymbol: '', quoteSymbol: '', isInverse: false },
              });
              if (mappings.length <= 0) throw new Error('tx no mapping template');
              message = (
                <div>
                  {mappings.map((map) => (
                    <div key={map.descTemplate}>
                      {t(
                        map.descTemplate,
                        mapObjectValue(map.templateArgs, 'string', (value) => t(value)),
                      )}
                    </div>
                  ))}
                </div>
              );
              console.record(
                'tx',
                `[${transaction.type}] operation tx [${shortenAddress(transaction.txHash)}] success`,
                { transaction, receipt: transaction.receipt, mappings },
                { chainId, txHash: transaction.txHash },
              );
              gaEvent({
                category: GaCategory.TRANSACTION,
                action: `${transaction.type} Success With Message`,
                label: {
                  txHash: transaction.txHash,
                  txType: transaction.type,
                  events: mappings.map((map) => _omit(_cloneDeep(map.eventSource), ['receipt'])),
                },
              });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            if (error?.message !== 'tx no mapping template')
              SentryService.captureException(error, {
                name: `notification:notification.${transaction.type}.successDesc`,
                chainId,
                txHash: hash,
                type: transaction.type,
                receipt: transaction?.receipt,
                status: transaction?.receipt?.status,
              });
            message = t(`notification.${transaction.type}.successDesc`);
            console.record(
              'tx',
              `[${transaction.type}] operation tx [${shortenAddress(transaction.txHash)}] success`,
              { transaction, receipt: transaction.receipt },
              { chainId, txHash: transaction.txHash },
            );
            gaEvent({
              category: GaCategory.TRANSACTION,
              action: `${transaction.type} Success Without Message`,
              label: {
                txHash: transaction.txHash,
                txType: transaction.type,
              },
            });
          }
        } else {
          try {
            if (transaction.receipt.reason === 'cancelled') {
              message = t(`notification.tx.cancelled`);
            } else {
              if (provider) {
                // const reason = await sdkContext.getRevertReason(transaction.transactionResponse);
                const reason = await getRevertReason(provider, transaction.transactionResponse);

                if (typeof reason === 'string' && reason !== '') {
                  let mappedReason = getMappedRevertReason(reason);
                  // if no revert data show fallback error
                  if (
                    /(missing revert data in call exception)|( Transaction reverted without a reason string)/g.test(
                      mappedReason.trim(),
                    )
                  ) {
                    mappedReason = t(`notification.tx.fallbackError`);
                  }
                  message = mappedReason;
                } else {
                  try {
                    const errorDescs = await getSDKRevertReasons({
                      txType: transaction.type,
                      txResponse: transaction.transactionResponse,
                      provider: provider,
                    });
                    if (errorDescs) {
                      message = (
                        <div>
                          {
                            <div>
                              {getContractError(
                                typeof errorDescs === 'string' ? errorDescs : errorDescs.sighash || errorDescs.name,
                              )}
                            </div>
                          }
                        </div>
                      );
                    }

                    console.record(
                      'tx',
                      `[${transaction.type}] operation tx [${shortenAddress(transaction.txHash)}] failed`,
                      { transaction, receipt: transaction.receipt, errorDescs },
                      { chainId, txHash: transaction.txHash },
                    );
                  } catch (error) {
                    console.error('🚀 ~ file: useTxNotify.tsx ~ line 108 ~ error', error);
                  }
                }
              }
            }
            if (!message) {
              throw new Error('tx no mapping template');
            }
            gaEvent({
              category: GaCategory.TRANSACTION,
              action: `${transaction.type} failed`,
              label: {
                txHash: transaction.txHash,
                txType: transaction.type,
                message,
              },
            });
          } catch (error) {
            SentryService.captureException(error, {
              name: `notification:notification.${transaction.type}.error`,
              chainId,
              txHash: hash,
              type: transaction.type,
              receipt: transaction?.receipt,
              status: transaction?.receipt?.status,
            });
            console.error('🚀 ~ file: hook.ts ~ line 56 ~ useShowConfirmedTxNotify ~ error', error);
            message = t(`notification.${transaction.type}.error`);
            gaEvent({
              category: GaCategory.TRANSACTION,
              action: `${transaction.type} failed`,
              label: {
                txHash: transaction.txHash,
                txType: transaction.type,
              },
            });
          }
        }
      }

      // TODO: use correct notification template
      open({
        message: t(`notification.${transaction.type}.${transaction.receipt?.success ? 'success' : 'error'}`),
        description: message,

        tx: transaction.txHash,
        type: transaction.receipt?.success ? 'success' : 'error',
      });

      account &&
        transaction.receipt &&
        dispatch(
          finalizeTransaction({
            chainId,
            traderAddr: account,
            hash,
            receipt: transaction.receipt,
          }),
        );
      closeModalAfterTx(transaction);

      // display in recent tx list

      // clear up pending tx

      // dispatch display in pair history
    },
    [open, t, account, dispatch, closeModalAfterTx, eventMappingFn, gaEvent, provider],
  );
}

export function useSendTxNotify(): ({
  chainId,
  hash,
  transaction,
}: {
  chainId: CHAIN_ID;
  hash: string;
  transaction: ITransactionInfo;
}) => void {
  // const dispatch = useAppDispatch();
  const { open } = useTxNotification();
  const { t } = useTranslation();
  return useCallback(
    ({ transaction }: { chainId: CHAIN_ID; hash: string; transaction: ITransactionInfo }) => {
      const title = t(`notification.${transaction.type}.info`);
      const desc = transaction.sendingTemplate
        ? t(
            transaction.sendingTemplate?.descTemplate,
            mapObjectValue(transaction.sendingTemplate?.templateArgs, 'string', (value) => t(value)),
          )
        : undefined;
      open({
        message: title,
        description: desc,
        tx: transaction.txHash,
        type: 'info',
      });
      console.record('tx', `[${transaction.type}] operation tx [${shortenAddress(transaction.txHash)}] sending `, {
        transaction,
        desc,
        title,
      });
    },
    [open, t],
  );
}

export function useSendTxError(): ({ error, txType }: { error: string; txType: OPERATION_TX_TYPE }) => void {
  // const dispatch = useAppDispatch();
  const { open } = useTxNotification();
  const { t } = useTranslation();
  return useCallback(
    ({ error, txType }: { error: string; txType: OPERATION_TX_TYPE }) => {
      if (error) {
        let errorContent = t(`notification.${txType}.error`);
        const mappingError = getContractError(error);
        if (mappingError) {
          errorContent = mappingError;
        } else {
          // TODO: remove temp code
          errorContent = `${errorContent}: ${error}`;
        }
        open({
          message: t(`notification.${txType}.error`),
          description: errorContent,
          type: 'error',
        });
      }
    },
    [open, t],
  );
}

/**
 * close global modal after send tx
 * @returns
 */
function useCloseModalAfterTx(): (txInfo: ITransactionInfo) => void {
  const modalType = useGlobalModalType();
  const dispatch = useAppDispatch();

  return useCallback(
    (txInfo: ITransactionInfo) => {
      let closeModal = false;
      if (modalType) {
        if (txInfo.type === OPERATION_TX_TYPE.DEPOSIT && modalType === GlobalModalType.Deposit) {
          closeModal = true;
        } else if (txInfo.type === OPERATION_TX_TYPE.WITHDRAW && modalType === GlobalModalType.Withdraw) {
          closeModal = true;
        }

        if (closeModal) {
          dispatch(setOpenModal({ type: null }));
        }
      }
    },
    [dispatch, modalType],
  );
}

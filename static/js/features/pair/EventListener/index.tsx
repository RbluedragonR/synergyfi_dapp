import { useDebounceFn } from 'ahooks';
import { BigNumber } from 'ethers';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { OPERATION_TX_TYPE } from '@/constants';
import { WrappedInstrument } from '@/entities/WrappedInstrument';
import { useGlobalStore } from '@/features/global/stores';
import { PollingHistoryId } from '@/features/global/type';
import { useAppDispatch } from '@/hooks';
import { useTxNotification } from '@/hooks/useTxNotification';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { WorkerEventNames, WorkerOnInstrumentOrderUpdateResult } from '@/types/worker';
import { mapObjectValue } from '@/utils/notification';
import { getAdjustTradePrice, getAdjustTradeSize } from '@/utils/pairs';
import { getWatchWorkerEventCallback } from '@/worker/helper';
import { TickMath } from '@synfutures/sdks-perp';
import { debounce } from 'lodash';

export function useOrderUpdateEventListener(instrument: WrappedInstrument | undefined): void {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { open } = useTxNotification();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { run: showNotify } = useDebounceFn(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (txType: OPERATION_TX_TYPE, instrumentAddr: string, expiry: number, txHash: string, args: any) => {
      let message: React.ReactNode = ``;
      if (instrumentAddr !== instrument?.instrumentAddr) return;
      try {
        if (chainId && userAddr && instrument) {
          console.log('notification event [Fill] args:', args);
          const tickPrice = getAdjustTradePrice(TickMath.getWadAtTick(Number(args?.tick)), instrument.isInverse);
          const size = getAdjustTradeSize(BigNumber.from(args?.pic?.size || 0), instrument.isInverse);
          const tradeType = size.gt(0) ? 'common.bought' : 'common.sold';
          const descTemplate = `notification.${txType}.successDesc`;
          const templateArgs = {
            tickPrice: tickPrice.formatDisplayNumber({ type: 'price' }),
            size: size.abs().formatDisplayNumber(),
            tradeType,
            base: instrument.baseToken.symbol,
          };
          message = (
            <div>
              <div key={descTemplate}>
                {t(
                  descTemplate,
                  mapObjectValue(templateArgs, 'string', (value) => t(value)),
                )}
              </div>
            </div>
          );
        }
      } catch (error) {
        message = t(`notification.${txType}.success`);
      }
      open({
        message: t(`notification.${txType}.success`),
        description: message,

        tx: txHash,
        type: 'success',
      });
    },
    { wait: 500 },
  );

  // watch order update event
  useEffect(() => {
    if (window.synWorker && chainId) {
      const cbFunction = debounce(
        (e: MessageEvent) =>
          getWatchWorkerEventCallback<WorkerOnInstrumentOrderUpdateResult>(
            e,
            window.synWorker,
            WorkerEventNames.OnInstrumentOrderUpdateEvent,
            (data) => {
              const result = data;

              // updatePairDepthData(result.instrumentAddr, result.expiry, result.block);
              if (result.eventName === 'Fill') {
                const { setPollingHistoryTx } = useGlobalStore.getState();
                setPollingHistoryTx({
                  userAddress: result.userAddr,
                  chainId,
                  pollingHistoryId: PollingHistoryId.order,
                  tx: result.transactionHash,
                });

                showNotify(
                  OPERATION_TX_TYPE.FILL_ORDER,
                  result.instrumentAddr,
                  result.expiry,
                  result.transactionHash,
                  result.eventArgs,
                );
              }
            },
            { chainId },
          ),
        300,
      );
      window.synWorker.addEventListener('message', cbFunction);
      // Return a cleanup function to remove the event listener
      return () => {
        window.synWorker.removeEventListener('message', cbFunction);
      };
    }
  }, [chainId, dispatch]);
}

export function OrderEventListener({ instrument }: { instrument: WrappedInstrument | undefined }): null {
  useOrderUpdateEventListener(instrument);
  return null;
}

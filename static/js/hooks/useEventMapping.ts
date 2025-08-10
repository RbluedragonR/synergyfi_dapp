import { CHAIN_ID } from '@derivation-tech/context';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from 'ethers';
import { useCallback } from 'react';

import { OPERATION_TX_TYPE } from '@/constants';
import { EVENT_NAMES } from '@/constants/event';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { IEventSource, IParsedEventLog } from '@/types/transaction';
import { parseTxEventLog } from '@/utils/notification';
import { currentUTCTime } from '@/utils/timeUtils';
import { fixBalanceNumberDecimalsTo18 } from '@/utils/token';
import { getEventLogs, isFilterEvent } from '@/utils/tx';
import { Side } from '@synfutures/sdks-perp';
import _ from 'lodash';

export function useEventMapping(): ({
  chainId,
  txType,
  receipt,
  userAddr,
  instrument,
  extra,
}: {
  chainId: CHAIN_ID;
  txType: OPERATION_TX_TYPE;
  receipt: TransactionReceipt;
  extra?: { [key: string]: unknown };
  userAddr: string;
  instrument: {
    quoteSymbol: string;
    baseSymbol: string;
    isInverse: boolean;
  };
}) => Promise<IParsedEventLog[]> {
  return useCallback(
    async ({
      txType,
      receipt,
      instrument,
      extra,
    }: {
      chainId: CHAIN_ID;
      txType: OPERATION_TX_TYPE;
      receipt: TransactionReceipt;
      extra?: { [key: string]: unknown };
      instrument: {
        quoteSymbol: string;
        baseSymbol: string;
        isInverse: boolean;
        quoteDecimal?: number;
      };
    }) => {
      let res: IParsedEventLog[] = [];
      const eventLogs = await getEventLogs(txType, receipt);
      if (eventLogs) {
        eventLogs.forEach((eventLog) => {
          const eventSource: IEventSource = {
            txType,
            eventName: eventLog.name,
            args: eventLog.args,
            blockNumber: eventLog.blockNumber,
            logIndex: eventLog.logIndex,
            timestamp: Math.round(currentUTCTime() / 1000),
            txHash: eventLog.txHash,
            // receipt: eventLog.receipt,
          };
          const parsedLog = parseTxEventLog({
            eventSource: eventSource,
            instrument,
          }) as IParsedEventLog;
          if (parsedLog) {
            const isFilter = isFilterEvent({ eventSource });
            isFilter && res.push(parsedLog);
          }
        });
      }
      if (res.length > 1) {
        if (txType === OPERATION_TX_TYPE.SETTLE) {
          // if settle with cancel, add cancel balance to settle balance
          const settleLog = res.find((log) => log.eventSource.eventName === EVENT_NAMES.Settle);
          if (settleLog) {
            let settleBalance = WrappedBigNumber.from(0);
            if (res.find((log) => log.eventSource.eventName === EVENT_NAMES.Gather)) {
              try {
                res
                  .filter((log) => log.eventSource.eventName === EVENT_NAMES.Gather)
                  .forEach((evLog) => {
                    if (evLog.eventSource?.args) {
                      const balance = WrappedBigNumber.from(
                        fixBalanceNumberDecimalsTo18(
                          BigNumber.from(evLog?.eventSource?.args?.quantity),
                          instrument?.quoteDecimal || 18,
                        ),
                      );
                      if (balance.gt(0)) {
                        settleBalance = settleBalance.add(balance);
                      }
                    }
                  });
              } catch (error) {}
            }
            if (settleBalance.gt(0)) {
              settleLog.templateArgs.balance = settleBalance.formatDisplayNumber();
            }
            res = [settleLog];
          }
        }
        // multi cancel order
        else if (txType === OPERATION_TX_TYPE.CANCEL_ORDER) {
          const result: IParsedEventLog = { eventSource: res[0].eventSource, descTemplate: '', templateArgs: {} };
          result.descTemplate = `notification.cancelOrder.multiSuccessful`;
          result.templateArgs = {
            orderNumber: res.length.toString(),
          };
          res = [result];
        }
        // batch place scaled order
      }
      if (txType === OPERATION_TX_TYPE.BATCH_PLACE_SCALED_ORDER) {
        try {
          const baseSize: BigNumber = extra?.baseSize as BigNumber;
          const side = extra?.side as Side;
          const baseSymbol = instrument.baseSymbol;
          const orderCount = res.length;
          let upperPrice = WrappedBigNumber.from((extra?.upperPrice as string) || 0);
          let lowerPrice = WrappedBigNumber.from((extra?.lowerPrice as string) || 0);
          if (upperPrice.lt(lowerPrice)) {
            [upperPrice, lowerPrice] = [lowerPrice, upperPrice];
          }
          const size = WrappedBigNumber.from(baseSize);
          const tradeType = side === Side.LONG ? 'common.buy' : 'common.sell';

          const result: IParsedEventLog = {
            eventSource: _.get(res, [0, 'eventSource']),
            descTemplate: '',
            templateArgs: {},
          };
          result.descTemplate = `notification.${OPERATION_TX_TYPE.BATCH_PLACE_SCALED_ORDER}.successDesc`;
          result.templateArgs = {
            size: size.abs().formatDisplayNumber(),
            base: baseSymbol || '',
            tradeType: tradeType,
            lowerPrice: lowerPrice.formatPriceString(),
            upperPrice: upperPrice.formatPriceString(),
            orderCount: orderCount.toString(),
          };
          res = [result];
        } catch (error) {
          console.log('🚀 ~ useEventMapping ~ error:', error);
        }
      }

      console.log('🚀 ~ useEventMapping ~ res:', res);
      return res;
    },
    [],
  );
}

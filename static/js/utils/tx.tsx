import { extractEvents, TransactionEvent } from '@derivation-tech/context';
import { getRevertReason } from '@derivation-tech/tx-plugin';
import { ErrorDescription } from '@ethersproject/abi/lib.esm/interface';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider';
import { Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { BytesLike, Interface } from 'ethers/lib/utils';

import { OPERATION_TX_TYPE, ZERO } from '@/constants';
import { OPERATE_EVENT_MAPPING } from '@/constants/event';
import { TX_INTERFACE_MAPPING } from '@/constants/tx';
import { IEventSource } from '@/types/transaction';

export function getTxMappingInterface(txType: OPERATION_TX_TYPE):
  | {
      interfaces: Interface[];
      events: string[];
    }
  | undefined {
  return OPERATE_EVENT_MAPPING[txType];
}

export async function getEventLogs(
  txType: OPERATION_TX_TYPE,
  receipt: TransactionReceipt,
): Promise<TransactionEvent[] | undefined> {
  try {
    const interfaceMapping = getTxMappingInterface(txType);
    if (interfaceMapping) {
      const eventLogs = await extractEvents(
        // chainId,
        receipt,
        interfaceMapping.interfaces,
        interfaceMapping.events,
      );
      console.log('🚀 ~ file: hook.ts ~ line 64 ~ res', eventLogs);
      return eventLogs;
    }
  } catch (error) {
    console.log('🚀 ~ file: hook.ts ~ line 66 ~ error', error);
  }
}

/**
 * is filter event
 * @param param0
 * @returns
 */
export function isFilterEvent({ eventSource }: { eventSource: IEventSource }): boolean {
  let isShow = true;
  if (eventSource.eventName === 'ClaimFee' && eventSource.args?.feeAmount) {
    const fee = BigNumber.from(eventSource.args.feeAmount);
    isShow = !fee.eq(ZERO);
  }

  return isShow;
}

export function replaceRevert(reason: string): string {
  if (reason?.startsWith('execution reverted:')) {
    return reason.replace('execution reverted: ', '');
  }
  return reason;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function getRevertReasonByError(error: any): string {
  if (error.reason) {
    const reason: string = error.reason;
    return replaceRevert(reason);
  }
  return '';
}

/**
 * get new revert reason by interface parse error
 * @param txType
 * @param data
 * @returns
 */
export function getNewRevertReasonsByTxType(
  txType: OPERATION_TX_TYPE,
  data: BytesLike,
): ErrorDescription[] | undefined {
  if (TX_INTERFACE_MAPPING[txType]) {
    try {
      const res: ErrorDescription[] = [];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      for (let i = 0; i < TX_INTERFACE_MAPPING[txType]!.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const abiInterface = TX_INTERFACE_MAPPING[txType]![i];
        const errorDesc = abiInterface.parseError(data);
        if (errorDesc) {
          res.push(errorDesc);
        }
      }
      return res;
    } catch (error) {
      console.log('🚀 ~ file: tx.tsx ~ line 274 ~ getRevertReasonsByTxType ~ error', error);
    }
  }
  return undefined;
}

/**
 * get new revert reason by sdk
 * @param param0
 * @returns
 */
export async function getSDKRevertReasons({
  txType,
  provider,
  txResponse,
}: {
  txType: OPERATION_TX_TYPE;
  txResponse: TransactionResponse;
  provider: Provider;
}): Promise<string | ErrorDescription | undefined> {
  if (TX_INTERFACE_MAPPING[txType]) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const errorDesc = await getRevertReason(provider, txResponse, TX_INTERFACE_MAPPING[txType]!);
      return errorDesc;
    } catch (error) {}
  }
  return undefined;
}

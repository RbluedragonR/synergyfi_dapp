import { HISTORY_RANGE } from '@/constants/history';
import { POLLING_OPEN_ORDER_CREATE_TIME } from '@/constants/polling';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { useWrappedOrderListByUser } from '@/features/account/orderHook';
import { getOpenOrderCreateTime } from '@/features/graph/actions';
import { selectOpenOrderCreateTime } from '@/features/graph/slice';
import { useSDK } from '@/features/web3/hook';
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '..';
import { usePoller } from '../common/usePoller';
import { useChainId, useUserAddr } from '../web3/useChain';
export type UseOpenOrderListWithCreateTimeProps = Parameters<typeof useWrappedOrderListByUser>;
export default function useOpenOrderListWithCreateTime(orders: WrappedOrder[] | undefined): WrappedOrder[] | undefined {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const sdk = useSDK(chainId);
  const orderHistoryCreateTimeMap = useAppSelector(selectOpenOrderCreateTime(chainId, userAddr));
  const isAllOrderCreateTimeFound = useMemo(() => {
    let ans = true;
    for (let index = 0; index < (orders || []).length; index++) {
      if (orders?.[index]) {
        const timestamp = orderHistoryCreateTimeMap?.[orders?.[index].getInstrumentAddrTickSizeId()];
        if (!timestamp) {
          ans = false;
        }
      }
    }
    return ans;
  }, [orders?.length, JSON.stringify(orderHistoryCreateTimeMap)]);
  usePoller(
    () => {
      if (chainId && sdk && userAddr && !isAllOrderCreateTimeFound) {
        dispatch(
          getOpenOrderCreateTime({
            chainId,
            userAddr,
            timeRange: HISTORY_RANGE.ALL,
            requiredAllData: true,
            requiredOpenDataOnly: true,
            sdk,
          }),
        );
      }
    },
    [chainId, dispatch, isAllOrderCreateTimeFound, userAddr],
    POLLING_OPEN_ORDER_CREATE_TIME,
    3000,
  );

  useEffect(() => {
    for (let index = 0; index < (orders || []).length; index++) {
      if (orders?.[index]) {
        const timestamp = orderHistoryCreateTimeMap?.[orders?.[index].getInstrumentAddrTickSizeId()];
        if (timestamp) {
          orders?.[index].setCreateTimestamp(timestamp);
        }
      }
    }
  }, [orders?.length, JSON.stringify(orderHistoryCreateTimeMap)]);
  return orders;
}

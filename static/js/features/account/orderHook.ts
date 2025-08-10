import { PERP_EXPIRY } from '@synfutures/sdks-perp';
import _ from 'lodash';
import { useEffect, useMemo } from 'react';

import { CHAIN_ID } from '@/constants/chain';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { useAppSelector } from '@/hooks';
import { IMetaOrder } from '@/types/account';

import { useWrappedPortfolio, useWrappedPortfolioByPairId, useWrappedPortfolioMap } from './portfolioHook';
import { selectMetaOrder, selectMetaOrderByPairId, selectOrderMap } from './slice';

//#region  redux meta order selector

export function useMetaOrderMap(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): { [orderId: string]: IMetaOrder } {
  const metaOrderMap = useAppSelector(selectOrderMap(chainId, userAddr));

  return metaOrderMap;
}

export function useMetaOrder(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  orderId: string | undefined,
): IMetaOrder | undefined {
  const metaOrder = useAppSelector(selectMetaOrder(chainId, userAddr, orderId));

  return metaOrder;
}

export function useMetaOrderByPairId(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): { [orderId: string]: IMetaOrder } | undefined {
  const metaOrderMap = useAppSelector(selectMetaOrderByPairId(chainId, userAddr, pairId));
  return metaOrderMap;
}

export function useIsWrappingOrder(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId?: string,
): boolean {
  const metaOrderMap = useMetaOrderMap(chainId, userAddr);
  const metaOrderPairMap = useMetaOrderByPairId(chainId, userAddr, pairId);
  const metaOrders = useMemo(() => {
    return pairId ? metaOrderPairMap : metaOrderMap;
  }, [metaOrderMap, metaOrderPairMap, pairId]);
  const instances = WrappedOrder.getInstanceMap(chainId);
  return useMemo(() => {
    if (!chainId || !userAddr) return false;

    return Object.keys(metaOrders || {}).length > 0 && Object.keys(instances || {}).length === 0;
  }, [chainId, userAddr, metaOrders, instances]);
}

//#endregion ------------------ redux meta order selector

function useBlendWrappedOrder({
  metaOrder,
  chainId,
  rootPortfolio,
}: {
  metaOrder: IMetaOrder | undefined;
  chainId: CHAIN_ID | undefined;
  rootPortfolio: WrappedPortfolio | undefined;
}): WrappedOrder | undefined {
  return useMemo(() => {
    if (!chainId || !rootPortfolio) return undefined;
    const origin = metaOrder;
    if (origin) {
      const wrappedOrder = WrappedOrder.getInstance(origin.id, chainId);
      if (!wrappedOrder) {
        const instance = WrappedOrder.wrapInstance({ metaOrder: origin, rootPortfolio });
        rootPortfolio.connectOrder(instance);
        return instance;
      } else {
        wrappedOrder.fillField(origin);
      }
      return wrappedOrder;
    }
    return undefined;
  }, [chainId, metaOrder, rootPortfolio]);
}

/**
 * get wrapped order by order id
 * @param chainId
 * @param userAddr
 * @param orderId
 * @returns
 */
export function useWrappedOrder(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  orderId: string | undefined,
): WrappedOrder | undefined {
  const metaOrder = useMetaOrder(chainId, userAddr, orderId);
  const rootPortfolio = useWrappedPortfolio(chainId, userAddr, metaOrder?.portfolioId);
  useEffect(() => {
    // remove order from portfolio if metaOrder is undefined
    if (!metaOrder && rootPortfolio && userAddr && orderId) {
      rootPortfolio.removeOrder(orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaOrder, orderId, userAddr, rootPortfolio]);
  return useBlendWrappedOrder({ metaOrder, chainId, rootPortfolio });
}

/***
 * get wrapped order list by pair id
 */
export function useWrappedOrderList(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): WrappedOrder[] | undefined {
  const metaOrderMap = useMetaOrderByPairId(chainId, userAddr, pairId);
  const rootPortfolio = useWrappedPortfolioByPairId(chainId, userAddr, pairId);
  return useMemo(() => {
    if (!chainId || !rootPortfolio || !metaOrderMap) return undefined;

    return _.orderBy(
      _.reduce(
        metaOrderMap,
        (acc: WrappedOrder[], metaOrder: IMetaOrder) => {
          const wrappedOrder = WrappedOrder.getInstance(metaOrder.id, chainId);
          if (!wrappedOrder) {
            const newWrappedOrder = WrappedOrder.wrapInstance({ metaOrder, rootPortfolio });
            rootPortfolio.connectOrder(newWrappedOrder);
            acc.push(newWrappedOrder);
          } else {
            wrappedOrder.fillField(metaOrder);
            acc.push(wrappedOrder);
          }
          return acc;
        },
        [],
      ),
      [(o) => o.oid],
      ['desc'],
    );
  }, [chainId, metaOrderMap, rootPortfolio]);
}

export function useWrappedOrderListByUser(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  isShowNormalPair = true,
): WrappedOrder[] | undefined {
  const metaOrderMap = useMetaOrderMap(chainId, userAddr);
  const rootPortfolioMap = useWrappedPortfolioMap(chainId, userAddr);
  return useMemo(() => {
    if (!chainId || !rootPortfolioMap || !metaOrderMap) return undefined;

    return _.orderBy(
      _.reduce(
        metaOrderMap,
        (acc: WrappedOrder[], metaOrder: IMetaOrder) => {
          const wrappedOrder = WrappedOrder.getInstance(metaOrder.id, chainId);
          const rootPortfolio = rootPortfolioMap[metaOrder.portfolioId];

          function pushOrder(order: WrappedOrder) {
            if (!isShowNormalPair || order.rootPair.isNormalPair) {
              acc.push(order);
            }
          }

          if (rootPortfolio) {
            if (!wrappedOrder) {
              const newWrappedOrder = WrappedOrder.wrapInstance({ metaOrder, rootPortfolio: rootPortfolio });
              rootPortfolio.connectOrder(newWrappedOrder);
              pushOrder(newWrappedOrder);
            } else {
              wrappedOrder.fillField(metaOrder);
              pushOrder(wrappedOrder);
            }
          }

          return acc;
        },
        [],
      ),
      [
        (o) => {
          return o.rootInstrument.displayBaseToken.symbol;
        },
        (o) => {
          return o.rootPair.expiry === PERP_EXPIRY ? 0 : o.rootPair.expiry;
        },
        (o) => o.oid,
      ],
      ['asc', 'asc', 'desc'],
    );
  }, [chainId, isShowNormalPair, metaOrderMap, rootPortfolioMap]);
}

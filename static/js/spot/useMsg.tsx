/**
 * @description Component-TradeFormAlert
 */

import { useMemo } from 'react';

import { useTokenBalance } from '@/features/balance/hook';
import { useSimulateSwap } from '@/features/spot/query';
import { useSpotState } from '@/features/spot/store';
import { useChainId } from '@/hooks/web3/useChain';
import { AlertProps } from 'antd';
export enum MsgId {
  InsufficientBalance = 'InsufficientBalance',
  RouteNotFound = 'RouteNotFound',
  TryDamount = 'TryDamount',
  SimulTimeout = 'SimulTimeout',
}

export const MsgInfo: {
  [id in MsgId]: {
    type: AlertProps['type'] | 'warning';
    i18nId: string;
    i18nIdInRoute?: string;
    shownInRoute: boolean;
  };
} = {
  [MsgId.InsufficientBalance]: {
    type: 'error',
    i18nId: 'common.spot.insufficientSb',
    shownInRoute: false,
  },
  [MsgId.RouteNotFound]: {
    type: 'error',
    i18nId: 'spot.not-found-swap',
    i18nIdInRoute: 'spot.not-found',
    shownInRoute: true,
  },
  [MsgId.TryDamount]: {
    type: 'warning',
    i18nId: 'common.spot.tryDamount',
    shownInRoute: false,
  },
  [MsgId.SimulTimeout]: {
    type: 'warning',
    i18nId: 'common.spot.simulTimeout',
    i18nIdInRoute: 'common.spot.simulTimeout',
    shownInRoute: true,
  },
};

export default function useMsgIds() {
  const { data: simulation } = useSimulateSwap();
  const { token0: sellToken, sellAmount } = useSpotState();
  const chainId = useChainId();
  const sellBalance = useTokenBalance(sellToken.address, chainId);

  const msgIds = useMemo(() => {
    const result: MsgId[] = [];

    if (sellBalance && sellBalance.lt(sellAmount || 0)) {
      result.push(MsgId.InsufficientBalance);
    }

    if (simulation?.data?.route.length === 0 && simulation?.timeout !== true) {
      result.push(MsgId.RouteNotFound);
    }

    if (simulation?.message && sellBalance.lt(sellAmount || 0)) {
      result.push(MsgId.TryDamount);
    }

    if (simulation?.timeout) {
      result.push(MsgId.SimulTimeout);
    }

    return result;
  }, [sellAmount, sellBalance, simulation?.data?.route.length, simulation?.message, simulation?.timeout]);

  return msgIds;
}

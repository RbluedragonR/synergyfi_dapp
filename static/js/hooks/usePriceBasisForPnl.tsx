/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useCallback } from 'react';

import { PriceBasisForPnl } from '@/constants/trade/priceBasisForPnl';
import { setPriceBasisForPnl } from '@/features/trade/actions';

import { useAppDispatch, useAppSelector } from '.';

export function usePriceBasisForPnl() {
  const priceBasisForPnl = useAppSelector((state) => state.trade.priceBasisForPnl);
  const dispatch = useAppDispatch();

  const onClickPriceBasisCheckbox = useCallback(
    (newPriceBasisForPnl: PriceBasisForPnl) => {
      dispatch(setPriceBasisForPnl({ priceBasisForPnl: newPriceBasisForPnl }));
    },
    [dispatch],
  );
  return {
    onClickPriceBasisCheckbox,
    priceBasisForPnl,
  };
}

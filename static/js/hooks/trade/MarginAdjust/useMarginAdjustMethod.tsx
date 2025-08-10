import { setAdjustMarginMethod } from '@/features/trade/actions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { MarginAdjustMethod } from '@/types/trade';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type MarginAdjustMethodInfoProps = {
  i18nId: string;
  key: string;
  value: string;
};
export const marginAdjustMethodInfos: {
  [id in MarginAdjustMethod]: MarginAdjustMethodInfoProps;
} = {
  [MarginAdjustMethod.Leverage]: {
    i18nId: 'common.leverage',
    key: MarginAdjustMethod.Leverage,
    value: MarginAdjustMethod.Leverage,
  },
  [MarginAdjustMethod.Amount]: {
    i18nId: 'common.amount',
    key: MarginAdjustMethod.Amount,
    value: MarginAdjustMethod.Amount,
  },
};
export default function useMarginAdjustMethod() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeMarginAdjustMethod = useAppSelector((state) => state.trade.adjustMarginControlState.marginAdjustMethod);

  const toggleActiveMarginAdjustMethod = useCallback(() => {
    dispatch(
      setAdjustMarginMethod(
        activeMarginAdjustMethod === MarginAdjustMethod.Amount
          ? MarginAdjustMethod.Leverage
          : MarginAdjustMethod.Amount,
      ),
    );
  }, [activeMarginAdjustMethod, dispatch]);
  const tradeAdjustMethodItems = useMemo(
    () =>
      [marginAdjustMethodInfos[MarginAdjustMethod.Leverage], marginAdjustMethodInfos[MarginAdjustMethod.Amount]].map(
        (item) => ({ ...item, label: t(item.i18nId) }),
      ),
    [t],
  );
  return {
    activeMarginAdjustMethod,
    toggleActiveMarginAdjustMethod,
    tradeAdjustMethodItems,
  };
}

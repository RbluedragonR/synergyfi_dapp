/**
 * @description Component-ScaleOrderCount
 */
import { useTranslation } from 'react-i18next';
import './index.less';

import Alert from '@/components/Alert';
import { DEFAULT_ORDER_COUNT, DEFAULT_STEP_RATIO, MIN_ORDER_COUNT } from '@/constants/trade';
import { WrappedPair } from '@/entities/WrappedPair';
import { setScaleFormAmount } from '@/features/trade/actions';
import { useScaleFormState, useUpdatePriceByTicks } from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import StepRatioSelector from '@/pages/trade/CoinPriceChart/StepRatioSelector';
import { Context } from '@derivation-tech/context';
import { Side } from '@synfutures/sdks-perp';
import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  lowerLimitTick: number;
  upperLimitTick: number;
  tradeSide: Side;
  sdkContext: Context | undefined;
  pair: WrappedPair | undefined;
}
const ScaleOrderCount: FC<IPropTypes> = function ({ tradeSide, pair, lowerLimitTick, upperLimitTick }) {
  const chainId = useChainId();
  const scaleFormState = useScaleFormState(chainId);
  const { t } = useTranslation();
  const [count, setCount] = useState<number>(DEFAULT_ORDER_COUNT);
  const dispatch = useAppDispatch();
  const [stepRatio, setStepRatio] = useState(DEFAULT_STEP_RATIO);
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const gap = useMemo(() => upperLimitTick - lowerLimitTick, [lowerLimitTick, upperLimitTick]);
  const bgWidth = useMemo(() => count * 20 + (count - 1) * 8 + 4, [count]);
  const updatePricesByTicks = useUpdatePriceByTicks();

  const onOrderSelect = useCallback(
    (orderCount?: number, stepRatio?: number) => {
      if (!chainId || !scaleFormState.lowerTick) return;
      !!orderCount && setCount(orderCount);
      orderCount = orderCount || scaleFormState.orderCount;
      stepRatio = stepRatio || scaleFormState.stepRatio;
      const countTicksGap = (orderCount - 1) * stepRatio;
      let newLowerTick = scaleFormState.lowerTick;
      let newUpperTick = scaleFormState.upperTick;
      if (tradeSide === Side.LONG) {
        newLowerTick = newUpperTick - countTicksGap;
        if (newLowerTick < lowerLimitTick) {
          newLowerTick = lowerLimitTick;
          newUpperTick = newLowerTick + countTicksGap;
        }
      }
      if (tradeSide === Side.SHORT) {
        newUpperTick = newLowerTick + countTicksGap;
        if (newUpperTick > upperLimitTick) {
          newUpperTick = upperLimitTick;
          newLowerTick = newUpperTick - countTicksGap;
        }
      }
      pair && updatePricesByTicks(newLowerTick, newUpperTick, pair);
    },
    [
      chainId,
      lowerLimitTick,
      pair,
      scaleFormState.lowerTick,
      scaleFormState.orderCount,
      scaleFormState.stepRatio,
      scaleFormState.upperTick,
      tradeSide,
      updatePricesByTicks,
      upperLimitTick,
    ],
  );
  useEffect(() => {
    chainId &&
      count &&
      dispatch(
        setScaleFormAmount({
          chainId,
          orderCount: count,
          stepRatio,
        }),
      );
  }, [stepRatio, count, chainId, dispatch]);

  return (
    <div className="syn-scale-limit-form-section horizontal">
      <div className="syn-scale-limit-form-section-column left">
        <div className="syn-scale-limit-form-section-title">{t('common.tradePage.orderCount')}</div>
        <div className="syn-scale-limit-form-section-order-counts">
          <div
            className={classNames('syn-scale-limit-form-section-order-counts-selected-bg', Side[tradeSide])}
            style={{ width: bgWidth }}
          />
          {items.map((orderCount) => (
            <div
              onClick={() => {
                if (orderCount === 1 || (!isNaN(gap) && orderCount * stepRatio > gap)) return;
                onOrderSelect(orderCount, stepRatio);
              }}
              key={orderCount}
              className={classNames(
                'syn-scale-limit-form-section-order-counts-item',
                {
                  selected: count >= orderCount,
                  disabled: orderCount === 1 || (!isNaN(gap) && orderCount * stepRatio > gap),
                },
                Side[tradeSide],
              )}>
              {orderCount}
            </div>
          ))}
        </div>
      </div>
      <div className="syn-scale-limit-form-section-column right">
        <div className="syn-scale-limit-form-section-title">{t('common.tradePage.gap')}</div>
        <StepRatioSelector
          onChange={(stepRatio) => {
            setStepRatio(stepRatio);
            let countFinal = count;
            let total = countFinal * stepRatio;
            if (total > gap) {
              let index = items.length - 1;
              while (total > gap) {
                index = index - 1;
                countFinal = items[index];
                total = countFinal * stepRatio;
              }
            }
            onOrderSelect(countFinal, stepRatio);
          }}
          dropdownStyle={{ width: 73 }}
          withBaseBPs={true}
          dropdownAlign={{ points: ['tl', 'bl'], offset: [0, 12] }}
          imr={pair?.rootInstrument.metaFutures.setting.initialMarginRatio}
        />
      </div>
      {count < MIN_ORDER_COUNT && (
        <Alert type="warning" message={t('common.tradePage.warningMsg.priceRangeLow')} showIcon={true} />
      )}
    </div>
  );
};

export default memo(ScaleOrderCount);

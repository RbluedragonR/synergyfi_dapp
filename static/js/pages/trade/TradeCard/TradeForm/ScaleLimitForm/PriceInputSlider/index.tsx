/**
 * @description Component-PriceInputSlider
 */
import { Slider } from 'antd';
import './index.less';

import { DEFAULT_ORDER_COUNT, DEFAULT_STEP_RATIO } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useScaleFormState } from '@/features/trade/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { ORDER_SPACING, Side } from '@synfutures/sdks-perp';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  range: number[];
  tradeSide: Side;
  disabled?: boolean;
  onChange: (ticks: number[]) => void;
  decimals?: number;
  upperPrice: WrappedBigNumber | undefined;
  lowerPrice: WrappedBigNumber | undefined;
  isInverse?: boolean;
  setSlierFocused: (focused: boolean) => void;
}
const PriceInputSlider: FC<IPropTypes> = function ({ range, upperPrice, lowerPrice, tradeSide, onChange, disabled }) {
  const [lowerTick, upperTick] = range;
  const sliderRef = useRef<HTMLDivElement>(null);
  const chainId = useChainId();
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const scaleLimitFormState = useScaleFormState(chainId);
  const handleWidth = useMemo(() => {
    let width = 15;
    if (scaleLimitFormState?.orderCount && scaleLimitFormState?.stepRatio && upperTick) {
      width =
        ((sliderRef.current?.offsetWidth || 0) * scaleLimitFormState.stepRatio * (scaleLimitFormState.orderCount - 1)) /
        (upperTick - lowerTick);
    }
    return width < 15 ? 15 : width;
  }, [lowerTick, scaleLimitFormState?.orderCount, scaleLimitFormState?.stepRatio, upperTick]);
  const sliderValue = useMemo(() => {
    if (scaleLimitFormState.lowerTick) {
      return (scaleLimitFormState.upperTick + scaleLimitFormState.lowerTick) / 2;
    }
    const defaultSpacing = DEFAULT_STEP_RATIO * DEFAULT_ORDER_COUNT;
    return tradeSide === Side.LONG ? upperTick - defaultSpacing : lowerTick + defaultSpacing;
  }, [lowerTick, scaleLimitFormState.lowerTick, scaleLimitFormState.upperTick, tradeSide, upperTick]);
  console.log('🚀 ~ scaleLimitFormState:', sliderValue, lowerTick, upperTick, handleWidth);

  const onDrag = useCallback(
    (value: number) => {
      const countTicksGap = scaleLimitFormState.stepRatio * (scaleLimitFormState.orderCount - 1);

      let newLowerTick = value - countTicksGap / 2;
      let newUpperTick = value + countTicksGap / 2;
      if (value > scaleLimitFormState.upperTick) {
        newUpperTick = value;
        newLowerTick = value - countTicksGap;
      }
      if (value < scaleLimitFormState.lowerTick) {
        newLowerTick = value;
        newUpperTick = value + countTicksGap;
      }
      if (newLowerTick < lowerTick) {
        newLowerTick = lowerTick;
        newUpperTick = lowerTick + countTicksGap;
      }
      if (newUpperTick > upperTick) {
        newUpperTick = upperTick;
        newLowerTick = upperTick - countTicksGap;
      }
      onChange([newLowerTick, newUpperTick]);
    },
    [
      lowerTick,
      onChange,
      scaleLimitFormState.lowerTick,
      scaleLimitFormState.orderCount,
      scaleLimitFormState.stepRatio,
      scaleLimitFormState.upperTick,
      upperTick,
    ],
  );

  useEffect(() => {
    const handles = document.querySelectorAll('.syn-price-input-slider .ant-slider-handle');
    if (handles.length > 0 && scaleLimitFormState.orderCount) {
      handles[0].textContent = scaleLimitFormState.orderCount.toString();
    }
  }, [scaleLimitFormState.orderCount, lowerTick, scaleLimitFormState.lowerTick]);

  return (
    <div className={classNames('syn-price-input-slider', Side[tradeSide])}>
      <div className="syn-price-input-slider-container" ref={sliderContainerRef}>
        <span className="syn-price-input-slider-container-price">{lowerPrice?.formatPriceNumberWithTooltip()}</span>
        {/* {scaleLimitFormState.lowerPrice ? ( */}
        <div className="syn-price-input-slider-container-slider" ref={sliderRef}>
          <Slider
            min={lowerTick}
            max={upperTick}
            step={ORDER_SPACING}
            disabled={disabled}
            styles={{
              handle: {
                width: handleWidth,
              },
            }}
            tooltip={{
              placement: 'top',
              autoAdjustOverflow: false,
              getPopupContainer: () => sliderContainerRef.current || document.body,
              rootClassName: `syn-price-input-slider-tooltip ${Side[tradeSide]}`,
              formatter: () => (
                <>
                  {WrappedBigNumber.from(scaleLimitFormState.lowerPrice).formatPriceString({})} ~{' '}
                  {WrappedBigNumber.from(scaleLimitFormState.upperPrice).formatPriceString({})}
                </>
              ),
              open: !!scaleLimitFormState.lowerPrice,
            }}
            value={sliderValue}
            onChange={onDrag}
          />
        </div>
        {/* // ) : (
        //   <div className="syn-price-input-slider-container-slider-skeleton" />
        // )} */}

        <span className="syn-price-input-slider-container-price">{upperPrice?.formatPriceNumberWithTooltip()}</span>
      </div>
    </div>
  );
};

export default PriceInputSlider;

/**
 * @description Component-SynInputNumber
 */
import './index.less';

import { useHover } from 'ahooks';
import classNames from 'classnames';
import React, { FC, useMemo, useRef } from 'react';

import { WrappedBigNumber } from '@/entities/WrappedBigNumber';

import { useMediaQueryDevice } from '../MediaQuery';
import { Tooltip } from '../ToolTip';
import { ReactComponent as PlusIcon } from './assets/icon_percent_add.svg';
import { ReactComponent as MinusIcon } from './assets/icon_percent_minus.svg';

interface IPropTypes {
  className: string;
  suffix?: string;
  disabled?: boolean;
  inputChanged: (value: number) => void;
  limitPrice: string | undefined;
  upperPrice: WrappedBigNumber | undefined;
  lowerPrice: WrappedBigNumber | undefined;
  minDisableTooltip?: React.ReactNode;
  maxDisableTooltip?: React.ReactNode;
  vertical?: boolean;
}
const SynInputNumber: FC<IPropTypes> = function ({
  inputChanged,
  className,
  disabled,
  limitPrice,
  minDisableTooltip,
  maxDisableTooltip,
  upperPrice,
  lowerPrice,
  vertical,
}) {
  const minRef = useRef(null);
  const isHoveringMin = useHover(minRef);
  const maxRef = useRef(null);
  const isHoveringMax = useHover(maxRef);
  const { deviceType } = useMediaQueryDevice();
  const disablePlus = useMemo(() => upperPrice?.lte(limitPrice || 0), [upperPrice, limitPrice]);
  const disableMinus = useMemo(() => lowerPrice && lowerPrice?.gte(limitPrice || 0), [lowerPrice, limitPrice]);

  return (
    <div className={classNames('syn-input-number-ticks', className, deviceType, { vertical })}>
      <Tooltip title={disableMinus ? minDisableTooltip : undefined} open={isHoveringMin && disableMinus}>
        <button
          ref={minRef}
          className={`syn-input-number-ticks-icon ${disableMinus ? 'disabled' : ''}`}
          onClick={() => {
            if (!disabled && !disableMinus) {
              gtag('event', 'adjust_price', {
                adjust_price: 'plus_or_mins', //plus_or_mins, enter, click_order_book
              });
              inputChanged(-1);
            }
          }}>
          <MinusIcon />
        </button>
      </Tooltip>
      <Tooltip title={disablePlus ? maxDisableTooltip : undefined} open={isHoveringMax && disablePlus}>
        <button
          ref={maxRef}
          className={`syn-input-number-ticks-icon ${disablePlus ? 'disabled' : ''}`}
          onClick={() => {
            if (!disabled && !disablePlus) {
              gtag('event', 'adjust_price', {
                adjust_price: 'plus_or_mins', //plus_or_mins, enter, click_order_book
              });
              inputChanged(1);
            }
          }}>
          <PlusIcon />
        </button>
      </Tooltip>
    </div>
  );
};

export default SynInputNumber;

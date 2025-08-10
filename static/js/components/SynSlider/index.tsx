/**
 * @description Component-SynSlider
 */
import { SliderSingleProps } from 'antd/lib/slider';
import classNames from 'classnames';
import _ from 'lodash';
import { FC, useEffect, useMemo, useRef } from 'react';

import { TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';

import { useMediaQueryDevice } from '../MediaQuery';
import Slider from '../Slider';
import './index.less';
interface IProps extends SliderSingleProps {
  max?: number;
  ticks?: number;
}

const SynSlider: FC<IProps> = function ({ onChange, disabled, value, max = TRADE_LEVERAGE_THRESHOLDS.MAX, ticks = 5 }) {
  const { isMobile, deviceType } = useMediaQueryDevice();
  const ref = useRef<HTMLDivElement>(null);

  const marks = useMemo(() => {
    if (max === 33) {
      return {
        '0.1': '0.1x',
        '5': '5x',
        '10': '10x',
        '15': '15x',
        '20': '20x',
        '25': '25x',
        '33': '33x',
      };
    }
    const mark = { '0.1': '0.1x' };
    if (isMobile) {
      value && _.set(mark, [value], `${value}x`);
      if (value && value < 0.8 * max) {
        _.set(mark, [max], `${max}x`);
      }
      if (value && value < 0.2 * max && value !== 0.1) {
        _.set(mark, ['0.1'], '');
      }
    } else {
      let count = ticks;
      const portion = max / count;
      while (count > 0) {
        const value = Math.floor(count * portion);
        _.set(mark, [value], `${value}x`);
        count--;
      }
    }
    return mark;
  }, [isMobile, max, ticks, value]);

  useEffect(() => {
    if (isMobile && disabled) {
      const nodes = ref.current?.querySelectorAll<HTMLSpanElement>('.ant-slider-mark-text-active');
      const lastEl = nodes?.item(nodes?.length - 1);
      lastEl?.classList.add('highlight');
    }
  }, [isMobile, disabled]);

  return (
    <div ref={ref} className={classNames('syn-SynSlider', { disabled }, deviceType)}>
      <Slider
        className="syn-slider"
        onChange={onChange}
        min={0.1}
        max={max}
        marks={marks}
        disabled={disabled}
        tooltip={{
          formatter: (number) => <>{number}x</>,
        }}
        step={0.1}
        value={value}
      />
    </div>
  );
};

export default SynSlider;

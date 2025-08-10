/**
 * @description Component-Slider
 */
import './index.less';

import { Slider as AntSlider, SliderSingleProps } from 'antd';
import { FC, useMemo } from 'react';
interface IPropTypes extends SliderSingleProps {
  unit?: string;
}
const Slider: FC<IPropTypes> = function ({ unit = '%', ...props }) {
  function formatter(value?: number) {
    return `${value || 0}${unit}`;
  }
  const marks = useMemo(() => {
    return {
      0: '0',
      25: '25',
      50: '50',
      75: '75',
      100: '100',
    };
  }, []);
  return (
    <AntSlider
      tooltip={{
        getPopupContainer: () => {
          return document.body;
        },
        formatter: formatter,
      }}
      className="syn-slider"
      marks={marks}
      {...props}
    />
  );
};

export default Slider;

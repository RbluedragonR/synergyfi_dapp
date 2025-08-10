/**
 * @description Component-SpotChartInterval
 */
import { useSpotState } from '@/features/spot/store';
import './index.less';

import { SPOT_KLINE_INTERVAL } from '@/constants/spot';
import classNames from 'classnames';
import _ from 'lodash';
import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SpotChartInterval: FC<IPropTypes> = function ({}) {
  const { spotKlineInterval, setSpotKlineInterval } = useSpotState();
  return (
    <div className="syn-spot-chart-interval">
      {_.values(SPOT_KLINE_INTERVAL).map((value) => (
        <div
          key={value}
          className={classNames('syn-spot-chart-interval-item', { active: spotKlineInterval === value })}
          onClick={() => {
            setSpotKlineInterval(value);
          }}>
          {value.toUpperCase()}
        </div>
      ))}
    </div>
  );
};

export default SpotChartInterval;

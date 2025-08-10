/**
 * @description Component-SpotSwapPoolsItem
 */
import './index.less';

import { SwitchBtn } from '@/components/Button';
import { PoolTypePools, spotDexInfos } from '@/constants/spot';
import { useSpotState } from '@/features/spot/store';
import { PoolType } from '@synfutures/sdks-aggregator';
import _ from 'lodash';
import { FC, useMemo } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  pool: PoolType;
}
const SpotSwapPoolsItem: FC<IPropTypes> = function ({ pool }) {
  const { poolsToExcludeTemp, setPoolsToExcludeTemp } = useSpotState();
  const isChecked = useMemo(() => !poolsToExcludeTemp.includes(pool), [pool, poolsToExcludeTemp]);
  return (
    <div className="syn-spot-swap-pools-item">
      <div className="syn-spot-swap-pools-item-left">
        {' '}
        <img width={16} height={16} src={_.get(spotDexInfos, [pool, 'imageSrc'])} /> {_.get(spotDexInfos, [pool])?.name}
      </div>
      <SwitchBtn
        isChecked={isChecked}
        onSwitch={(checked: boolean) => {
          if (!checked && poolsToExcludeTemp.length < PoolTypePools.length - 1) {
            setPoolsToExcludeTemp(_.uniq([...poolsToExcludeTemp, pool]));
          } else {
            setPoolsToExcludeTemp(_.without(poolsToExcludeTemp, pool));
          }
        }}
      />
    </div>
  );
};

export default SpotSwapPoolsItem;

/**
 * @description Component-SpotSwapPools
 */
import './index.less';

import { ReactComponent as ArrowIcon } from '@/assets/svg/icon_arrow.svg';
import { PoolTypePools } from '@/constants/spot';
import { PoolType } from '@synfutures/sdks-aggregator';
import classNames from 'classnames';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SpotSwapPoolsItem from './SpotSwapPoolsItem';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SpotSwapPools: FC<IPropTypes> = function ({}) {
  const [open, setOpen] = useState(true);
  const { t } = useTranslation();
  return (
    <div className="syn-spot-swap-pools">
      <div onClick={() => setOpen(!open)} className="syn-spot-swap-pools-header">
        {t('spot.lqSource')}
        <ArrowIcon className={classNames('arrow', { rotate: !open })} />
      </div>
      {open && (
        <div className="syn-spot-swap-pools-content syn-scrollbar">
          {PoolTypePools.map((pool) => (
            <SpotSwapPoolsItem key={pool} pool={pool as PoolType} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SpotSwapPools;

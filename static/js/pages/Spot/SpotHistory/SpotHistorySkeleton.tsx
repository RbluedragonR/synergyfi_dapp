/**
 * @description Component-SpotHistorySkeleton
 */
import { ArrowRightIcon } from '@/assets/svg/icons/arrow';
import { Skeleton } from '@/components/Skeleton';
import './index.less';

import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SpotHistorySkeleton: FC<IPropTypes> = function ({}) {
  const items = new Array(5).fill(0);
  return (
    <div className="syn-spot-history-skeleton">
      {items.map((item, index) => (
        <div key={`SpotHistorySkeleton-${index}`} className="syn-spot-history-skeleton-item">
          <div className="syn-spot-history-skeleton-item-left">
            <Skeleton active={true} paragraph={false} />
          </div>
          <div className="syn-spot-history-skeleton-item-middle">
            <Skeleton active={true} paragraph={false} />
            <ArrowRightIcon />
          </div>
          <div className="syn-spot-history-skeleton-item-right">
            <Skeleton active={true} paragraph={false} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpotHistorySkeleton;

/**
 * @description Component-TradePositionSkeleton
 */
import './index.less';

import { Skeleton as AntSkeleton } from 'antd';
import { FC } from 'react';

import { Skeleton } from '@/components/Skeleton';

const TradePositionSkeleton: FC = function () {
  return (
    <div className="syn-trade-position-skeleton syn-trade-position">
      <div className="syn-trade-position-item">
        <div className="syn-trade-position-btns">
          <AntSkeleton.Button active={true} />
          {/* <AntSkeleton.Button active={true} /> */}
        </div>
      </div>
      <div className="syn-trade-position-skeleton-items">
        <div className="syn-trade-position-skeleton-item">
          <Skeleton paragraph={false} active={true} />
          <Skeleton paragraph={false} active={true} />
          <Skeleton paragraph={false} active={true} />
        </div>
        <div className="syn-trade-position-skeleton-item">
          <Skeleton paragraph={false} active={true} />
          <Skeleton paragraph={false} active={true} />
          <Skeleton paragraph={false} active={true} />
        </div>
        <div className="syn-trade-position-skeleton-item">
          <Skeleton paragraph={false} active={true} />
          <Skeleton paragraph={false} active={true} />
          <Skeleton paragraph={false} active={true} />
        </div>
        <div className="syn-trade-position-skeleton-item">
          <Skeleton paragraph={false} active={true} />
          <Skeleton paragraph={false} active={true} />
          <Skeleton paragraph={false} active={true} />
        </div>
      </div>
    </div>
  );
};

export default TradePositionSkeleton;

/**
 * @description Component-TradingPairSkeleton
 */
import './index.less';

import { Skeleton as AntSkeleton } from 'antd';
import { FC, useMemo } from 'react';

import { Skeleton } from '@/components/Skeleton';
interface IPropTypes {
  className?: string;
}
const TradingPairSkeleton: FC<IPropTypes> = function () {
  const items = useMemo(() => new Array(12).fill(0), []);
  return (
    <div className="syn-trading-pair-skeleton">
      {items.map((_value, index) => (
        <div key={index} className="syn-trading-pair-skeleton-item">
          <div key={index} className="syn-trading-pair-skeleton-item-left">
            <AntSkeleton.Avatar size={32} active={true} shape="circle" />
            <Skeleton active={true} paragraph={{ rows: 1 }} />
          </div>
          <Skeleton active paragraph={false} />
          <AntSkeleton.Button className="syn-skeleton" active={true} />
        </div>
      ))}
    </div>
  );
};

export default TradingPairSkeleton;

/**
 * @description Component-SpotTokensSkeleton
 */
import { Skeleton } from '@/components/Skeleton';
import './index.less';

import TokenLogo from '@/components/TokenLogo';
import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SpotTokensSkeleton: FC<IPropTypes> = function ({}) {
  const items = new Array(7).fill(0);
  return (
    <div className="syn-spot-tokens-skeleton">
      {/* <div className="syn-spot-tokens-skeleton-header">
        <Skeleton paragraph={false} active={true} />
        <Skeleton paragraph={false} active={true} />
      </div> */}
      {items.map((_, index) => (
        <div key={index} className="syn-spot-tokens-skeleton-item">
          <div className="syn-spot-tokens-skeleton-item-left">
            <TokenLogo size={40} />
            <div className="syn-spot-tokens-skeleton-item-left-right">
              <Skeleton paragraph={false} active={true} />
              <Skeleton paragraph={false} active={true} />
            </div>
          </div>
          <div className="syn-spot-tokens-skeleton-item-right">
            <Skeleton paragraph={false} active={true} />
            <Skeleton paragraph={false} active={true} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpotTokensSkeleton;

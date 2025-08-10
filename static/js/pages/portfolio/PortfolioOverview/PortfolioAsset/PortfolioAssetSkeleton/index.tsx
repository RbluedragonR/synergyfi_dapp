/**
 * @description Component-PortfolioAssetSkeleton
 */
import './index.less';

import { FC } from 'react';

import { Skeleton } from '@/components/Skeleton';
interface IPropTypes {
  className?: string;
}
const PortfolioAssetSkeleton: FC<IPropTypes> = function () {
  return (
    <div className="syn-portfolio-asset-skeleton">
      {Array(8)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="syn-portfolio-asset-skeleton-item">
            <Skeleton className="top" active paragraph={false} />
            <Skeleton className="bottom" active paragraph={false} />
          </div>
        ))}
    </div>
  );
};

export default PortfolioAssetSkeleton;

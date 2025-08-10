/**
 * @description Component-TGPBannerSkeleton
 */
import './index.less';

import React, { FC } from 'react';

import { Skeleton } from '@/components/Skeleton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPBannerSkeleton: FC<IPropTypes> = function ({}) {
  return (
    <div className="syn-tgp-banner-skeleton">
      <Skeleton active paragraph={false} />
      <Skeleton active paragraph={false} />
      <Skeleton active paragraph={false} />
    </div>
  );
};

export default TGPBannerSkeleton;

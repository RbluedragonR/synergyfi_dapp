/**
 * @description Component-PairInfoSkeleton
 */
import './index.less';

import { Skeleton as AntSkeleton } from 'antd';
import { FC } from 'react';

import { Skeleton } from '@/components/Skeleton';

const PairInfoSkeleton: FC = function () {
  return (
    <div className="syn-pair-info-skeleton ">
      <AntSkeleton.Avatar active={true} size="large" shape="circle" />
      <Skeleton active={true} paragraph={{ rows: 1 }} />
      <Skeleton active={true} paragraph={{ rows: 1 }} />
      <Skeleton active={true} paragraph={{ rows: 1 }} />
      <Skeleton active={true} paragraph={{ rows: 1 }} />
      <Skeleton active={true} paragraph={{ rows: 1 }} />
      <Skeleton active={true} paragraph={{ rows: 1 }} />
    </div>
  );
};

export default PairInfoSkeleton;

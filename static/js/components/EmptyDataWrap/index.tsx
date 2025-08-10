import React, { memo } from 'react';
import { Skeleton } from '../Skeleton';
import './index.less';
export function EmptyDataWrapComponent({
  isLoading,
  children,
  loadingWrap = '-',
  marginRight = 9,
  fetching = false,
  skeletonWidth = 100,
  skeletonHeight = 16,
}: {
  isLoading?: boolean;
  loadingWrap?: React.ReactNode;
  children: React.ReactNode;
  marginRight?: number;
  fetching?: boolean;
  skeletonWidth?: number;
  skeletonHeight?: number;
}): JSX.Element {
  if (fetching)
    return (
      <>
        <Skeleton
          className="syn-empty-data-wrap-skeleton"
          style={{ width: skeletonWidth, height: skeletonHeight }}
          active={true}
          paragraph={false}
        />
      </>
    );
  if (isLoading) return <span style={{ marginRight: marginRight }}>{loadingWrap}</span>;
  return <>{children}</>;
}
export const EmptyDataWrap = memo(EmptyDataWrapComponent);

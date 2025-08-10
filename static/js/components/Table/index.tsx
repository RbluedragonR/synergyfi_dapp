import './index.less';

import { useDebounceEffect } from 'ahooks';
import { Table as AntDTable, ConfigProvider, TableProps } from 'antd';
import classnames from 'classnames';
import type { TableSticky } from 'rc-table/lib/interface';
import { useCallback, useMemo, useState } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';

import Empty from '../Empty';
import SkeletonTable, { SkeletonTableColumnsType } from '../SkeletonTable';

export default function Table({
  showUnconnected = true,
  sticky = true,
  showEmptyTitle = true,
  rowCount = 3,
  requiredSkeleton = false,
  ...props
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
TableProps<any> & {
  isFullLoading?: boolean;
  emptyDesc?: string;
  emptyDescLink?: string;
  emptyType?: 'horizontal' | 'vertical';
  emptyTitle?: string;
  emptyDescLinkClick?: () => void;
  scrolledToEnd?: () => void;
  emptyIcon?: React.ReactNode;
  showEmptyTitle?: boolean;
  showUnconnected?: boolean;
  rowCount?: number;
  requiredSkeleton?: boolean;
}): JSX.Element {
  const { deviceType } = useMediaQueryDevice();
  const isFullLoading = useMemo(() => {
    return props.isFullLoading || true;
  }, [props.isFullLoading]);
  const [isEmptyDelayed, setIsEmtpyDelayed] = useState(false);
  useDebounceEffect(
    () => {
      setIsEmtpyDelayed(!props.dataSource || !props.dataSource.length);
    },
    [props.dataSource],
    { wait: 300 },
  );
  const renderEmpty = useCallback(() => {
    return (
      !props.loading && (
        <Empty
          onLinkClick={props.emptyDescLinkClick}
          type={props.emptyType}
          title={props.emptyTitle}
          showUnconnected={showUnconnected}
          desc={props.emptyDesc}
          showTitle={showEmptyTitle}
          icon={props.emptyIcon}
          link={props.emptyDescLink}
        />
      )
    );
  }, [
    props.emptyDesc,
    props.emptyDescLink,
    props.emptyDescLinkClick,
    props.emptyIcon,
    props.emptyTitle,
    showEmptyTitle,
    props.emptyType,
    props.loading,
    showUnconnected,
  ]);
  // require sticky for table header and body gap
  return (
    <SkeletonTable
      rowCount={rowCount}
      loading={requiredSkeleton ? !!props.loading : false}
      columns={props.columns as SkeletonTableColumnsType[]}>
      <ConfigProvider renderEmpty={isEmptyDelayed ? renderEmpty : () => <></>}>
        <AntDTable
          {...props}
          sticky={sticky}
          showSorterTooltip={false}
          sortDirections={['descend', 'ascend']}
          className={classnames(
            'syn-table',
            isFullLoading && 'syn-table_full-loading',
            deviceType,
            props.className,
          )}></AntDTable>
      </ConfigProvider>
    </SkeletonTable>
  );
}

export type { TableSticky };

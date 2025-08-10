import './index.less';

import { CardProps, TablePaginationConfig, TableProps } from 'antd';
import { FilterValue, SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';
import cls from 'classnames';
import { ReactNode } from 'react';

import Card from '../Card';
import SkeletonTable, { SkeletonTableColumnsType } from '../SkeletonTable';
import Table from '../Table';
export function TableCard({
  loadingItem,
  total,
  extra,
  rowCount = 6,
  loading,
  dataSource,
  onRow,
  className,
  cardTitle,
  columns,
  isFullLoading,
  rowKey,
  emptyDesc,
  emptyDescLink,
  tableChange,
  sticky,
  emptyType,
  emptyTitle,
  emptyIcon,
  showEmptyTitle = true,
}: {
  rowCount?: number;
} & CardProps & {
    total?: number;
    loadingItem?: boolean;
    cardTitle: ReactNode;
    emptyDesc?: string;
    emptyDescLink?: string;
    emptyTitle?: string;
    emptyType?: 'horizontal' | 'vertical';
    emptyIcon?: React.ReactNode;
    showEmptyTitle?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } & TableProps<any> & {
    isFullLoading?: boolean;
    tableChange?: (
      pagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: SorterResult<any> | SorterResult<any>[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extra: TableCurrentDataSource<any>,
    ) => void;
  }): JSX.Element {
  return (
    <>
      <Card
        className={cls('syn-table_card', className)}
        title={cardTitle}
        loadingItem={loadingItem}
        total={total}
        extra={extra}>
        <SkeletonTable rowCount={rowCount} loading={loading} columns={columns as SkeletonTableColumnsType[]}>
          <Table
            columns={columns}
            emptyDesc={emptyDesc}
            emptyDescLink={emptyDescLink}
            dataSource={dataSource}
            pagination={false}
            emptyIcon={emptyIcon}
            emptyTitle={emptyTitle}
            emptyType={emptyType}
            showEmptyTitle={showEmptyTitle}
            isFullLoading={isFullLoading}
            onChange={tableChange}
            sticky={sticky}
            // scroll={{ y: 48 * rowCount }}
            // style={{ height: 48 * rowCount + 32 }}
            rowKey={rowKey}
            onRow={onRow}
          />
        </SkeletonTable>
      </Card>
    </>
  );
}

import './index.less';

import { SkeletonProps } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';

import { Skeleton } from '../Skeleton';
import Table from '../Table';
export type SkeletonTableColumnsType = {
  key: string;
};

type SkeletonTableProps = SkeletonProps & {
  columns: ColumnsType<SkeletonTableColumnsType>;
  rowCount?: number;
};

export default function SkeletonTable({
  loading = false,
  rowCount = 5,
  columns,
  children,
  className,
}: SkeletonTableProps): JSX.Element {
  return loading ? (
    <Table
      rowKey="key"
      className="skeleton-table"
      pagination={false}
      sticky
      dataSource={[...Array(rowCount)].map((_, index) => ({
        key: `key${index}`,
      }))}
      columns={columns.map((column, i) => {
        return {
          ...column,
          render: () => (
            <Skeleton
              key={`${column.key}-${i}`}
              loading={loading}
              title
              active={true}
              paragraph={false}
              className={classNames(className, column.className, column.align)}
              style={{ width: '60%' }}
            />
          ),
        };
      })}
    />
  ) : (
    <>{children}</>
  );
}

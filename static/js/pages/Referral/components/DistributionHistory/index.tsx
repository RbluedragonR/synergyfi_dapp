/**
 * @description Component-DistributionHistory
 */
import { ICommissionDistribution } from '@/types/referral/affiliates';
import './index.less';

import { useMockDevTool } from '@/components/Mock';
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useCommissionHistory } from '@/features/referral/query';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ColumnType } from 'antd/es/table';
import moment from 'moment';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TablePagination from '../TablePagination';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const DistributionHistory: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const [page, setPage] = useState(1);
  const { isLoading, data } = useCommissionHistory(chainId, userAddr, page);
  const list = data?.data ?? [];
  const { isMockSkeleton } = useMockDevTool();
  const { t } = useTranslation();
  const loading = isMockSkeleton || isLoading;
  const columns: ColumnType<ICommissionDistribution>[] = useMemo(
    () => [
      {
        title: t('affiliates.distributionHistory.table.time'),
        dataIndex: 'distributionTime',
        width: 240,
        align: 'left',
        render: (_, record: ICommissionDistribution): JSX.Element | undefined => (
          <span>{moment(record.distributionTime).format('MM-DD HH:mm')}</span>
        ),
      },
      {
        title: t('affiliates.distributionHistory.table.commission'),
        dataIndex: 'commission',
        width: 220,
        align: 'left',
        render: (_, record: ICommissionDistribution): JSX.Element | undefined => (
          <>
            <span>
              {WrappedBigNumber.from(record.commissionByQuote).formatNumberWithTooltip({
                suffix: record.quoteSymbol,
              })}
            </span>
          </>
        ),
      },
      // {
      //   title: t('affiliates.distributionHistory.table.quote'),
      //   dataIndex: 'quoteSymbol',
      //   width: 60,
      //   align: 'left',
      //   render: (_, record: ICommissionDistribution): JSX.Element | undefined => <span>{record.quoteSymbol}</span>,
      // },
      {
        title: t('affiliates.distributionHistory.table.tier'),
        dataIndex: 'commissionRebateLevel',
        width: 220,

        align: 'left',
        render: (_, record: ICommissionDistribution): JSX.Element | undefined => (
          <span>
            {t(`affiliates.${record.commissionRebateLevel}`)}(
            {WrappedBigNumber.from(record.commissionRebateRate).formatPercentage({ colorShader: false, decimals: 0 })})
          </span>
        ),
      },
      {
        title: t('affiliates.distributionHistory.table.tradingVolume'),
        dataIndex: 'tradingVolumeByQuote',
        width: 220,
        align: 'right',
        render: (_, record: ICommissionDistribution): JSX.Element | undefined => (
          <>
            <span>
              {WrappedBigNumber.from(record.tradingVolumeByQuote).formatNumberWithTooltip({
                suffix: record.quoteSymbol,
              })}
            </span>
          </>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="syn-distribution-history">
      <h1>{t('affiliates.distributionHistory.affiliatesTitle')}</h1>
      <div className="syn-distribution-history-table">
        <SkeletonTable rowCount={5} loading={loading} columns={columns as SkeletonTableColumnsType[]}>
          <Table
            //rowCount={6}
            loading={loading}
            columns={columns}
            dataSource={list ?? []}
            // rowClassName={(record) => `pool-${record.type}`}
            className="syn-distribution-history-table-table"
            rowKey={(record: ICommissionDistribution) => {
              return `${record.distributionTime}-${record.commissionRebateRate}-${record?.quoteSymbol}-${record.tradingVolumeByQuote}`;
            }}
            pagination={false}
          />
        </SkeletonTable>
        <TablePagination
          total={data?.pagination.total ?? 0}
          page={page}
          onPageChange={function (page: number): void {
            setPage(page);
          }}
        />
      </div>
    </div>
  );
};

export default DistributionHistory;

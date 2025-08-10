/**
 * @description Component-DistributionHistory
 */
import './index.less';

import { useMockDevTool } from '@/components/Mock';
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import TxTimestamp from '@/components/TxTimestamp';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useFeeRebateHistory } from '@/features/referral/query';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import TablePagination from '@/pages/Referral/components/TablePagination';
import { IFeeRebateDistribution } from '@/types/referral/trader';
import { ColumnType } from 'antd/es/table';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const RebateDistributionHistory: FC<IPropTypes> = function () {
  const userAddr = useUserAddr();
  const chainId = useChainId();
  const [page, setPage] = useState(1);
  const { isLoading, data } = useFeeRebateHistory(chainId, userAddr, page);
  const { isMockSkeleton } = useMockDevTool();
  const { t } = useTranslation();
  const loading = isMockSkeleton || isLoading;

  const columns: ColumnType<IFeeRebateDistribution>[] = useMemo(
    () => [
      {
        title: t('affiliates.traderPage.rebateHistory.table.time'),
        dataIndex: 'distributionTime',
        width: 240,
        align: 'left',
        render: (_, record: IFeeRebateDistribution): JSX.Element | undefined => (
          <TxTimestamp timestamp={record.distributionTime} />
        ),
      },
      {
        title: t('affiliates.traderPage.rebateHistory.table.rebates'),
        dataIndex: 'feeRebatesByQuote',
        align: 'right',
        width: 110,
        render: (_, record: IFeeRebateDistribution): JSX.Element | undefined => (
          <>
            <span>
              {WrappedBigNumber.from(record.feeRebatesByQuote).formatNumberWithTooltip({
                suffix: record.quoteSymbol,
              })}
            </span>
          </>
        ),
      },
      {
        title: t('affiliates.traderPage.rebateHistory.table.rebateRate'),
        dataIndex: 'rebateRate',
        width: 220,

        align: 'right',
        render: (_, record: IFeeRebateDistribution): JSX.Element | undefined => (
          <span>{WrappedBigNumber.from(record.rebateRate).formatPercentage({ colorShader: false })}</span>
        ),
      },
      {
        title: t('affiliates.traderPage.rebateHistory.table.tradingVolume'),
        dataIndex: 'tradingVolumeByQuote',
        width: 220,
        align: 'right',
        render: (_, record: IFeeRebateDistribution): JSX.Element | undefined => (
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
    <div className="syn-rebate-distribution-history">
      <h1>{t('affiliates.distributionHistory.rebatesTitle')}</h1>
      <div className="syn-rebate-distribution-history-table">
        <SkeletonTable rowCount={5} loading={loading} columns={columns as SkeletonTableColumnsType[]}>
          <Table
            //rowCount={6}
            loading={loading}
            columns={columns}
            dataSource={data?.data || []}
            // rowClassName={(record) => `pool-${record.type}`}
            className="syn-rebate-distribution-history-table-table"
            rowKey={(record: IFeeRebateDistribution) => {
              return `${record.distributionTime}-${record.rebateRate}-${record?.quoteSymbol}-${record.tradingVolumeByQuote}`;
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

export default RebateDistributionHistory;

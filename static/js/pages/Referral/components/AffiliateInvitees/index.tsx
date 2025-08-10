/**
 * @description Component-AffiliateInvitees
 */
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import './index.less';

import { useMockDevTool } from '@/components/Mock';
import Table from '@/components/Table';
import { Tooltip } from '@/components/ToolTip';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useInvitees } from '@/features/referral/query';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { IAffiliatesInvitees } from '@/types/referral/affiliates';
import { shortenAddress } from '@/utils/address';
import { ColumnType } from 'antd/es/table';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TablePagination from '../TablePagination';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const AffiliateInvitees: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const [page, setPage] = useState(1);
  const { isLoading, data } = useInvitees(chainId, userAddr, page);
  const { isMockSkeleton } = useMockDevTool();
  const { t } = useTranslation();
  const loading = isMockSkeleton || isLoading;
  const columns: ColumnType<IAffiliatesInvitees>[] = useMemo(
    () => [
      {
        title: t('affiliates.invitees.table.address'),
        dataIndex: 'address',
        width: 240,
        align: 'left',
        render: (_, record: IAffiliatesInvitees): JSX.Element | undefined => (
          <Tooltip title={record.address}>
            <span>{shortenAddress(record.address)}</span>
          </Tooltip>
        ),
      },
      {
        title: t('affiliates.invitees.table.totalTradingVolume'),
        dataIndex: 'totalTradingVolume',
        width: 220,
        align: 'left',
        render: (_, record: IAffiliatesInvitees): JSX.Element | undefined => (
          <>{WrappedBigNumber.from(record.totalTradingVolumeUSD).formatNumberWithTooltip({ prefix: '$' })}</>
        ),
      },
      {
        title: t('affiliates.invitees.table.weeklyTradingVolume'),
        dataIndex: 'currentWeeklyTradingVolume',
        width: 110,
        render: (_, record: IAffiliatesInvitees): JSX.Element | undefined => (
          <>{WrappedBigNumber.from(record.periodTradingVolumeUSD).formatNumberWithTooltip({ prefix: '$' })}</>
        ),
      },
    ],
    [t],
  );
  return (
    <div className="syn-affiliate-invitees">
      <h1>{t('affiliates.invitees.title')}</h1>
      <div className="syn-affiliate-invitees-table">
        <SkeletonTable rowCount={5} loading={loading} columns={columns as SkeletonTableColumnsType[]}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={data?.data || []}
            className="syn-affiliate-invitees-table-table"
            rowKey={(record: IAffiliatesInvitees) => {
              return `${record.address}`;
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

export default AffiliateInvitees;

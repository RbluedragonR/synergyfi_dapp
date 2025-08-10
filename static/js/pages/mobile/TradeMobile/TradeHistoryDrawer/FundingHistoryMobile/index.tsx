/**
 * @description Component-FundingHistoryMobile
 */
import './index.less';

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useInfiniteFundingHistory } from '@/features/graph/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { IFundingHistory } from '@/types/graph';
import { formatDate } from '@/utils/timeUtils';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const FundingHistoryMobile: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { t } = useTranslation();
  const pair = useCurrentPairFromUrl(chainId);
  const {
    histories,
    queryState: { isLoading },
  } = useInfiniteFundingHistory({ chainId, userAddr, pair });
  const columnDefs: SkeletonTableColumnsType[] = useMemo(
    () => [
      {
        title: t('common.table.time'),
        key: 'time',
        width: 200,
        render: (_value: unknown, record: IFundingHistory): JSX.Element | undefined => {
          return (
            <div className="history-time-with-icon">
              <span>{formatDate(record.timestamp || 0 * 1000, 'MM-DD HH:mm')}</span>
              {record?.pair?.chainId && <img src={DAPP_CHAIN_CONFIGS[record.pair?.chainId].network.icon} />}
            </div>
          );
        },
      },
      {
        title: t('common.table.funding'),
        key: 'amount',
        align: 'left',
        render: (_value: unknown, record: IFundingHistory): JSX.Element | undefined => {
          return (
            <div className="syn-funding-history-mobile-table-cell">
              {t(`common.table.actions.${record?.type}`)}
              <span className="bold">{WrappedBigNumber.from(record?.funding).abs().formatNumberWithTooltip()}</span>
              {pair?.rootInstrument?.marginToken.symbol}
            </div>
          );
        },
      },
    ],
    [pair?.rootInstrument?.marginToken.symbol, t],
  );
  return (
    <>
      <div className="syn-funding-history-mobile">
        <SkeletonTable rowCount={10} loading={isLoading} columns={columnDefs as SkeletonTableColumnsType[]}>
          <Table
            columns={columnDefs}
            pagination={false}
            dataSource={histories.slice(0, 10)}
            scroll={{ x: window.innerWidth - 16, y: window.innerHeight - 34 - 36 - 64 - 16 - 48 }}
            className="syn-funding-history-mobile-table"
            emptyDesc={undefined}
            emptyType="vertical"
            emptyDescLink={undefined}
          />
        </SkeletonTable>
      </div>
      {!isLoading && !!histories.length && (
        <div className="syn-trade-history-drawer-info">{t('mobile.history.tableInfo')}</div>
      )}
    </>
  );
};

export default FundingHistoryMobile;

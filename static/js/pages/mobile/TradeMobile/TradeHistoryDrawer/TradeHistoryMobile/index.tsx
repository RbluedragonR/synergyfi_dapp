/**
 * @description Component-TradeHistoryMobile
 */
import './index.less';

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ExternalLink } from '@/components/Link';
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useInfiniteVirtualTradeHistory } from '@/features/graph/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useChainId, useEtherscanLink, useUserAddr } from '@/hooks/web3/useChain';
import TradeSide from '@/pages/components/TradeSide';
import { portfolioTableColumns } from '@/pages/portfolio/AccountHistory/tableConfigs';
import { ITradeHistory } from '@/types/graph';
import { formatDate } from '@/utils/timeUtils';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradeHistoryMobile: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { t } = useTranslation();
  const pair = useCurrentPairFromUrl(chainId);
  const {
    histories,
    queryState: { isLoading: isLoadingTrade },
  } = useInfiniteVirtualTradeHistory({ chainId, userAddr, pair });
  const getEtherscanLink = useEtherscanLink();
  const columnDefs: SkeletonTableColumnsType[] = useMemo(
    () => [
      {
        title: t('common.table.time'),
        key: 'time',
        width: 140,
        render: (_value: unknown, record: ITradeHistory): JSX.Element | undefined => {
          return (
            <ExternalLink href={getEtherscanLink(record.txHash, 'transaction')}>
              <div className="history-time-with-icon">
                <span>{formatDate(record.timestamp * 1000, 'MM-DD HH:mm')}</span>
                {record?.pair?.chainId && <img src={DAPP_CHAIN_CONFIGS[record.pair?.chainId].network.icon} />}
              </div>
            </ExternalLink>
          );
        },
      },
      {
        title: t('common.table.side'),
        key: 'side',
        align: 'center',
        render: (_value: unknown, record: ITradeHistory): JSX.Element | undefined => {
          const side = record.side;
          return <TradeSide noBg side={side} />;
        },
      },
      {
        title: t('common.table.size'),
        key: 'size',

        render: (_value: unknown, record: ITradeHistory): JSX.Element | undefined => {
          return <>{WrappedBigNumber.from(record.size.abs()).formatNumberWithTooltip({})}</>;
        },
      },
      { ...portfolioTableColumns.price, title: t('common.table.price'), width: 'auto' },
    ],
    [getEtherscanLink, t],
  );
  return (
    <>
      <div className="syn-trade-history-mobile">
        <SkeletonTable rowCount={10} loading={isLoadingTrade} columns={columnDefs as SkeletonTableColumnsType[]}>
          <Table
            columns={columnDefs}
            pagination={false}
            scroll={{ x: window.innerWidth - 16, y: window.innerHeight - 34 - 36 - 64 - 16 - 48 }}
            dataSource={histories.slice(0, 10)}
            rowKey={(record) => record.txHash + record.logIndex}
            className="syn-trade-history-mobile-table"
            emptyDesc={undefined}
            emptyType="vertical"
            emptyDescLink={undefined}
          />
        </SkeletonTable>
      </div>
      {!isLoadingTrade && !!histories.length && (
        <div className="syn-trade-history-drawer-info">{t('mobile.history.tableInfo')}</div>
      )}
    </>
  );
};

export default TradeHistoryMobile;

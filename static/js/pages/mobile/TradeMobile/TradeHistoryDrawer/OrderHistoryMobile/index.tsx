/**
 * @description Component-OrderHistoryMobile
 */
import './index.less';

import { Side, TickMath } from '@synfutures/sdks-perp';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Drawer from '@/components/Drawer';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { ExternalLink } from '@/components/Link';
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useBackendChainConfig } from '@/features/config/hook';
import { useInfiniteOrdersHistory } from '@/features/graph/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useChainId, useEtherscanLink, useUserAddr } from '@/hooks/web3/useChain';
import TradeSide from '@/pages/components/TradeSide';
import { portfolioTableColumns } from '@/pages/portfolio/AccountHistory/tableConfigs';
import { IOrderHistory } from '@/types/graph';
import { formatDate } from '@/utils/timeUtils';
import { OrderStatus } from '@synfutures/sdks-perp-datasource';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const OrderHistoryMobile: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { t } = useTranslation();
  const pair = useCurrentPairFromUrl(chainId);
  const {
    histories,
    queryState: { isLoading },
  } = useInfiniteOrdersHistory({ chainId, userAddr, pair });
  const getEtherscanLink = useEtherscanLink();
  const [selectedHistory, setSelectedHistory] = useState<IOrderHistory | null>(null);
  const dappConfig = useBackendChainConfig(chainId);
  const columnDefs: SkeletonTableColumnsType[] = useMemo(
    () =>
      [
        {
          title: t('common.table.time'),
          key: 'time',
          width: 105,
          render: (_value: unknown, record: IOrderHistory): JSX.Element | undefined => {
            return (
              <ExternalLink
                onClick={(e) => e.stopPropagation()}
                href={getEtherscanLink(record.placeTxHash, 'transaction')}>
                <div className="history-time-with-icon">
                  <span>{formatDate(record.createdTimestamp * 1000, 'MM-DD HH:mm')}</span>
                  {record?.pair?.chainId && <img src={DAPP_CHAIN_CONFIGS[record.pair?.chainId].network.icon} />}
                </div>
              </ExternalLink>
            );
          },
        },
        dappConfig?.trade?.isDisableLimitOrder
          ? undefined
          : {
              title: t('common.table.side'),
              key: 'side',
              width: 55,
              align: 'center',
              render: (_value: unknown, record: IOrderHistory): JSX.Element | undefined => {
                const side = record.side;
                return <TradeSide noBg side={side} />;
              },
            },
        {
          title: t('common.table.filledOrSize'),
          key: 'FILLED_AMOUNT',
          width: 120,
          // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
          render: (value: any, record: IOrderHistory): JSX.Element | undefined => {
            return (
              <>
                {WrappedBigNumber.from(record.filledSize.abs()).abs().formatNumberWithTooltip()} /{' '}
                {WrappedBigNumber.from(record.size.abs()).abs().formatNumberWithTooltip()}
              </>
            );
          },
        },
        { ...portfolioTableColumns.price, title: t('common.table.price'), width: 80 },
      ].filter((t) => t !== undefined) as SkeletonTableColumnsType[],
    [dappConfig?.trade?.isDisableLimitOrder, getEtherscanLink, t],
  );
  const side = useMemo(() => selectedHistory?.side || Side.LONG, [selectedHistory?.side]);
  const price = useMemo(() => {
    return selectedHistory?.price ? WrappedBigNumber.from(selectedHistory?.price) : undefined;
  }, [selectedHistory]);
  const tradeValue = useMemo(() => {
    const oPrice =
      selectedHistory?.status === OrderStatus.CANCELLED
        ? TickMath.getWadAtTick(selectedHistory.tick)
        : selectedHistory?.price;
    const price = WrappedBigNumber.from(oPrice || 0);
    const size = selectedHistory?.status === OrderStatus.CANCELLED ? selectedHistory.size : selectedHistory?.filledSize;
    return price.mul(size || 1).abs();
  }, [
    selectedHistory?.filledSize,
    selectedHistory?.price,
    selectedHistory?.size,
    selectedHistory?.status,
    selectedHistory?.tick,
  ]);
  const statusText = useMemo(() => {
    const status = selectedHistory?.status;
    let statusText = t(`common.table.status.${status}`);
    if (status === OrderStatus.FILLED && !selectedHistory?.filledSize.abs().eq(selectedHistory?.size.abs())) {
      statusText = t(`common.table.status.PARTIAL_FILLED`);
    }
    return statusText;
  }, [selectedHistory?.filledSize, selectedHistory?.size, selectedHistory?.status, t]);
  return (
    <>
      <div className="syn-order-history-mobile">
        <SkeletonTable rowCount={10} loading={isLoading} columns={columnDefs as SkeletonTableColumnsType[]}>
          <Table
            columns={columnDefs}
            pagination={false}
            scroll={{ x: window.innerWidth - 16, y: window.innerHeight - 34 - 36 - 64 - 16 - 48 }}
            onRow={(record: IOrderHistory) => ({ onClick: () => setSelectedHistory(record) })}
            dataSource={histories.slice(0, 10)}
            rowKey={(record) => record.txHash + record.logIndex}
            className="syn-order-history-mobile-table"
            emptyDesc={undefined}
            emptyType="vertical"
            emptyDescLink={undefined}
          />
        </SkeletonTable>
        <Drawer
          onClose={() => setSelectedHistory(null)}
          title={t('mobile.details')}
          open={!!selectedHistory}
          className="syn-order-history-mobile-drawer reverse-header">
          {selectedHistory && (
            <>
              <div className="syn-order-history-mobile-drawer-details">
                <dl>
                  <dt>{t('mobile.side')}</dt>
                  <dd>
                    <TradeSide side={side} />
                  </dd>
                </dl>
                <dl>
                  <dt>{t('mobile.price')}</dt>
                  <dd className="bold"> {price?.formatPriceNumberWithTooltip()}</dd>
                </dl>
                <dl>
                  <dt>{t('mobile.filledSize')}</dt>
                  <dd className="bold">
                    {WrappedBigNumber.from(selectedHistory.filledSize.abs()).abs().formatNumberWithTooltip()}
                    <div>{` / `}</div>
                    {WrappedBigNumber.from(selectedHistory.size.abs()).abs().formatNumberWithTooltip()}
                    {selectedHistory.pair?.rootInstrument?.baseToken.symbol}
                  </dd>
                </dl>
                <dl>
                  <dt>{t('mobile.closeP.tradeVal')}</dt>
                  <dd>
                    {tradeValue?.formatNumberWithTooltip({
                      suffix: selectedHistory?.pair?.rootInstrument.quoteToken.symbol,
                    })}
                  </dd>
                </dl>
                <dl>
                  <dt>
                    {selectedHistory.filledSize.gt(0) ? t('mobile.closeP.feeRebate2') : t('mobile.closeP.feeRebate')}
                  </dt>
                  <dd className="bold">
                    <EmptyDataWrap isLoading={!selectedHistory?.fee}>
                      {WrappedBigNumber.from(selectedHistory?.fee).formatNumberWithTooltip({
                        suffix: selectedHistory.pair?.rootInstrument?.quoteToken.symbol,
                      })}
                    </EmptyDataWrap>
                  </dd>
                </dl>
                <dl>
                  <dt>{t('common.status')}</dt>
                  <dd> {statusText}</dd>
                </dl>
                <dl>
                  <dt>{t('mobile.closeP.createdTime')}</dt>
                  <dd>
                    <ExternalLink width={300} href={getEtherscanLink(selectedHistory.placeTxHash, 'transaction')}>
                      {formatDate(selectedHistory?.createdTimestamp * 1000)}
                    </ExternalLink>
                  </dd>
                </dl>
                <dl>
                  <dt>{t('mobile.closeP.updatedTime')}</dt>
                  <dd>
                    <ExternalLink
                      width={300}
                      href={getEtherscanLink(
                        (selectedHistory?.status === OrderStatus.FILLED
                          ? selectedHistory.fillTxHash
                          : selectedHistory.cancelTxHash) || '',
                        'transaction',
                      )}>
                      {formatDate(selectedHistory?.timestamp * 1000)}
                    </ExternalLink>
                  </dd>
                </dl>
              </div>
            </>
          )}
        </Drawer>
      </div>
      {!isLoading && !!histories.length && (
        <div className="syn-trade-history-drawer-info">{t('mobile.history.tableInfo')}</div>
      )}
    </>
  );
};
export default OrderHistoryMobile;

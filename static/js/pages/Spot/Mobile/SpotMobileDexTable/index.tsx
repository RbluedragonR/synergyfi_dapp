/**
 * @description Component-SpotRanges
 */
import { useTranslation } from 'react-i18next';
import './index.less';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/SkeletonTable';
import Table from '@/components/Table';
import { spotDexInfos } from '@/constants/spot';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useSpotState } from '@/features/spot/store';
import { useChainId } from '@/hooks/web3/useChain';
import { ISpotPool } from '@/types/spot';
import { ColumnType } from 'antd/es/table';

import { useMockDevTool } from '@/components/Mock';
import { useFilteredSpotPools } from '@/features/spot/hooks';
import { TokenInfo } from '@/types/token';
import { FC, useMemo } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SpotMobileDexTable: FC<IPropTypes> = function ({}) {
  const { token0, token1 } = useSpotState();
  const chainId = useChainId();
  const { isLoading, data } = useFilteredSpotPools(chainId, token0, token1);
  const { isMockSkeleton } = useMockDevTool();
  const { t } = useTranslation();
  const loading = isMockSkeleton || isLoading;
  const columns: ColumnType<ISpotPool & { token0Info: TokenInfo; token1Info: TokenInfo }>[] = useMemo(
    () => [
      {
        title: t('common.spot.dex'),
        dataIndex: 'dex',
        width: 100,
        align: 'left',
        render: (_, record): JSX.Element | undefined => (
          <span className="pool">
            <img
              src={spotDexInfos[record.type]?.imageSrc}
              alt={spotDexInfos[record.type]?.name}
              className="pool-icon"
            />
            <div className="pool-info-text">
              <div className="pool-info-text-dex">{`${spotDexInfos[record.type]?.name}`}</div>
              <div className="pool-info-text-token">{`${record?.token0Info?.symbol} ${' / '}${
                record?.token1Info?.symbol
              }`}</div>
            </div>
          </span>
        ),
      },
      {
        title: t('common.fee'),
        dataIndex: 'fee',
        width: 50,
        align: 'center',
        render: (_, record): JSX.Element | undefined => <span className="fee">{record.fee / 10000}%</span>,
      },

      {
        title: t('common.tvl'),
        dataIndex: 'tvl',
        width: 80,
        align: 'right',
        sorter: (a: ISpotPool, b: ISpotPool): number => {
          return a.tvl > b.tvl ? 1 : -1;
        },
        render: (_, record): JSX.Element | undefined => (
          <>
            <EmptyDataWrap isLoading={!record.tvl}>
              {WrappedBigNumber.from(record.tvl).formatPriceNumberWithTooltip({
                isShowTBMK: true,
                prefix: '$',
              })}
            </EmptyDataWrap>
          </>
        ),
      },
    ],
    [t],
  );
  return (
    <>
      {data.length > 0 && (
        <div className="syn-spot-mobile-dex-table">
          <div className="syn-spot-mobile-dex-table-header">{t('common.supportPoolsDetails')}</div>
          <SkeletonTable rowCount={5} loading={loading} columns={columns as SkeletonTableColumnsType[]}>
            <Table
              //rowCount={6}
              loading={loading}
              columns={columns}
              dataSource={data ?? []}
              rowClassName={(record) => `pool-${record.type}`}
              className="syn-spot-mobile-dex-table-table"
              rowKey={(record) => {
                return `${record.poolAddr}-${record.tvl}-${record?.token0Info?.symbol}-${record?.token1Info?.symbol}`;
              }}
              pagination={false}
            />
          </SkeletonTable>
        </div>
      )}
    </>
  );
};

export default SpotMobileDexTable;

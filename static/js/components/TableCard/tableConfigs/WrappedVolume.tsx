import { formatNumberWithTooltip } from '@/components/NumberFormat';
import TokenPairWitheToolTip from '@/components/TokenPairWitheToolTip';
import { WrappedPair } from '@/entities/WrappedPair';
import { DailyVolumeDetail } from '@/types/portfolio';
import { formatDate } from '@/utils/timeUtils';

import { ColumnType } from 'antd/es/table';
import { AlignType } from 'rc-table/lib/interface';
export type TWrappedVolume = DailyVolumeDetail & {
  wrappedPair?: WrappedPair;
  takerVolumeInUsd?: number;
  takerFeeInUsd?: number;
  makerVolumeInUsd?: number;
  makerRebateInUsd?: number;
  qouteSymbol: string;
};

const ValueAndUsdValueNode = ({ value, usdValue }: { value: number | undefined; usdValue: number | undefined }) => {
  return (
    <div className="volume-detail-td-text">
      {value !== undefined ? (
        formatNumberWithTooltip({
          num: value,
          isShowTBMK: true,
        })
      ) : (
        <span>-</span>
      )}
      {usdValue !== undefined ? (
        formatNumberWithTooltip({
          num: usdValue,
          isShowTBMK: true,
          prefix: '$',
        })
      ) : (
        <span>-</span>
      )}
    </div>
  );
};
export const date = (width?: number, align?: AlignType): ColumnType<TWrappedVolume> => ({
  title: 'common.date',
  dataIndex: 'DATE',
  width: width !== undefined ? width : 80,
  align,
  render: (_, record) => {
    return <> {formatDate(Number(record.timestamp) * 1000, 'YYYY-MM-DD')}</>;
  },
});

export const pairForVolume = (width?: number, align?: AlignType): ColumnType<TWrappedVolume> => ({
  title: 'common.table.pair',
  dataIndex: 'PAIR',
  width: width !== undefined ? width : 80,
  align,
  render: (_, record) => {
    return record.wrappedPair ? (
      <TokenPairWitheToolTip isShowPairSettleIcon={false} record={record.wrappedPair} />
    ) : (
      record.symbol
    );
  },
});

export const marginForVolume = (width?: number, align?: AlignType): ColumnType<TWrappedVolume> => ({
  title: 'common.table.margin',
  dataIndex: 'MARGIN',
  width: width !== undefined ? width : 80,
  align,
  render: (_, record) => {
    return <>{record.qouteSymbol.toUpperCase()}</>;
  },
});

export const takerVolume = (width?: number, align?: AlignType): ColumnType<TWrappedVolume> => ({
  title: 'common.table.takerVolume',
  dataIndex: 'TAKER_VOLUME',
  width: width !== undefined ? width : 80,
  align,
  render: (_, record) => {
    return <ValueAndUsdValueNode value={record.takerVolume} usdValue={record.takerVolumeInUsd} />;
  },
});

export const makerVolume = (width?: number, align?: AlignType): ColumnType<TWrappedVolume> => ({
  title: 'common.table.makerVolume',
  dataIndex: 'MAKER_VOLUME',
  width: width !== undefined ? width : 80,
  align,
  render: (_, record) => {
    return <ValueAndUsdValueNode value={record.makerVolume} usdValue={record.makerVolumeInUsd} />;
  },
});

export const takerFee = (width?: number, align?: AlignType): ColumnType<TWrappedVolume> => ({
  title: 'common.table.takerFee',
  dataIndex: 'TAKER_FEE',
  width: width !== undefined ? width : 80,
  align,
  render: (_, record) => {
    return <ValueAndUsdValueNode value={record.takerFee} usdValue={record.takerFeeInUsd} />;
  },
});

export const makerRebate = (width?: number, align?: AlignType): ColumnType<TWrappedVolume> => ({
  title: 'common.table.makerRebate',
  dataIndex: 'MAKER_REBATE',
  width: width !== undefined ? width : 80,
  align,
  render: (_, record) => {
    return <ValueAndUsdValueNode value={record.makerRebate} usdValue={record.makerRebateInUsd} />;
  },
});

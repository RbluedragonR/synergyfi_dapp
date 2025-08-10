/* eslint-disable @typescript-eslint/no-unused-vars */
import { ColumnsType, ColumnType } from 'antd/es/table';
import _ from 'lodash';
import { useMemo } from 'react';
import { TFunction, Trans, useTranslation } from 'react-i18next';

import { TABLE_TYPES } from '@/constants/global';
import { FAQ_LINKS } from '@/constants/links';
import { PriceBasisForPnl } from '@/constants/trade/priceBasisForPnl';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { WrappedPair } from '@/entities/WrappedPair';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { WrappedRange } from '@/entities/WrappedRange';
import { usePriceBasisForPnl } from '@/hooks/usePriceBasisForPnl';
import { useChainId } from '@/hooks/web3/useChain';
import LiquidationPrices from '@/pages/components/LiquidationPrices';
import PriceRange from '@/pages/earn/EarnLiquidities/PriceRange';
import { bigNumberSort, toBN } from '@/utils/numberUtil';

import { EmptyDataWrap } from '../../EmptyDataWrap';
// import Tag from '../Tag';
import TVLWarningIcon from '@/components/TVLWarningIcon';
import { tableWidthMap } from '@/constants/table';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useBackendChainConfig } from '@/features/config/hook';
import CampaignRefTag from '@/pages/campaign/CampaignRefTag';
import Change24 from '@/pages/components/Change24';
import TradeSideSize from '@/pages/components/TradeSideSize';
import MarketTag from '@/pages/Market/MarketTag';
import { BackendChainConfig } from '@/types/config';
import { IMarketPair } from '@/types/pair';
import { formatDate } from '@/utils/timeUtils';
import { AlignType } from 'rc-table/lib/interface';
import TokenPair from '../../TokenPair';
import TokenPairWitheToolTip from '../../TokenPairWitheToolTip';
import LeanMoreToolTip from '../../ToolTip/LeanMoreToolTip';
import PnlTitleToolTip from '../../ToolTip/PnlTitleToolTip';
import UnderlineToolTip from '../../ToolTip/UnderlineToolTip';
import { UnrealizedPnlTooltip } from '../../ToolTip/UnrealizedPnlTooltip';
import { date, makerRebate, makerVolume, marginForVolume, pairForVolume, takerFee, takerVolume } from './WrappedVolume';
export enum TABLE_COLUMN_DEFS {
  SIDE = 'SIDE',
  AMOUNT = 'AMOUNT',
  MARGIN = 'MARGIN',
  LEVERAGE = 'LEVERAGE',
  LIQ_PRICE = 'LEVERAGE',
  PNL = 'PNL',
  AVG_PRICE = 'AVG_PRICE',
  TP = 'TP',
  SL = 'SL',
  PRICE = 'PRICE',
  FILLED_AMOUNT = 'FILLED_AMOUNT',
}

const side = (width?: number, align?: AlignType): ColumnType<WrappedOrder> => ({
  title: 'common.sideSize',
  dataIndex: 'SIDE',
  width: width !== undefined ? width : 80,
  align,
  render: (_, record) => {
    return (
      <TradeSideSize
        side={record.wrappedSide}
        vertical={true}
        size={record?.wrapAttribute('size')?.abs().formatNumberWithTooltip({
          isShowTBMK: true,
          suffix: record.rootPair.rootInstrument.baseToken.symbol,
        })}
        quoteSize={
          <>
            {record?.wrappedQuoteSize?.abs()?.formatNumberWithTooltip({
              suffix: record.rootPair.rootInstrument.quoteToken.symbol,
              isShowTBMK: true,
            })}
          </>
        }
      />
    );
  },
});
const margin = (width?: number): ColumnType<WrappedOrder> => ({
  title: 'common.table.margin',
  dataIndex: 'MARGIN',
  width: width !== undefined ? width : 80,
  render: (_, record): JSX.Element | undefined => {
    return (
      <>
        {record?.wrapAttribute('balance')?.formatNumberWithTooltip({
          suffix: record.rootPair.rootInstrument.marginToken.symbol,
        })}
      </>
    );
  },
});
const openOrderCreateTime = (width?: number): ColumnType<WrappedOrder> => ({
  title: 'common.createTime',
  dataIndex: 'createTime',
  width: width !== undefined ? width : 80,
  render: (_, record): JSX.Element | undefined => {
    const createTimestamp = record.createTimestamp;
    return <> {createTimestamp ? formatDate(createTimestamp * 1000) : '-'}</>;
  },
  sorter: (a: WrappedOrder, b: WrappedOrder): number => {
    return (a.createTimestamp || Date.now() / 1000) - (b.createTimestamp || Date.now() / 1000);
  },
  sortDirections: ['ascend', 'descend'],
});
const leverage = (width?: number): ColumnType<WrappedPosition | WrappedOrder> => ({
  title: 'common.table.leverage',
  dataIndex: 'LEVERAGE',
  width: width !== undefined ? width : 80,

  render: (_, record): JSX.Element | undefined => {
    return <>{record.wrapAttribute('leverageWad').formatLeverageWithTooltip()}</>;
  },
});
const filled = (width?: number): ColumnType<WrappedOrder> => ({
  title: 'common.taken',
  dataIndex: 'filled',
  width: width !== undefined ? width : 80,

  render: (_, record): JSX.Element | undefined => {
    return (
      <>
        <div className="filled-top">
          {record.wrapAttribute('taken').abs().formatNumberWithTooltip({
            suffix: record.rootPair.rootInstrument.baseToken.symbol,
            isShowTBMK: true,
          })}
        </div>
        <div className="filled-bottom">
          {record.wrappedFilledSize.formatNumberWithTooltip({
            suffix: record.rootPair.rootInstrument.quoteToken.symbol,
            isShowTBMK: true,
          })}
        </div>
      </>
    );
  },
});
const limitPrice = (width?: number): ColumnType<WrappedOrder> => ({
  title: 'common.table.orderPrice',
  dataIndex: 'PRICE',
  width: width !== undefined ? width : 120,

  render: (_, record): JSX.Element | undefined => {
    return <>{record.wrapAttribute('limitPrice').formatPriceNumberWithTooltip()}</>;
  },
  sorter: (a: WrappedOrder, b: WrappedOrder): number => {
    return bigNumberSort(a.wrapAttribute('limitPrice'), b.wrapAttribute('limitPrice'));
  },
  sortDirections: ['ascend', 'descend'],
});
const tradingPairInMarketPage = (
  width?: number,
  backendChainConfig?: BackendChainConfig | undefined,
): ColumnType<IMarketPair> => ({
  title: 'common.market.tradeP',
  dataIndex: 'name',
  width: width !== undefined ? width : 345,
  shouldCellUpdate: (record: IMarketPair, prevRecord: IMarketPair): boolean => false,
  render: (_, record): JSX.Element | undefined => {
    const customTags = backendChainConfig?.marketCustomTag?.[record.pairSymbol];
    return (
      <TokenPair
        baseToken={record.baseToken}
        quoteToken={record.quoteToken}
        showFavorite={true}
        // showOracle={true}
        showLeverage
        tokenSize={40}
        showMargin={true}
        chainId={record.chainId}
        showChainIcon={true}
        symbol={record.pairSymbol}
        leverage={record.maxLeverage}
        instrumentAddr={record.instrumentAddress}
        marketType={record.marketType}
        isInverse={record?.isInverse}
        expiry={record.expiry}
        tagExtra={
          <div className="token-pair-expiry-tags">
            {record?.isCampaign && (
              <CampaignRefTag campaignBonus={record.campaignBonus} campaignTitle={record.campaignTitle} />
            )}
            {customTags?.map((tag, index) => (
              <MarketTag key={index} {...tag} />
            ))}
          </div>
        }
        showShortPerp={true}
      />
    );
  },
});
const fairPriceInPair = (width?: number): ColumnType<IMarketPair> => ({
  title: 'common.table.price',
  dataIndex: 'price',
  width: width !== undefined ? width : 120,
  shouldCellUpdate: (record: IMarketPair, prevRecord: IMarketPair): boolean => true,
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record}>
        <div style={{ marginBottom: 8 }}>{record.fairPrice.formatPriceNumberWithTooltip()}</div>
        <Change24
          instrumentAddr={record?.instrumentAddress}
          expiry={record?.expiry}
          chainId={record?.chainId}
          priceChange24h={record?.fairPriceChange24h}
        />
      </EmptyDataWrap>
    );
  },
});
const change24h = (width?: number, showMarkChange?: boolean): ColumnType<IMarketPair> => ({
  title: 'common.24HC',
  dataIndex: '24hc',
  width: width !== undefined ? width : 120,
  showSorterTooltip: false,
  shouldCellUpdate: (record: IMarketPair, prevRecord: IMarketPair): boolean => true,
  sorter: (a: IMarketPair, b: IMarketPair): number => {
    if (a?.fairPriceChange24h && b?.fairPriceChange24h) {
      return bigNumberSort(a?.fairPriceChange24h, b?.fairPriceChange24h);
    }
    return 0;
  },
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record.fairPriceChange24h}>
        <div> {record.fairPriceChange24h.formatPercentage({})}</div>
        {showMarkChange && record?.markPriceChange24h && (
          <div className="table-cell-desc market-table-mark-price-change">
            {record.markPriceChange24h.formatPercentage()}
          </div>
        )}
      </EmptyDataWrap>
    );
  },
});
// const high24 = (width?: number): ColumnType<WrappedPair> => ({
//   title: 'common.24HH',
//   dataIndex: '24hh',
//   width: width !== undefined ? width : 120,
//   showSorterTooltip: false,
//   shouldCellUpdate: (record: WrappedPair, prevRecord: WrappedPair): boolean => true,
//   sorter: (a: WrappedPair, b: WrappedPair): number => {
//     if (a?.stats?.high24h !== undefined && b?.stats?.high24h !== undefined) {
//       return bigNumberSort(a.stats.wrapAttribute('high24h'), b.stats.wrapAttribute('high24h'));
//     }
//     return 0;
//   },
//   render: (_, record): JSX.Element | undefined => {
//     return (
//       <EmptyDataWrap isLoading={!record?.stats?.high24h}>
//         {record?.stats?.high24h && record?.stats?.displayHigh24h.formatPriceNumberWithTooltip()}
//       </EmptyDataWrap>
//     );
//   },
// });
// const low24 = (width?: number): ColumnType<WrappedPair> => ({
//   title: 'common.24HL',
//   dataIndex: 'low24h',
//   className: 'align-right',
//   width: width !== undefined ? width : 125,
//   showSorterTooltip: false,
//   shouldCellUpdate: (record: WrappedPair, prevRecord: WrappedPair): boolean => true,
//   sorter: (a: WrappedPair, b: WrappedPair): number => {
//     if (a?.stats?.low24h !== undefined && b?.stats?.low24h !== undefined) {
//       return bigNumberSort(a.stats.wrapAttribute('low24h'), b.stats.wrapAttribute('low24h'));
//     }
//     return 0;
//   },
//   render: (_, record): JSX.Element | undefined => {
//     return (
//       <EmptyDataWrap isLoading={!record?.stats?.low24h}>
//         {record?.stats?.low24h && record?.stats?.displayLow24h.formatPriceNumberWithTooltip()}
//         {/* <div>{record?.stats?.low24h && record?.stats?.wrapAttribute('low24h').formatPriceNumberWithTooltip()}</div> */}
//       </EmptyDataWrap>
//     );
//   },
// });
// const marginSymbol = (width?: number): ColumnType<WrappedPair> => ({
//   title: 'common.margin',
//   dataIndex: 'margin',
//   className: 'align-right',
//   width: width !== undefined ? width : 60,
//   showSorterTooltip: false,
//   shouldCellUpdate: (record: WrappedPair, prevRecord: WrappedPair): boolean => true,
//   sorter: (a: WrappedPair, b: WrappedPair): number => {
//     return a?.rootInstrument.marginToken.symbol > b?.rootInstrument.marginToken.symbol ? 1 : -1;
//   },
//   render: (_, record): JSX.Element | undefined => <> {record?.rootInstrument.marginToken.symbol}</>,
// });
const hV24 = (width?: number): ColumnType<IMarketPair> => ({
  title: 'common.24HV',
  dataIndex: '24hV',
  width: width !== undefined ? width : 120,
  showSorterTooltip: false,
  shouldCellUpdate: (record: IMarketPair, prevRecord: IMarketPair): boolean => true,
  sorter: (a: IMarketPair, b: IMarketPair): number => {
    return bigNumberSort(a.volume24hUsd, b.volume24hUsd);
  },
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record?.volume24h}>
        {record?.volume24hUsd?.formatNumberWithTooltip({
          isShowTBMK: true,
          prefix: '$',
          isShowApproximatelyEqualTo: false,
        })}
      </EmptyDataWrap>
    );
  },
});
const BoostLiquidity = (width?: number): ColumnType<IMarketPair> => ({
  title: 'common.effectLiq',
  dataIndex: 'effectLiq',
  width: width !== undefined ? width : 130,
  showSorterTooltip: false,
  align: 'right',
  shouldCellUpdate: (record: IMarketPair, prevRecord: IMarketPair): boolean => true,
  sorter: (a: IMarketPair, b: IMarketPair): number => {
    return bigNumberSort(a.effectLiqTvl, b.effectLiqTvl);
  },
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record?.effectLiqTvl}>
        {record?.effectLiqTvl.formatNumberWithTooltip({
          isShowTBMK: true,
          prefix: '$',
        })}
      </EmptyDataWrap>
    );
  },
});
const apy = (width?: number, align?: 'left' | 'right'): ColumnType<IMarketPair> => ({
  title: 'common.table.liqApy',
  dataIndex: 'apy',
  width: width !== undefined ? width : 130,
  showSorterTooltip: false,
  shouldCellUpdate: (record: IMarketPair, prevRecord: IMarketPair): boolean => true,
  sorter: (a: IMarketPair, b: IMarketPair): number => {
    return bigNumberSort(a.liquidityApy, b.liquidityApy);
  },
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record?.liquidityApy}>
        {record?.liquidityApy.formatPercentage({ colorShader: false })}
      </EmptyDataWrap>
    );
  },
  align: align,
});
const portfolioPositionSide = (width?: number): ColumnType<WrappedPosition> => ({
  title: 'common.sideSize',
  dataIndex: 'sideSize',
  align: 'left',
  width: width !== undefined ? width : 100,
  render: (_, record): JSX.Element | undefined => {
    return (
      <TradeSideSize
        side={record.wrappedSide}
        size={record.wrapAttribute('size')?.abs().formatNumberWithTooltip({
          isShowTBMK: true,
          colorShader: false,
          isShowApproximatelyEqualTo: false,
          suffix: record.rootInstrument.baseToken.symbol,
        })}
      />
    );
  },
});
const avgPr = (width?: number): ColumnType<WrappedPosition> => ({
  title: 'common.avgPShort',
  dataIndex: 'avgPr',
  width: width !== undefined ? width : 100,
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record.size}>
        {record.wrapAttribute('entryPrice')?.formatPriceNumberWithTooltip()}
      </EmptyDataWrap>
    );
  },
});
const newLeverage = (width?: number): ColumnType<WrappedPosition> => ({
  title: 'common.leverage',
  dataIndex: 'leverage',
  width: width !== undefined ? width : 100,
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record.balance}>
        {record.wrapAttribute('leverageWad')?.formatLeverageWithTooltip()}
      </EmptyDataWrap>
    );
  },
});
const newMargin = (t: TFunction<'translation', undefined>, width?: number): ColumnType<WrappedPosition> => ({
  title: <UnderlineToolTip title={t('tooltip.table.margin')}>{t('common.margin')}</UnderlineToolTip>,
  dataIndex: 'margin',
  width: width !== undefined ? width : 100,
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record.balance}>
        {record.equity?.formatNumberWithTooltip({
          isShowTBMK: true,
          colorShader: false,
          suffix: record.rootInstrument.quoteToken.symbol,
          isShowApproximatelyEqualTo: false,
        })}
      </EmptyDataWrap>
    );
  },
});
const feesEarned = (width?: number): ColumnType<WrappedRange> => ({
  title: 'common.earn.feesE',
  dataIndex: 'fe',
  width: width !== undefined ? width : 80,

  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record?.feeEarned}>
        {record.wrapAttribute('feeEarned').formatNumberWithTooltip({
          suffix: record.rootInstrument.marginToken.symbol,
        })}
      </EmptyDataWrap>
    );
  },
});
const liqPrice = (width?: number): ColumnType<WrappedPosition> => ({
  title: 'common.liqPShort',
  dataIndex: 'liqPrice',
  width: width !== undefined ? width : 100,
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record.liquidationPrice}>
        {record.wrapAttribute('liquidationPrice')?.formatLiqPriceNumberWithTooltip({
          colorShader: false,
          isShowApproximatelyEqualTo: false,
        })}
      </EmptyDataWrap>
    );
  },
});
const markPrice = (width?: number): ColumnType<WrappedPosition> => ({
  title: 'common.markP',
  dataIndex: 'markPrice',
  width: width !== undefined ? width : 100,
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record.rootPair.markPrice}>
        {record.rootPair.wrapAttribute('markPrice')?.formatPriceNumberWithTooltip({
          colorShader: false,
          isShowApproximatelyEqualTo: false,
        })}
      </EmptyDataWrap>
    );
  },
});
const pnl = (priceBasisForPnl: PriceBasisForPnl, width?: number): ColumnType<WrappedPosition> => ({
  title: <PnlTitleToolTip />,
  dataIndex: 'pnl',
  width: width !== undefined ? width : 100,
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record.unrealizedPnl}>
        <div className="syn-table_card-tb-container" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          {record.unrealizedSocialLoss.lte(0) ? (
            <>
              {record.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl)?.formatNumberWithTooltip({
                isShowTBMK: true,
                colorShader: true,
                showPositive: true,
                colorSuffix: true,
                suffix: record.rootInstrument.quoteToken.symbol,
                isShowApproximatelyEqualTo: false,
                showToolTip: true,
              })}
            </>
          ) : (
            <UnderlineToolTip
              style={{
                transform: 'translateY(10px)',
              }}
              overlayInnerStyle={{ width: 'fit-content' }}
              colorShaderProps={{
                num: record?.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl) || toBN(0),
              }}
              title={<UnrealizedPnlTooltip position={record} />}>
              {record.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl)?.formatNumberWithTooltip({
                isShowTBMK: true,
                colorShader: true,
                showPositive: true,
                colorSuffix: true,
                suffix: record.rootInstrument.quoteToken.symbol,
                isShowApproximatelyEqualTo: false,
                showToolTip: false,
              })}
            </UnderlineToolTip>
          )}

          <div style={{ marginLeft: 4 }}>
            {record.equity.gt(0) &&
              record.getUnrealizedPnlPercentage(priceBasisForPnl)?.formatPercentage({
                decimals: 2,
                isColorShaderWhiteIfZero: true,
                suffix: ')',
                prefix: '(',
              })}
          </div>
        </div>
      </EmptyDataWrap>
    );
  },
});
const priceRange = (width?: number): ColumnType<WrappedRange> => ({
  title: 'common.earn.priceR',
  dataIndex: 'pr',
  align: 'left',
  width: width !== undefined ? width : 224,

  render: (_, record): JSX.Element | undefined => {
    return (
      <PriceRange
        minPrice={record.wrapAttribute('lowerPrice')}
        maxPrice={record.wrapAttribute('upperPrice')}
        pairId={record.rootPair.id}
        isInverse={record.rootInstrument.isInverse}
        fairPrice={record.rootPair.wrapAttribute('fairPrice')}
      />
    );
  },
});
const rangeAmount = (t: TFunction<'translation', undefined>, width?: number): ColumnType<WrappedRange> => ({
  title: <LeanMoreToolTip title={t('tooltip.earnPage.valueLocked')}>{t('common.earn.valueLocked')}</LeanMoreToolTip>,
  dataIndex: 'valueLocked',
  width: width !== undefined ? width : 80,
  sorter: (a: WrappedRange, b: WrappedRange): number => {
    //  a.valueLock needs to be checked first when there is a default sorter
    return bigNumberSort(a.wrapAttribute('valueLocked'), b.wrapAttribute('valueLocked'));
  },
  className: 'rangeAmount',
  sortDirections: ['ascend', 'descend'],
  render: (_, record): JSX.Element | undefined => {
    return (
      <>
        {record.wrapAttribute('valueLocked').formatNumberWithTooltip({
          suffix: record.rootInstrument.marginToken.symbol,
          showToolTip: true,
        })}
      </>
    );
  },
});
const fairPriceInRange = (width?: number): ColumnType<WrappedRange> => ({
  title: 'common.fairP',
  dataIndex: 'fairPrice',
  width: width !== undefined ? width : 80,
  shouldCellUpdate: (record, prevRecord: WrappedRange): boolean => true,

  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record}>
        {record.rootPair.wrapAttribute('fairPrice').formatPriceNumberWithTooltip()}
      </EmptyDataWrap>
    );
  },
});

const entryPriceInRange = (width?: number): ColumnType<WrappedRange> => ({
  title: 'common.earn.entryPrice',
  dataIndex: 'entryPrice',
  width: width !== undefined ? width : 80,
  shouldCellUpdate: (record, prevRecord: WrappedRange): boolean => true,

  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record}>
        {WrappedBigNumber.from(record.entryPrice || 0).formatPriceNumberWithTooltip()}
      </EmptyDataWrap>
    );
  },
});

const pair = (width?: number): ColumnType<WrappedPair | WrappedOrder | WrappedRange> => ({
  title: 'common.pair',
  dataIndex: 'pair',
  width: width !== undefined ? width : 180,
  render: (_, record: WrappedPair | WrappedOrder | WrappedRange): JSX.Element | undefined => {
    let leverage = undefined;
    const castedPairRecord = record as WrappedPair;
    if (castedPairRecord.maxLeverage) {
      leverage = castedPairRecord.maxLeverage;
    }
    const castedOrderRecord = record as WrappedOrder;
    if (castedOrderRecord.rootPair.maxLeverage) {
      leverage = castedOrderRecord.rootPair.maxLeverage;
    }
    return (
      <TokenPairWitheToolTip
        tokenSize={40}
        verticalMode={true}
        record={record}
        isShowLogo={true}
        chainId={record.rootInstrument.chainId}
        showChainIcon={true}
        leverage={leverage}
        showLeverage
        showMarginText
      />
    );
  },
});
const liquidationPrice = (width?: number): ColumnType<WrappedRange> => ({
  title: 'common.liqPrice',
  dataIndex: 'lp',
  width: width !== undefined ? width : 80,
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record}>
        <div className="syn-table_card-liq-price-container">
          <LiquidationPrices lowerLiqPrice={record.wrappedLowerLiqPrice} upperLiqPrice={record.wrappedUpperLiqPrice} />
        </div>
      </EmptyDataWrap>
    );
  },
});
const tvl = (width?: number): ColumnType<IMarketPair> => ({
  title: 'common.tvl',
  dataIndex: 'tvl',
  width: width !== undefined ? width : 130,
  showSorterTooltip: false,
  align: 'right',
  shouldCellUpdate: (record: IMarketPair, prevRecord: IMarketPair): boolean => true,
  sorter: (a: IMarketPair, b: IMarketPair): number => {
    return bigNumberSort(a.tvlUsd, b.tvlUsd);
  },
  render: (_, record): JSX.Element | undefined => {
    return (
      <div className="f-a-c" style={{ justifyContent: 'flex-end' }}>
        <EmptyDataWrap isLoading={!record?.tvlUsd}>
          {record.tvlUsd.formatNumberWithTooltip({
            isShowTBMK: true,
            prefix: '$',
          })}
          <TVLWarningIcon tvl={record.tvlUsd} />
        </EmptyDataWrap>
      </div>
    );
  },
});
const funding = (t: TFunction<'translation', undefined>, width?: number): ColumnType<WrappedPosition> => ({
  title: (
    <LeanMoreToolTip
      title={<Trans i18nKey={'common.tradePage.tradePosition.unRealizedFundingTooltip'} components={{ b: <b /> }} />}
      link={FAQ_LINKS.PREDICTED_FUNDING_RATE}>
      {t('common.table.funding')}
    </LeanMoreToolTip>
  ),
  dataIndex: 'funding',
  width: width !== undefined ? width : 120,
  render: (_, record): JSX.Element | undefined => {
    return (
      <EmptyDataWrap isLoading={!record.unrealizedPnl || !record.rootPair.isPerpetual}>
        <div className="syn-table_card-tb-container">
          <div>
            {record.wrapAttribute('unrealizedFundingFee')?.formatNumberWithTooltip({
              isShowTBMK: true,
              colorShader: true,
              showPositive: true,
              colorSuffix: true,
              suffix: record.rootInstrument.quoteToken.symbol,
              isShowApproximatelyEqualTo: false,
            })}
          </div>
        </div>
      </EmptyDataWrap>
    );
  },
});
export function useTableColumns(mapKey: TABLE_TYPES): ColumnsType<unknown> {
  const { t } = useTranslation();
  const { priceBasisForPnl } = usePriceBasisForPnl();
  const chainId = useChainId();
  const chainConfig = useBackendChainConfig(chainId);
  /**
   * How to format column width:
   * 1. Sum of Column Width need to be 1000!
   * 2. think the proportion of each column
   *
   */
  const columnsMap = useMemo(
    () => ({
      [TABLE_TYPES.OPEN_ORDERS]: [
        side(tableWidthMap[TABLE_TYPES.OPEN_ORDERS].side),
        filled(tableWidthMap[TABLE_TYPES.OPEN_ORDERS].filledAmount),
        limitPrice(tableWidthMap[TABLE_TYPES.OPEN_ORDERS].limitPrice),
        margin(tableWidthMap[TABLE_TYPES.OPEN_ORDERS].margin),
        leverage(tableWidthMap[TABLE_TYPES.OPEN_ORDERS].leverage),
        openOrderCreateTime(tableWidthMap[TABLE_TYPES.OPEN_ORDERS].openOrderCreateTime),
      ],
      [TABLE_TYPES.TRADING_PAIR]: [
        tradingPairInMarketPage(280, chainConfig),
        fairPriceInPair(90 + 16),
        // change24h(80 + 16),
        // high24(),
        // low24(),
        { ...hV24(90 + 16), defaultSortOrder: chainConfig?.trendingPairs?.length ? '' : 'descend' },
        BoostLiquidity(115 + 16),
        tvl(90 + 16),
        apy(90 + 16, 'right'),
        // fakeAction(t, pairPageNavigate, 154 + 16),
      ],

      [TABLE_TYPES.PORTFOLIO_POSITIONS]: [
        pair(250),
        portfolioPositionSide(120),
        avgPr(110),
        newMargin(t, 114),
        newLeverage(80),
        liqPrice(110),
        markPrice(110),
        pnl(priceBasisForPnl, 200),
        funding(t, 138),
      ],
      [TABLE_TYPES.PORTFOLIO_LIQUIDITIES]: [
        pair(250),
        priceRange(240),
        entryPriceInRange(180),
        rangeAmount(t, 180),
        feesEarned(180),
        liquidationPrice(202),
      ],
      [TABLE_TYPES.PORTFOLIO_OPEN_ORDERS]: [
        pair(250),
        side(176, 'left'),
        filled(156),
        limitPrice(170),
        margin(170),
        leverage(140),
        openOrderCreateTime(170),
      ],
      [TABLE_TYPES.VOLUME_DETAIL]: [
        date((900 * 135) / 1000),
        pairForVolume((900 * 190) / 1000, 'left'),
        marginForVolume((900 * 135) / 1000, 'center'),
        takerVolume((900 * 135) / 1000),
        makerVolume((900 * 135) / 1000),
        takerFee((900 * 135) / 1000),
        makerRebate((900 * 135) / 1000),
      ],
    }),
    [chainConfig?.trendingPairs?.length, priceBasisForPnl, t],
  );

  const columnDefs = useMemo(
    () =>
      _.get(columnsMap, [mapKey]).map((c: ColumnType<unknown>) => ({
        ...c,
        title: typeof c.title === 'string' ? t(c.title) : c.title,
      })) as ColumnType<unknown>[],
    [columnsMap, mapKey, t],
  );
  return columnDefs;
}

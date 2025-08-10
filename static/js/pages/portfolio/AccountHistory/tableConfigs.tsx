/* eslint-disable @typescript-eslint/no-unused-vars */
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { ExternalLink } from '@/components/Link';
import TokenSymbol from '@/components/TokenLogo/TokenSymbol';
import TokenPair from '@/components/TokenPair';
import { Tooltip } from '@/components/ToolTip';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { HISTORY_TYPE } from '@/constants/history';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useWrappedInstrumentMap } from '@/features/futures/hooks';
import { useChainId, useEtherscanLink } from '@/hooks/web3/useChain';
import {
  IAccountBalanceHistory,
  IFundingHistory,
  IGraphPairBasicInfo,
  ILiquidityHistory,
  IOrderHistory,
  ITradeHistory,
  ITransferHistory,
} from '@/types/graph';
import { TokenInfo } from '@/types/token';
import { formatDate } from '@/utils/timeUtils';
import { fixBalanceNumberDecimalsTo18 } from '@/utils/token';
import { ColumnsType } from 'antd/es/table';
import { FilterDropdownProps } from 'antd/es/table/interface';
import { t } from 'i18next';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

import FeeTooltip from '@/components/ToolTip/FeeTooltip';
import LiquidityRemoveTooltip from '@/components/ToolTip/LiquidityRemoveTooltip';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import TradeSideSize from '@/pages/components/TradeSideSize';
import { ZERO } from '@synfutures/sdks-perp';
import { OrderStatus, VirtualTradeType } from '@synfutures/sdks-perp-datasource';
import HistoryFilterDropDown from './HistoryFilterDropDown';
import { ReactComponent as IconFilter } from './assets/icon_filter_off.svg';
import { ReactComponent as IconPay } from './assets/icon_label_p.svg';
import { ReactComponent as IconReceive } from './assets/icon_label_r.svg';

export const portfolioTableColumns = {
  lastUpdatedTime: {
    title: 'common.status',
    key: 'status',
    width: 119,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    render: (value: any, record: IOrderHistory): JSX.Element | undefined => {
      const status = record.status;
      let statusText = t(`common.table.status.${status}`);
      if (status === OrderStatus.FILLED && !record.filledSize.abs().eq(record.size.abs())) {
        statusText = t(`common.table.status.PARTIAL_FILLED`);
      }
      return (
        <UnderlineToolTip title={`${t(`common.table.lastUpdatedTime`)}: ${formatDate(record.timestamp * 1000)}`}>
          <span>{statusText}</span>
        </UnderlineToolTip>
      );
    },
  },
  direction: {
    title: 'common.table.direction',
    key: 'direction',
    width: 80,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    render: (value: any, record: IOrderHistory): JSX.Element | undefined => {
      return <>{formatDate(record.timestamp * 1000)}</>;
    },
  },
  type: {
    title: 'common.table.type',
    key: 'type',
    width: 80,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    render: (value: any, record: ITradeHistory): JSX.Element | undefined => {
      const typeDom = (
        <span>
          <>{t(`common.historyC.tradeHistory.type.${record.type}`)}</>
        </span>
      );
      return (
        <UnderlineToolTip
          title={record.type === VirtualTradeType.RANGE ? <LiquidityRemoveTooltip record={record} /> : undefined}>
          {typeDom}
        </UnderlineToolTip>
      );
    },
  },
  orderPrice: {
    title: 'common.table.orderPrice',
    key: 'orderPrice',
    width: 90,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    render: (value: any, record: IOrderHistory): JSX.Element | undefined => {
      const price = WrappedBigNumber.from(record.price);
      return <>{price.formatPriceNumberWithTooltip()}</>;
    },
  },
  price: {
    title: 'common.table.price',
    key: 'price',
    width: 80,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    render: (value: any, record: ITradeHistory): JSX.Element | undefined => {
      // const price = getAdjustTradePrice(record.price, record.pair?.isInverse || false);
      const price = WrappedBigNumber.from(record.price);
      return <>{price.formatPriceNumberWithTooltip()}</>;
    },
  },
  side: {
    title: 'common.sideSize',
    key: 'side',
    width: 140,
    align: 'left',
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    render: (value: any, record: ITradeHistory | IOrderHistory): JSX.Element | undefined => {
      const side = record.side;
      return (
        <div className="syn-side-size-table-item">
          <TradeSideSize
            side={side}
            size={WrappedBigNumber.from(record.size?.abs()).formatNumberWithTooltip({
              isShowTBMK: true,
              suffix: record?.pair?.rootInstrument.baseToken?.symbol,
            })}
          />
        </div>
      );
    },
  },
  action: {
    title: 'common.table.action',
    key: 'action',
    width: 80,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    render: (value: any, record: IFundingHistory): JSX.Element | undefined => {
      return <>{record.type}</>;
    },
  },
};

export function useHistoryTableColumns(
  historyType: HISTORY_TYPE,
  pairs?: (IGraphPairBasicInfo | undefined)[],
  quotes?: (TokenInfo | undefined)[],
  showPair = true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnsType<any> {
  const { t } = useTranslation();
  const chainId = useChainId();
  const futures = useWrappedInstrumentMap(chainId);
  const getEtherscanLink = useEtherscanLink();
  const timestamp = useMemo(
    () => ({
      title: 'common.table.time',
      key: 'time',
      width: 140,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (value: any, record: ITradeHistory): JSX.Element | undefined => {
        return (
          <ExternalLink href={getEtherscanLink(record.txHash, 'transaction')}>
            <div className="history-time-with-icon">
              <span>{formatDate(record.timestamp * 1000)}</span>
              {record?.pair?.chainId && <img src={DAPP_CHAIN_CONFIGS[record.pair?.chainId].network.icon} />}
            </div>
          </ExternalLink>
        );
      },
    }),
    [getEtherscanLink],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tradeValue = useMemo(
    () => ({
      title: 'common.table.tradeV',
      key: 'tradeV',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: ITradeHistory): JSX.Element | undefined => {
        const future = futures[record.instrumentAddr];
        return (
          <>
            {WrappedBigNumber.from(record.tradeValue).formatNumberWithTooltip({
              suffix: future?.marginToken.symbol,
            })}
          </>
        );
      },
    }),
    [futures],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fee = useMemo(
    () => ({
      title: 'common.table.fee',
      key: 'fee',
      width: 150,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: ITradeHistory): JSX.Element | undefined => {
        const future = futures[record.instrumentAddr];

        let type: 'paid' | 'received' | undefined = undefined;
        let fee = record?.fee;
        if (record.type === VirtualTradeType.MARKET) {
          type = 'paid';
        } else if (record.type === VirtualTradeType.LIMIT) {
          type = 'received';
        } else if (record.type === VirtualTradeType.RANGE) {
          fee = ZERO;
        } else if (record.type === VirtualTradeType.TAKE_OVER) {
          fee = ZERO;
        } else if (record.type === VirtualTradeType.LIQUIDATION) {
          type = 'paid';
        }
        return (
          <EmptyDataWrap isLoading={!record?.fee || fee.lte(0)}>
            <span className="syn-futures-table_card-fee">
              <Tooltip title={type && t(`common.table.${type}`)}>
                {type && (
                  <span className="syn-futures-table_card-fee-icon">
                    {type === 'paid' ? <IconPay /> : <IconReceive />}
                  </span>
                )}
              </Tooltip>

              <FeeTooltip instrument={future} fee={fee} stablityFee={record.stablityFee} />
            </span>
          </EmptyDataWrap>
        );
      },
    }),
    [futures, t],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const size = useMemo(
    () => ({
      title: 'common.table.size',
      key: 'size',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: ITradeHistory | IOrderHistory): JSX.Element | undefined => {
        const future = futures[record.instrumentAddr || ''];
        return (
          <>
            {WrappedBigNumber.from(record.size.abs()).formatNumberWithTooltip({
              suffix: future?.baseToken?.symbol,
            })}
          </>
        );
      },
    }),
    [futures],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fundingSize = useMemo(
    () => ({
      title: 'common.table.amount',
      key: 'amount',
      width: 80,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: IFundingHistory): JSX.Element | undefined => {
        const future = futures[record.instrumentAddr || ''];
        return (
          <>
            {WrappedBigNumber.from(record.funding).abs().formatNumberWithTooltip({
              suffix: future?.marginToken.symbol,
            })}
          </>
        );
      },
    }),
    [futures],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const transferAmount = useMemo(
    () => ({
      title: 'common.table.amount',
      key: 'amount',
      width: 120,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: ITransferHistory): JSX.Element | undefined => {
        const future = futures[record.instrumentAddr || ''];
        return (
          <>
            {future?.marginToken &&
              WrappedBigNumber.from(
                fixBalanceNumberDecimalsTo18(record.amount, future?.marginToken.decimals),
              ).formatNumberWithTooltip({
                suffix: future?.marginToken.symbol,
              })}
          </>
        );
      },
    }),
    [futures],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const direction = useMemo(
    () => ({
      title: 'common.table.direction',
      key: 'direction',
      width: 120,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: ITransferHistory): JSX.Element | undefined => {
        return <>{record.isTransferIn ? t('common.table.transferIn') : t('common.table.transferOut')}</>;
      },
    }),
    [t],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const earnPriceRange = useMemo(
    () => ({
      title: 'common.table.earn.priceRange',
      key: 'earnPriceRange',
      width: 120,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_: any, record: ILiquidityHistory): JSX.Element | undefined => {
        const priceMin = WrappedBigNumber.from(record.lowerPrice);

        const priceMax = WrappedBigNumber.from(record.upperPrice);
        return (
          <>
            {priceMin.formatPriceNumberWithTooltip()} ~ {priceMax.formatPriceNumberWithTooltip()}
          </>
        );
      },
    }),
    [],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fairPrice = useMemo(
    () => ({
      title: 'common.fairP',
      key: 'fairPrice',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_: any, record: ILiquidityHistory): JSX.Element | undefined => {
        const fairPrice = WrappedBigNumber.from(record.fairPrice);
        return <>{fairPrice.formatPriceNumberWithTooltip()}</>;
      },
    }),
    [],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const earnAmountMobile = useMemo(
    () => ({
      title: 'common.table.amount',
      key: 'amount',
      width: 80,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: ILiquidityHistory): JSX.Element | undefined => {
        const future = futures[record.instrumentAddr || ''];
        return <>{WrappedBigNumber.from(record.amount).formatNumberWithTooltip()}</>;
      },
    }),
    [futures],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const earnFeeEarning = useMemo(
    () => ({
      title: 'common.table.earn.feeEarning',
      key: 'feeEarning',
      width: 100,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
      render: (_value: any, record: ILiquidityHistory): JSX.Element | undefined => {
        const future = futures[record.instrumentAddr || ''];
        return (
          <EmptyDataWrap isLoading={!record.feeEarned}>
            {record.feeEarned &&
              WrappedBigNumber.from(record.feeEarned).formatNumberWithTooltip({
                suffix: future?.marginToken.symbol,
              })}
          </EmptyDataWrap>
        );
      },
    }),
    [futures],
  );

  const filters = useMemo(
    () =>
      pairs?.map((pair) => ({
        text: pair ? (
          <TokenPair
            baseToken={pair?.rootInstrument.baseToken}
            quoteToken={pair?.rootInstrument.quoteToken}
            isShowLogo={false}
            instrumentAddr={pair?.rootInstrument.instrumentAddr}
            isInverse={pair?.rootInstrument?.isInverse}
            isShowExpiryTag={false}
            expiry={pair?.expiry}
          />
        ) : (
          ''
        ),
        value: pair?.id,
      })),
    [pairs],
  );

  const pair = useMemo(
    () => ({
      title: 'common.market.tradeP',
      dataIndex: 'name',
      width: 260,
      filters,
      filterIcon: <IconFilter />,
      onFilter: (value: string, record: ITradeHistory | IOrderHistory) => record?.pair?.id === value,
      filterDropdown: (props: FilterDropdownProps) => (props.filters ? <HistoryFilterDropDown {...props} /> : <></>),
      render: (text: string, record: { pair: IGraphPairBasicInfo }): JSX.Element | undefined => {
        const pair = record.pair;
        if (!pair) return undefined;
        return (
          <TokenPair
            baseToken={pair.rootInstrument.baseToken}
            quoteToken={pair.rootInstrument.quoteToken}
            instrumentAddr={pair.rootInstrument.instrumentAddr}
            marketType={pair.rootInstrument.marketType}
            isInverse={pair.rootInstrument?.isInverse}
            expiry={pair?.expiry}></TokenPair>
        );
      },
    }),
    [filters],
  );

  const quoteFilters = useMemo(
    () =>
      quotes?.map((quote) => ({
        text: quote ? quote.symbol : '',
        value: quote?.id,
      })),
    [quotes],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const accountType = useMemo(
    () => ({
      title: 'common.table.account',
      dataIndex: 'quote',
      className: 'history-account-type',
      width: 180,
      filters: quoteFilters,
      align: 'left',
      filterIcon: <IconFilter />,
      onFilter: (value: string, record: IAccountBalanceHistory) => record?.quote.address === value,
      filterDropdown: (props: FilterDropdownProps) => (props.filters ? <HistoryFilterDropDown {...props} /> : <></>),
      render: (_value: TokenInfo, record: IAccountBalanceHistory): JSX.Element | undefined => {
        return (
          <>
            <TokenSymbol classNames="history-token-symbol" tokenInfo={record?.quote}></TokenSymbol>
          </>
        );
      },
    }),
    [quoteFilters],
  );

  const columnsMap = useMemo(
    () => ({
      [HISTORY_TYPE.ORDERS]: [
        {
          ...timestamp,
          render: (value: unknown, record: IOrderHistory): JSX.Element | undefined => {
            return (
              <ExternalLink href={getEtherscanLink(record.placeTxHash, 'transaction')}>
                <div className="history-time-with-icon">
                  <span>{formatDate(record.createdTimestamp * 1000)}</span>
                  {record?.pair?.chainId && <img src={DAPP_CHAIN_CONFIGS[record.pair?.chainId].network.icon} />}
                </div>
              </ExternalLink>
            );
          },
        },
        showPair ? { ...pair, title: 'common.table.pair', width: 190, align: 'left' } : undefined,
        { ...portfolioTableColumns.side, width: 120 },
        {
          title: 'common.taken',
          key: 'FILLED_AMOUNT',
          width: 135,
          // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
          render: (value: any, record: IOrderHistory): JSX.Element | undefined => {
            const future = futures[record.instrumentAddr];
            return (
              <>{WrappedBigNumber.from(record.filledSize.abs()).abs().formatNumberWithTooltip({ isShowTBMK: true })}</>
            );
          },
        },

        {
          ...portfolioTableColumns.orderPrice,
          // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
          render: (value: any, record: IOrderHistory): JSX.Element | undefined => {
            const price = WrappedBigNumber.from(record.price); // getAdjustTradePrice(oPrice, record.pair?.isInverse || false);
            return <>{price.formatPriceNumberWithTooltip()}</>;
          },
        },
        {
          ...tradeValue,
          width: 110,
          // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
          render: (value: any, record: IOrderHistory): JSX.Element | undefined => {
            const future = futures[record.instrumentAddr];
            return (
              <>
                {WrappedBigNumber.from(record.tradeValue).abs().formatNumberWithTooltip({
                  suffix: future?.marginToken.symbol,
                })}
              </>
            );
          },
        },
        {
          ...fee,
          title: 'common.table.feeEarned',
          width: 150,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: (_value: any, record: ITradeHistory): JSX.Element | undefined => {
            const future = futures[record.instrumentAddr];
            const fee = WrappedBigNumber.from(record.fee);
            return (
              <EmptyDataWrap isLoading={!record.fee}>
                <span className={fee.gt(0) ? 'highlight' : ''}>
                  {fee.formatNumberWithTooltip({
                    suffix: future?.marginToken.symbol,
                  })}
                </span>
              </EmptyDataWrap>
            );
          },
        },
        {
          ...portfolioTableColumns.lastUpdatedTime,
          width: 89,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: (value: any, record: IOrderHistory): JSX.Element | undefined => {
            const status = record.status;
            let statusText = t(`common.table.status.${status}`);
            if (status === OrderStatus.FILLED && !record.filledSize.abs().eq(record.size.abs())) {
              statusText = t(`common.table.status.PARTIAL_FILLED`);
            }
            return (
              <UnderlineToolTip
                overlayStyle={{ maxWidth: 300 }}
                title={
                  <ExternalLink
                    className="tooltip"
                    width={300}
                    href={getEtherscanLink(
                      (status === OrderStatus.FILLED ? record.fillTxHash : record.cancelTxHash) || '',
                      'transaction',
                    )}>
                    {t(`common.table.lastUpdatedTime`)}: {formatDate(record.timestamp * 1000)}
                  </ExternalLink>
                }>
                <span>{statusText}</span>
              </UnderlineToolTip>
            );
          },
        },
      ],
      [HISTORY_TYPE.TRADE]: [
        timestamp,
        showPair ? { ...pair, title: 'common.table.pair', width: 180, align: 'left' } : undefined,
        { ...portfolioTableColumns.type, align: 'left' },
        portfolioTableColumns.side,
        { ...portfolioTableColumns.price, width: 100 },
        { ...tradeValue, width: 110 },
        { ...fee, width: 200 },
      ],
      [HISTORY_TYPE.FUNDING]: [
        {
          ...timestamp,
          render: (value: unknown, record: ITradeHistory): JSX.Element | undefined => (
            <>
              <div className="history-time-with-icon">
                <span>{formatDate(record.timestamp * 1000)}</span>
                {record?.pair?.chainId && <img src={DAPP_CHAIN_CONFIGS[record.pair?.chainId].network.icon} />}
              </div>
            </>
          ),
        },
        showPair ? { ...pair, title: 'common.table.pair', width: 120, align: 'left' } : undefined,
        portfolioTableColumns.action,
        fundingSize,
      ],
      [HISTORY_TYPE.TRANSFERS]: [
        { ...timestamp, width: 190 },
        showPair ? { ...pair, title: 'common.table.pair', width: 120, align: 'left' } : undefined,
        direction,
        { ...transferAmount, width: 180 },
      ],
      [HISTORY_TYPE.LIQUIDITY]: [
        { ...timestamp, width: 120 },
        showPair ? { ...pair, title: 'common.table.pair', width: 120, align: 'left' } : undefined,
        {
          ...portfolioTableColumns.type,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: (_value: any, record: ILiquidityHistory): JSX.Element | undefined => {
            return (
              <>
                {record.type === 'Remove' && record.operator?.toLowerCase() !== record.trader?.toLowerCase()
                  ? t(`common.historyC.liqHistory.Removed`)
                  : t(`common.historyC.liqHistory.${record.type}`)}
              </>
            );
          },
        },
        earnPriceRange,
        fairPrice,
        earnAmountMobile,
        earnFeeEarning,
      ],
      [HISTORY_TYPE.LIQUIDITY_MOBILE]: [
        {
          ...timestamp,
          width: 90,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: (value: any, record: ITradeHistory): JSX.Element | undefined => {
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
          ...portfolioTableColumns.type,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: (_value: any, record: ILiquidityHistory): JSX.Element | undefined => {
            return (
              <>
                {record.type === 'Remove' && record.operator?.toLowerCase() !== record.trader?.toLowerCase()
                  ? t(`common.historyC.liqHistory.Removed`)
                  : t(`common.historyC.liqHistory.${record.type}`)}
              </>
            );
          },
          width: 45,
        },
        { ...earnPriceRange, width: 115 },
        { ...earnAmountMobile, width: 55 },
      ],
      [HISTORY_TYPE.ACCOUNT]: [
        {
          ...timestamp,
          width: 190,
          render: (value: unknown, record: IAccountBalanceHistory): JSX.Element | undefined => {
            return (
              <ExternalLink href={getEtherscanLink(record.txHash, 'transaction')}>
                <div className="history-time-with-icon">
                  <span>{formatDate((record?.timestamp || 0) * 1000)}</span>
                  {record?.chainId && <img src={DAPP_CHAIN_CONFIGS[record?.chainId].network.icon} />}
                </div>
              </ExternalLink>
            );
          },
        },
        accountType,
        {
          ...portfolioTableColumns.type,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: (_value: any, record: IAccountBalanceHistory): JSX.Element | undefined => {
            return <>{record.type === 'Deposit' ? t('common.deposit') : t('common.withdraw')}</>;
          },
        },
        {
          ...transferAmount,
          width: 180, // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: (_value: any, record: IAccountBalanceHistory): JSX.Element | undefined => {
            try {
              return (
                <>
                  {WrappedBigNumber.from(
                    fixBalanceNumberDecimalsTo18(record.amount, record?.quote?.decimals),
                  ).formatNumberWithTooltip({
                    suffix: record?.quote?.symbol,
                  })}
                </>
              );
            } catch (error) {
              console.log('🚀 ~ error:', { error, record });
            }
          },
        },
      ],
    }),
    [
      timestamp,
      showPair,
      pair,
      tradeValue,
      fee,
      fundingSize,
      direction,
      transferAmount,
      earnPriceRange,
      fairPrice,
      earnAmountMobile,
      earnFeeEarning,
      accountType,
      getEtherscanLink,
      futures,
      t,
    ],
  );
  const columnDefs = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () =>
      _.filter(
        _.get(columnsMap, [historyType]),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => !!c,
      )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: { title: any }) => ({ ...c, title: t(c.title) })),
    [columnsMap, historyType, t],
  );
  return columnDefs;
}

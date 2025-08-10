/**
 * @description Component-LimitFormDetail
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import { Side } from '@synfutures/sdks-perp';
import { Spin } from 'antd';
import { FC, memo, useMemo } from 'react';
// import IconToolTip from '@/components/ToolTip/IconToolTip';

import Alert from '@/components/Alert';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { useCrossMarketSimulation } from '@/features/trade/hooks';
import { TokenInfo } from '@/types/token';
import { Trans, useTranslation } from 'react-i18next';
import TradeFormDetails from '../../TradeDetail/TradeFormDetails';
import { LimitFormDetail } from '../LimitFormDetail';

interface IProps {
  isLoading: boolean;
  tradeSide?: Side;
  marginToken: WrappedQuote | undefined;
  baseToken?: TokenInfo;
  fairPrice?: WrappedBigNumber;
  chainId: CHAIN_ID | undefined;
  pairSymbol?: string;
  showSize?: boolean;
  isInverse?: boolean;
}
const CrossMarketDetailComponent: FC<IProps> = function ({
  marginToken,
  isLoading,
  chainId,
  fairPrice,
  tradeSide,
  pairSymbol,
  baseToken,
}) {
  const { t } = useTranslation();
  const crossSimulation = useCrossMarketSimulation(chainId);
  const marketSimulation = useMemo(() => crossSimulation?.data?.tradeSimulation, [crossSimulation]);
  const limitSimulation = useMemo(() => crossSimulation?.data?.orderSimulation, [crossSimulation]);

  const marketDetailExtraTitle = useMemo(() => {
    return (
      <div className="syn-cross-market-detail-market-title">
        <Trans
          t={t}
          i18nKey={'common.tradePage.crossMarketTrade.marketTradePart'}
          components={{ b: <b />, span: <span className={tradeSide === Side.LONG ? 'long' : 'short'} /> }}
          values={{
            side: tradeSide === Side.LONG ? t('common.long') : t('common.short'),
            size: crossSimulation?.data?.tradeSize.formatDisplayNumber(),
            base: baseToken?.symbol,
            price: WrappedBigNumber.from(marketSimulation?.tradePrice || 0).formatPriceString(),
          }}
        />
      </div>
    );
  }, [t, tradeSide, crossSimulation?.data?.tradeSize, baseToken?.symbol, marketSimulation?.tradePrice]);

  const limitDetailExtraTitle = useMemo(() => {
    return (
      <div className="syn-cross-market-detail-market-title">
        <Trans
          t={t}
          i18nKey={'common.tradePage.crossMarketTrade.limitTradePart'}
          components={{ b: <b />, span: <span className={tradeSide === Side.LONG ? 'long' : 'short'} /> }}
          values={{
            side: tradeSide === Side.LONG ? t('common.long') : t('common.short'),
            size: crossSimulation?.data?.orderSize.formatDisplayNumber(),
            base: baseToken?.symbol,
            // price: getAdjustTradePrice(limitSimulation?.limitPrice || 0, isInverse || false).formatPriceString(),
            price: WrappedBigNumber.from(limitSimulation?.limitPrice || 0).formatPriceString(),
          }}
        />
      </div>
    );
  }, [t, tradeSide, crossSimulation?.data?.orderSize, baseToken?.symbol, limitSimulation?.limitPrice]);

  if (!crossSimulation?.data) {
    return null;
  }

  return (
    <Spin spinning={isLoading}>
      <div className="syn-cross-market-detail-container">
        <div className="syn-cross-market-detail-alert">
          <Alert
            message={<Trans t={t} i18nKey={'errors.trade.crossMarketInfo'} components={{ b: <b /> }} />}
            type="info"
            showIcon
          />
        </div>
        {crossSimulation && crossSimulation.data?.tradeSize?.gt(0) && (
          <div className="syn-cross-market-detail-market-part">
            <TradeFormDetails
              simulation={marketSimulation}
              marginToken={marginToken}
              fairPrice={fairPrice}
              isLoading={false}
              chainId={chainId}
              tradeSide={tradeSide}
              extraTitle={marketDetailExtraTitle}
            />
          </div>
        )}
        {crossSimulation && crossSimulation.data?.orderSize?.gt(0) && (
          <div className="syn-cross-market-detail-limit-part">
            <LimitFormDetail
              marginToken={marginToken}
              fairPrice={fairPrice}
              isLoading={false}
              chainId={chainId}
              pairSymbol={pairSymbol}
              tradeSide={tradeSide}
              simulationData={crossSimulation?.data?.orderSimulation}
              extraTitle={limitDetailExtraTitle}
            />
          </div>
        )}
      </div>
    </Spin>
  );
};

export const CrossMarketDetail = memo(CrossMarketDetailComponent);

import './TradeFormDetails.less';

import { CHAIN_ID } from '@derivation-tech/context';
import { Side } from '@synfutures/sdks-perp';
import { Spin } from 'antd';
import classNames from 'classnames';
import { memo, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ReactComponent as ChevronDown } from '@/assets/svg/icon_chevron_down.svg';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { formatPercentage } from '@/components/NumberFormat';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { useGlobalConfig } from '@/features/global/hooks';
import { useTokenPrice } from '@/features/global/query';
import { useMarketFormState } from '@/features/trade/hooks';
import { ISimulationData } from '@/types/trade';
import { formatNumber } from '@/utils/numberUtil';

interface IProps {
  isLoading: boolean;
  tradeSide?: Side;
  marginToken: WrappedQuote | undefined;
  simulation: ISimulationData | undefined;
  fairPrice?: WrappedBigNumber;
  chainId: CHAIN_ID | undefined;
  detailToggle?: boolean;
  extraTitle?: React.ReactNode;
}
export default function TradeFormDetailsComponent({
  isLoading,
  simulation,
  marginToken,
  fairPrice,
  chainId,
  tradeSide,
  detailToggle,
  extraTitle,
}: IProps): JSX.Element | null {
  const { t } = useTranslation();
  const { isMobile } = useMediaQueryDevice();
  const tokenPriceInfo = useTokenPrice({ chainId, tokenAddress: marginToken?.address });
  const [showDetail, setShowDetail] = useState(true);
  const { slippage } = useGlobalConfig(chainId);
  const { marginAmount } = useMarketFormState(chainId);
  const priceImpactPrice = useMemo(() => {
    if (fairPrice && simulation?.priceChangeRate) {
      return fairPrice.mul(simulation?.priceChangeRate.add(1));
    }
  }, [fairPrice, simulation?.priceChangeRate]);

  const tradeFeeUSD = useMemo(() => {
    if (tokenPriceInfo?.current && simulation?.tradingFee) {
      return WrappedBigNumber.from(simulation?.tradingFee).mul(tokenPriceInfo?.current);
    }
    return WrappedBigNumber.ZERO;
  }, [simulation?.tradingFee, tokenPriceInfo]);

  // const additionalFeeUSD = useSimulationAdditionalFeeUSD(simulation, marginToken?.price);

  if (!simulation) {
    return null;
  }

  return (
    <Spin spinning={isLoading}>
      <div className="trade-form-details">
        {detailToggle && (
          <div className="trade-form-details-header" onClick={() => setShowDetail(!showDetail)}>
            {t('common.details')}
            <ChevronDown className={classNames({ rotate: showDetail })} />
          </div>
        )}
        {extraTitle}
        {showDetail && (
          <div className="trade-form-details-container">
            {!isMobile && simulation.margin.gt(0) && !marginAmount && (
              <dl className="margin">
                <dt>
                  {isMobile ? (
                    t('common.marginRequired')
                  ) : (
                    <UnderlineToolTip title={t('tooltip.tradePage.marginRequired')}>
                      {t('common.marginRequired')}
                    </UnderlineToolTip>
                  )}
                </dt>
                <div className="trade-form-details-line"></div>
                <dd>{simulation.margin.formatNumberWithTooltip({ suffix: marginToken?.symbol })}</dd>
              </dl>
            )}
            {simulation?.realized?.notEq(0) && (
              <dl>
                <dt>{t('common.tradeFormDetails.estPnl')}</dt>
                <div className="trade-form-details-line"></div>
                <dd>
                  <EmptyDataWrap isLoading={!simulation?.realized}>
                    {simulation.realized.formatNumberWithTooltip({
                      isShowTBMK: true,
                      prefix: '≈',
                      suffix: marginToken?.symbol,
                      isShowApproximatelyEqualTo: false,
                    })}
                  </EmptyDataWrap>
                </dd>
              </dl>
            )}
            <dl>
              <dt>
                {isMobile ? (
                  t('common.tradeFormDetails.pi')
                ) : (
                  <UnderlineToolTip title={t('tooltip.tradePage.priceImpact')}>
                    {t('common.tradeFormDetails.pi')}
                  </UnderlineToolTip>
                )}
                {/* <IconToolTip title={t('tooltip.tradePage.priceImpact')}></IconToolTip> */}
              </dt>
              <div className="trade-form-details-line"></div>
              <dd>
                <EmptyDataWrap isLoading={!simulation?.priceChangeRate}>
                  {formatPercentage({
                    percentage: WrappedBigNumber.from(simulation?.priceChangeRate).toNumber(),
                    colorShader: false,
                    withThreshHold: true,
                  })}
                  <span className="impact">&#40;{priceImpactPrice?.formatPriceNumberWithTooltip()}&#41;</span>
                </EmptyDataWrap>
              </dd>
            </dl>
            <dl>
              <dt>{t('common.tradeFormDetails.estTV')}</dt>
              <div className="trade-form-details-line"></div>
              <dd>
                {simulation.estimatedTradeValue?.formatNumberWithTooltip({
                  suffix: marginToken?.symbol,
                })}
              </dd>
            </dl>
            <dl>
              <dt>{t('common.tradeFormDetails.fee')}</dt>
              <div className="trade-form-details-line"></div>
              <dd>
                <EmptyDataWrap isLoading={!simulation?.tradingFee}>
                  {tradeFeeUSD.gte(0.001) && ` ≈ `}
                  {tradeFeeUSD?.formatNumberWithTooltip({
                    prefix: '$',
                    colorShader: false,
                    isShowApproximatelyEqualTo: tradeFeeUSD.gte(0.0001),
                  })}
                </EmptyDataWrap>
              </dd>
            </dl>
            {/* {simulation?.additionalFee?.gt(0) && (
              <>
                <dl>
                  <dt>
                    {' '}
                    {isMobile ? (
                      t('common.tradeFormDetails.additionalFee')
                    ) : (
                      <LeanMoreToolTip title={t('tooltip.tradePage.additionalFee')}>
                        {t('common.tradeFormDetails.additionalFee')}
                      </LeanMoreToolTip>
                    )}
                  </dt>
                  <div className="trade-form-details-line"></div>
                  <dd>
                    <EmptyDataWrap isLoading={!simulation?.additionalFee || additionalFeeUSD.eq(0)}>
                      {additionalFeeUSD.gte(0.001) && ` ≈ `}
                      {additionalFeeUSD?.formatNumberWithTooltip({
                        prefix: '$',
                        colorShader: false,
                        isShowApproximatelyEqualTo: additionalFeeUSD.gte(0.0001),
                      })}
                    </EmptyDataWrap>
                  </dd>
                </dl>
              </>
            )} */}
            <dl>
              <dt>{t('common.tradeFormDetails.maxSlippage')}</dt>
              <div className="trade-form-details-line"></div>
              <dd>
                <EmptyDataWrap isLoading={!slippage}>
                  <UnderlineToolTip
                    title={
                      <Trans
                        i18nKey="tooltip.tradePage.maxSlippageTooltip"
                        values={{
                          slippage: formatNumber(slippage, 2),
                          limitPrice: WrappedBigNumber.from(simulation.limitPrice).formatPriceString(),
                          sideWord:
                            tradeSide === Side.LONG
                              ? t('common.tradeFormDetails.maximum')
                              : t('common.tradeFormDetails.minimum'),
                        }}
                      />
                    }>
                    {WrappedBigNumber.from(slippage).formatPercentage({ hundredfold: false, colorShader: false })}
                  </UnderlineToolTip>
                </EmptyDataWrap>
              </dd>
            </dl>
          </div>
        )}
      </div>
    </Spin>
  );
}
export const TradeFormDetails = memo(TradeFormDetailsComponent);

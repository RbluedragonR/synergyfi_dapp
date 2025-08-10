/**
 * @description Component-LimitFormDetail
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import { Side } from '@synfutures/sdks-perp';
import { Spin } from 'antd';
import { FC, memo, useMemo } from 'react';
// import IconToolTip from '@/components/ToolTip/IconToolTip';
import { useTranslation } from 'react-i18next';

import { ReactComponent as IconRebate } from '@/assets/svg/icon_rebate.svg';
import { ReactComponent as IconSpark } from '@/assets/svg/icon_sparkle_16.svg';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { Tooltip } from '@/components/ToolTip';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { useTokenPrice } from '@/features/global/query';
import { TokenInfo } from '@/types/token';
import { IOrderSimulationData, IScaledOrderSimulationData } from '@/types/trade';

interface IProps {
  isLoading: boolean;
  tradeSide?: Side;
  marginToken: WrappedQuote | undefined;
  baseToken?: TokenInfo;
  fairPrice?: WrappedBigNumber;
  chainId: CHAIN_ID | undefined;
  pairSymbol?: string;
  showSize?: boolean;
  simulationData: IOrderSimulationData | IScaledOrderSimulationData | undefined;
  extraTitle?: React.ReactNode;
}
const LimitFormDetailComponent: FC<IProps> = function ({
  marginToken,
  isLoading,
  chainId,
  showSize,
  baseToken,
  simulationData: simulationData,
  extraTitle,
}) {
  const { isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();

  const tokenPriceInfo = useTokenPrice({ chainId, tokenAddress: marginToken?.address });
  const minFeeRebateUSD = useMemo(() => {
    if (tokenPriceInfo?.current && simulationData?.minFeeRebate) {
      return WrappedBigNumber.from(simulationData?.minFeeRebate).mul(tokenPriceInfo?.current);
    }
    return WrappedBigNumber.ZERO;
  }, [simulationData?.minFeeRebate, tokenPriceInfo]);

  if (!simulationData) {
    return null;
  }

  return (
    <Spin spinning={isLoading}>
      <div className="syn-limit-form-detail">
        {extraTitle}
        <div className="syn-limit-form-detail-container">
          {showSize && (
            <dl>
              <dt>
                {t('common.size')}
                {/* <IconToolTip title={t('tooltip.tradePage.limitPrice')}></IconToolTip> */}
              </dt>
              <div className="syn-limit-form-detail-line"></div>
              <dd>
                {WrappedBigNumber.from(simulationData?.baseSize || 0).formatNumberWithTooltip({
                  suffix: baseToken?.symbol,
                })}
              </dd>
            </dl>
          )}
          {!isMobile && simulationData.margin.gt(0) && (
            <dl className="margin">
              <dt>
                <UnderlineToolTip title={t('tooltip.tradePage.marginRequired')}>
                  {t('common.marginRequired')}
                </UnderlineToolTip>
              </dt>
              <div className="syn-limit-form-detail-line"></div>
              <dd>{simulationData?.margin.formatNumberWithTooltip({ suffix: marginToken?.symbol })}</dd>
            </dl>
          )}
          <dl>
            <dt>
              {t('common.tradeFormDetails.estTV')}
              {/* <IconToolTip title={t('tooltip.tradePage.limitPrice')}></IconToolTip> */}
            </dt>
            <div className="syn-limit-form-detail-line"></div>
            <dd>
              {simulationData?.estimatedTradeValue?.formatNumberWithTooltip({
                suffix: marginToken?.symbol,
              })}
            </dd>
          </dl>
          <dl>
            <dt>
              {t('common.tradeFormDetails.feeRebate')}
              {isMobile ? (
                <IconSpark />
              ) : (
                <Tooltip title={t('tooltip.tradePage.feeRebate')}>
                  <IconRebate />
                </Tooltip>
              )}
            </dt>
            <div className="syn-limit-form-detail-line"></div>
            <dd>
              <EmptyDataWrap isLoading={!simulationData.minFeeRebate}>
                {minFeeRebateUSD.gte(0.001) && ` ≈ `}
                {minFeeRebateUSD?.formatNumberWithTooltip({
                  prefix: '$',
                  colorShader: false,
                  isShowApproximatelyEqualTo: minFeeRebateUSD.gte(0.0001),
                })}
              </EmptyDataWrap>
            </dd>
          </dl>
        </div>
      </div>
    </Spin>
  );
};

export const LimitFormDetail = memo(LimitFormDetailComponent);

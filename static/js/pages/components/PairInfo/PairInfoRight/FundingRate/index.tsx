/**
 * @description Component-FundingRate
 */
// import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import LeanMoreToolTip from '@/components/ToolTip/LeanMoreToolTip';
import { FAQ_LINKS } from '@/constants/links';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { IMarketPair } from '@/types/pair';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  currentPair: WrappedPair | undefined;
  chainId: CHAIN_ID | undefined;
  marketPairInfo: IMarketPair | undefined;
}
const FundingRate: FC<IPropTypes> = function ({ currentPair, marketPairInfo }) {
  const { t } = useTranslation();
  // const dispatch = useAppDispatch();

  // const fundingRate = usePairLast1HFundingRate(chainId, currentPair?.id);
  // const onTooltipVisibleChange = useCallback(
  //   (open: boolean) => {
  //     if (open) {
  //       // if (chainId && currentPair) dispatch(fetchLast1HFundingRate({ chainId, pair: currentPair }));
  //     }
  //   },
  //   [chainId, currentPair, dispatch],
  // );

  const _1hPeriodsFunding = useMemo(() => {
    if (marketPairInfo?._1hPeriodsFunding) return marketPairInfo?._1hPeriodsFunding;
    return currentPair?.fundingFeeRateForLongAndShort;
  }, [currentPair?.fundingFeeRateForLongAndShort, marketPairInfo?._1hPeriodsFunding]);

  const _1hLastFunding = useMemo(() => {
    if (marketPairInfo?._1hLastFunding)
      return {
        long: WrappedBigNumber.from(marketPairInfo?._1hLastFunding.long),
        short: WrappedBigNumber.from(marketPairInfo?._1hLastFunding.short),
      };
  }, [marketPairInfo?._1hLastFunding]);

  // useEffect(() => {
  //   if (chainId && currentPair && currentPair.isPerpetual) {
  //     // dispatch(fetchLast1HFundingRate({ chainId, pair: currentPair }));
  //   }
  // }, [currentPair?.id]);

  if (!currentPair?.isPerpetual) return null;
  return (
    <div className="syn-pair-info-right-item">
      <div className="syn-pair-info-right-item-title">
        <LeanMoreToolTip
          overlayInnerStyle={{
            width: 400,
            paddingTop: 12,
            paddingLeft: 16,
            paddingBottom: 16,
            paddingRight: 16,
          }}
          // onOpenChange={onTooltipVisibleChange}
          link={FAQ_LINKS.PREDICTED_FUNDING_RATE}
          placement="bottom"
          trigger={['hover', 'click']}
          title={
            <>
              <div className="syn-pair-info-right-funding">
                <div className="syn-pair-info-right-funding-title">
                  <Trans i18nKey={'tooltip.tradePage.fundingPreHour'} components={{ b: <b /> }} />
                </div>
                <div className="syn-pair-info-right-funding-rate">
                  <span>
                    {currentPair.wrapAttribute('fundingRatePerHour').gt(0) ? t('common.longPay') : t('common.shortPay')}
                  </span>
                  <b>
                    <EmptyDataWrap isLoading={!_1hPeriodsFunding}>
                      {currentPair.wrapAttribute('fundingRatePerHour').gt(0)
                        ? _1hPeriodsFunding?.long?.abs?.()?.formatPercentage?.({
                            colorShader: false,
                            decimals: 4,
                          })
                        : _1hPeriodsFunding?.short?.abs?.()?.formatPercentage?.({
                            colorShader: false,
                            decimals: 4,
                          })}
                    </EmptyDataWrap>
                  </b>
                  <span className="divider">/</span>
                  <span>
                    {' '}
                    {currentPair.wrapAttribute('fundingRatePerHour').gt(0)
                      ? t('common.shortReceive')
                      : t('common.longReceive')}
                  </span>
                  <b>
                    <EmptyDataWrap isLoading={!_1hPeriodsFunding}>
                      {currentPair.wrapAttribute('fundingRatePerHour').gt(0)
                        ? _1hPeriodsFunding?.short?.abs?.()?.formatPercentage?.({
                            colorShader: false,
                            decimals: 4,
                          })
                        : _1hPeriodsFunding?.long?.abs?.()?.formatPercentage?.({
                            colorShader: false,
                            decimals: 4,
                          })}
                    </EmptyDataWrap>
                  </b>
                </div>
              </div>

              {_1hLastFunding && (
                <div className="syn-pair-info-right-funding" style={{ marginTop: 8 }}>
                  <div className="syn-pair-info-right-funding-title">
                    <Trans i18nKey={'tooltip.tradePage.fundingLastHour'} components={{ b: <b /> }} />
                  </div>
                  <div className="syn-pair-info-right-funding-rate">
                    <span>
                      {_1hLastFunding?.long && _1hLastFunding?.long?.lt?.(0)
                        ? t('common.longPay')
                        : t('common.shortPay')}
                    </span>
                    <b>
                      <EmptyDataWrap isLoading={!_1hLastFunding}>
                        {_1hLastFunding?.long.lt(0)
                          ? _1hLastFunding.long.abs().formatPercentage({
                              colorShader: false,
                              decimals: 4,
                            })
                          : _1hLastFunding?.short.abs().formatPercentage({
                              colorShader: false,
                              decimals: 4,
                            })}
                      </EmptyDataWrap>
                    </b>
                    <span className="divider">/</span>
                    <span>
                      {' '}
                      {_1hLastFunding?.long && _1hLastFunding?.long.lt?.(0)
                        ? t('common.shortReceive')
                        : t('common.longReceive')}
                    </span>
                    <b>
                      <EmptyDataWrap isLoading={!_1hLastFunding}>
                        {_1hLastFunding?.long.lt(0)
                          ? _1hLastFunding?.short.abs().formatPercentage({
                              colorShader: false,
                              decimals: 4,
                            })
                          : _1hLastFunding?.long.abs().formatPercentage({
                              colorShader: false,
                              decimals: 4,
                            })}
                      </EmptyDataWrap>
                    </b>
                  </div>
                </div>
              )}
              <div className="syn-pair-info-right-funding-line" />
              {t('tooltip.tradePage.fundingLearMore')}
            </>
          }>
          {t('common.fundingEst')}
        </LeanMoreToolTip>
      </div>
      <div className="syn-pair-info-right-item-value">
        <EmptyDataWrap isLoading={!currentPair?.fundingRatePerHour}>
          {currentPair?.wrapAttribute('fundingRatePerHour').formatPercentage({
            hundredfold: true,
            colorShader: false,
            decimals: 4,
          })}{' '}
          {/* {
                          <LeanMoreToolTip
                            link={FAQ_LINKS.PREDICTED_FUNDING_RATE}
                            title={
                              <>
                                {t('tradeDetail.underlyingInfo.pfr')}{' '}
                                <CountdownTime endTime={perpExpiryTime}></CountdownTime>
                              </>
                            }></LeanMoreToolTip>
                        } */}
        </EmptyDataWrap>
      </div>
    </div>
  );
};

export default FundingRate;

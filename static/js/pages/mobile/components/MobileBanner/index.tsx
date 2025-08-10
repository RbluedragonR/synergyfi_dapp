/**
 * @description Component-TradeMobileBanner
 */
import './index.less';

import React, { FC, useEffect, useMemo } from 'react';
import Marquee from 'react-fast-marquee';
import { useTranslation } from 'react-i18next';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { Skeleton } from '@/components/Skeleton';
import TVLWarningIcon from '@/components/TVLWarningIcon';
import TVLWarningToaster from '@/components/TVLWarningToaster';
import { PAIR_PAGE_TYPE } from '@/constants/global';
import { QUERY_KEYS } from '@/constants/query';
import { useBackendChainConfig } from '@/features/config/hook';
import { useIsFetchedPairInfo, useMarketPairInfo } from '@/features/futures/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useAppDispatch } from '@/hooks';
import { useListenSingleInstrumentEvent } from '@/hooks/data/useListenEventOnWorker';
import { usePollingSingleInstrumentDataOnTradeOrEarn } from '@/hooks/data/usePollingDataOnWorker';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { queryClient } from '@/pages/App';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  pageType?: PAIR_PAGE_TYPE;
}
const MobileBanner: FC<IPropTypes> = function ({ pageType = PAIR_PAGE_TYPE.TRADE }) {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { t } = useTranslation();
  const currentPair = useCurrentPairFromUrl(chainId);
  const isFetchedPairInfo = useIsFetchedPairInfo(chainId, currentPair?.instrumentAddr, currentPair?.expiry);
  const currPairInfo = useMarketPairInfo(chainId, currentPair?.instrumentAddr, currentPair?.expiry);
  const backendChainConfig = useBackendChainConfig(chainId);
  const showWarning = useMemo(
    () => currPairInfo?.tvlUsd?.lt(backendChainConfig?.tvlWarningAmount || 0),
    [backendChainConfig?.tvlWarningAmount, currPairInfo?.tvlUsd.stringValue],
  );
  useListenSingleInstrumentEvent(chainId, userAddr, currentPair?.rootInstrument?.id);
  usePollingSingleInstrumentDataOnTradeOrEarn(chainId, userAddr, currentPair?.rootInstrument?.id, currentPair?.expiry);
  // useFetchSingleInstrumentDataWhenChangePage(chainId, userAddr, currentPair?.rootInstrument?.id, currentPair?.expiry);
  useEffect(() => {
    if (chainId && currentPair?.rootInstrument?.instrumentAddr) {
      const instrumentAddr = currentPair.rootInstrument.instrumentAddr;
      const expiry = currentPair.expiry;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUTURES.INSTRUMENT(chainId, instrumentAddr) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.FUTURES.PAIR_INFO(chainId, instrumentAddr, expiry),
      });
    }
  }, [chainId, currentPair?.expiry, currentPair?.rootInstrument?.instrumentAddr, dispatch]);
  if (!isFetchedPairInfo) {
    return (
      <div className="syn-mobile-banner">
        <Skeleton active={true} paragraph={false} />
        <Skeleton active={true} paragraph={false} />
        <Skeleton active={true} paragraph={false} />
      </div>
    );
  }

  return (
    // the autofill will cause infinite loop
    <>
      <div className="syn-mobile-banner-wrapper">
        <Marquee speed={30}>
          <div className="syn-mobile-banner">
            {pageType === PAIR_PAGE_TYPE.TRADE ? (
              <>
                <dl>
                  <dt>{t('common.markP')}</dt>
                  <dd>
                    <EmptyDataWrap isLoading={!currentPair?.markPrice}>
                      {currentPair?.wrapAttribute('markPrice').formatPriceNumberWithTooltip()}
                    </EmptyDataWrap>
                  </dd>
                </dl>
                <span className="syn-mobile-banner-divider">/</span>
                {currentPair?.isPerpetual && (
                  <>
                    <dl>
                      <dt>{t('common.fundingEst')}</dt>
                      <dd>
                        <EmptyDataWrap isLoading={!currentPair?.fundingRatePerHour}>
                          {currentPair?.wrapAttribute('fundingRatePerHour').formatPercentage({
                            hundredfold: true,
                            colorShader: false,
                            decimals: 4,
                          })}
                        </EmptyDataWrap>
                      </dd>
                    </dl>
                    <span className="syn-mobile-banner-divider">/</span>
                  </>
                )}
                <dl>
                  <dt>{t('common.24HV')}</dt>
                  <dd>
                    <EmptyDataWrap isLoading={!currPairInfo?.volume24hUsd}>
                      {currPairInfo?.volume24hUsd.formatNumberWithTooltip({
                        isShowTBMK: true,
                        prefix: '$',
                        isShowApproximatelyEqualTo: false,
                      })}
                    </EmptyDataWrap>
                  </dd>
                </dl>
                <span className="syn-mobile-banner-divider">/</span>
                <dl>
                  <dt>{t('common.tvl')}</dt>
                  <dd>
                    <EmptyDataWrap isLoading={!currPairInfo?.tvlUsd}>
                      {currPairInfo?.tvlUsd.formatNumberWithTooltip({ isShowTBMK: true, prefix: '$' })}
                      <TVLWarningIcon tvl={currPairInfo?.tvlUsd} />
                    </EmptyDataWrap>
                  </dd>
                </dl>
                <span className="syn-mobile-banner-divider">/</span>
                {!currentPair?.isPerpetual && (
                  <>
                    <dl>
                      <dt>{t('common.oiS')}</dt>
                      <dd>
                        <EmptyDataWrap isLoading={!currentPair?.openInterests}>
                          {currentPair?.wrapAttribute('openInterests').formatNumberWithTooltip({
                            isShowTBMK: true,
                            suffix: currentPair.rootInstrument.baseToken.symbol,
                            isShowApproximatelyEqualTo: false,
                          })}
                        </EmptyDataWrap>
                      </dd>
                    </dl>
                    <span className="syn-mobile-banner-divider">/</span>
                  </>
                )}
              </>
            ) : (
              <>
                <dl>
                  <dt>{t('common.earn.estPoolApy')}</dt>
                  <dd>
                    <EmptyDataWrap isLoading={!currPairInfo?.liquidityApy}>
                      {currPairInfo?.liquidityApy?.formatPercentage({ colorShader: false })}
                    </EmptyDataWrap>
                  </dd>
                </dl>
                <span className="syn-mobile-banner-divider">/</span>
                <dl>
                  <dt>{t('common.tvl')}</dt>
                  <dd>
                    <EmptyDataWrap isLoading={!currPairInfo?.tvlUsd}>
                      {currPairInfo?.tvlUsd.formatNumberWithTooltip({ isShowTBMK: true, prefix: '$' })}
                      <TVLWarningIcon tvl={currPairInfo?.tvlUsd} />
                    </EmptyDataWrap>
                  </dd>
                </dl>
                <span className="syn-mobile-banner-divider">/</span>
                <dl>
                  <dt>{t('common.fairP')}</dt>
                  <dd>
                    <EmptyDataWrap isLoading={!currentPair?.fairPrice}>
                      {currentPair?.wrapAttribute('fairPrice').formatDisplayNumber({ isShowTBMK: true, type: 'price' })}
                    </EmptyDataWrap>
                  </dd>
                </dl>
                <span className="syn-mobile-banner-divider">/</span>
                <dl>
                  <dt>{t('common.24HV')}</dt>
                  <dd>
                    <EmptyDataWrap isLoading={!currPairInfo?.volume24hUsd}>
                      {currPairInfo?.volume24hUsd?.formatNumberWithTooltip({
                        isShowTBMK: true,
                        prefix: '$',
                        isShowApproximatelyEqualTo: false,
                      })}
                    </EmptyDataWrap>
                  </dd>
                </dl>
                <span className="syn-mobile-banner-divider">/</span>
              </>
            )}
          </div>
        </Marquee>
        {showWarning && <TVLWarningToaster />}
      </div>
      <div style={{ height: showWarning ? 121 : 41 }} />
    </>
  );
};

export default MobileBanner;

/**
 * @description Component-TradeMobileInfoDrawer
 */
import './index.less';

import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import Drawer from '@/components/Drawer';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import TokenPairOracle from '@/components/TokenPair/TokenPairOracle';
import { useCurrentPairFromUrl, usePairInfo } from '@/features/pair/hook';
import { useChainId, useEtherscanLink } from '@/hooks/web3/useChain';

import { ExternalLinkIcon } from '@/components/Link';
import TVLWarningIcon from '@/components/TVLWarningIcon';
import { PAIR_PAGE_TYPE } from '@/constants/global';
import { useIsFetchedPairInfo } from '@/features/futures/hooks';
import { ReactComponent as InfowIcon } from '@/pages/mobile/assets/svg/icon_trade_nav_info.svg';
import { shortenAddress } from '@/utils/address';
import classNames from 'classnames';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  type?: PAIR_PAGE_TYPE;
}
const getTable = (elements: ([JSX.Element, JSX.Element] | undefined)[], id: string) => {
  return elements.map(
    (element, i) =>
      element && (
        <div
          key={`${i}_${id}`}
          className={classNames('syn-mobile-info-drawer-row', i === elements.length - 1 && 'last')}>
          {element[0]}
          {element[1]}
        </div>
      ),
  );
};
const MobileInfoDrawer: FC<IPropTypes> = function ({ type = PAIR_PAGE_TYPE.TRADE }) {
  const [open, setOpen] = useState(false);
  const chainId = useChainId();
  const currentPair = useCurrentPairFromUrl(chainId);
  const { t } = useTranslation();
  const pairInfo = usePairInfo(currentPair);
  const getEtherscanLink = useEtherscanLink();
  const isFetchedPairInfo = useIsFetchedPairInfo(chainId, currentPair?.instrumentAddr, currentPair?.expiry);

  // Statistics
  const poolApy = (
    <dl>
      <dt>{t('common.earn.estPoolApy')}</dt>
      <dd>
        <EmptyDataWrap isLoading={!currentPair?.stats?.liquidityApy || currentPair?.stats?.liquidityApy?.eq(0)}>
          {currentPair?.stats?.liquidityApy.formatPercentage({ colorShader: false })}
        </EmptyDataWrap>
      </dd>
    </dl>
  );
  const tvl = (
    <dl>
      <dt>{t('common.tvl')}</dt>
      <dd>
        <EmptyDataWrap isLoading={!currentPair?.tvlUSD || currentPair?.tvlUSD.eq(0)}>
          {currentPair?.tvlUSD.formatNumberWithTooltip({
            isShowTBMK: true,
            prefix: '$',
          })}
          <TVLWarningIcon tvl={currentPair?.tvlUSD} />
        </EmptyDataWrap>
      </dd>
    </dl>
  );
  const indexPrice = (
    <dl>
      <dt>{t('common.indexP')}</dt>
      <dd>
        <EmptyDataWrap
          isLoading={!currentPair?.rootInstrument?.spotPrice || currentPair?.rootInstrument.spotPrice.eq(0)}>
          {currentPair?.rootInstrument.wrapAttribute('spotPrice').formatPriceNumberWithTooltip({
            isShowTBMK: true,
          })}
        </EmptyDataWrap>
        <small>
          {' '}
          <TokenPairOracle marketType={currentPair?.rootInstrument.marketType} />
        </small>
      </dd>
    </dl>
  );
  const markPrice = (
    <dl>
      <dt>{t('common.markP')}</dt>
      <dd>
        <EmptyDataWrap isLoading={!currentPair?.markPrice || currentPair?.markPrice.eq(0)}>
          {currentPair?.wrapAttribute('markPrice').formatPriceNumberWithTooltip({
            isShowTBMK: true,
          })}
        </EmptyDataWrap>
      </dd>
    </dl>
  );
  const fairPrice = (
    <dl>
      <dt>{t('common.fairP')}</dt>
      <dd>
        <EmptyDataWrap isLoading={!currentPair?.markPrice || currentPair?.markPrice.eq(0)}>
          {currentPair?.wrapAttribute('fairPrice').formatPriceNumberWithTooltip({
            isShowTBMK: true,
          })}
        </EmptyDataWrap>
      </dd>
    </dl>
  );
  // const high24h = (
  //   <dl>
  //     <dt>{t('common.24HH')}</dt>
  //     <dd>
  //       {' '}
  //       <EmptyDataWrap isLoading={!isFetchedPairInfo || !currentPair?.stats}>
  //         {currentPair?.stats?.high24h && currentPair?.stats?.displayHigh24h.formatPriceNumberWithTooltip()}
  //       </EmptyDataWrap>
  //     </dd>
  //   </dl>
  // );

  // const low24h = (
  //   <dl>
  //     <dt>{t('common.24HL')}</dt>
  //     <dd>
  //       <EmptyDataWrap isLoading={!isFetchedPairInfo || !currentPair?.stats}>
  //         {currentPair?.stats?.low24h && currentPair?.stats?.displayLow24h.formatPriceNumberWithTooltip()}
  //       </EmptyDataWrap>
  //     </dd>
  //   </dl>
  // );

  const openInterest = (
    <dl>
      <dt>{t('common.oi')}</dt>
      <dd>
        <EmptyDataWrap isLoading={!currentPair?.openInterests}>
          {currentPair?.wrapAttribute('openInterests').formatNumberWithTooltip({
            isShowTBMK: true,
            suffix: currentPair.rootInstrument?.baseToken?.symbol,
          })}
        </EmptyDataWrap>
      </dd>
    </dl>
  );
  const longOiShortOi = (
    <dl>
      <dt>{t('common.longOiShortOi')}</dt>
      <dd>
        <EmptyDataWrap isLoading={!currentPair?.openInterests}>
          {currentPair?.longOpenInterest?.formatNumberWithTooltip({
            isShowTBMK: true,
          })}
          &nbsp;/&nbsp;
          {currentPair?.shortOpenInterest?.formatNumberWithTooltip({
            isShowTBMK: true,
            suffix: currentPair.rootInstrument?.baseToken?.symbol,
          })}
        </EmptyDataWrap>
      </dd>
    </dl>
  );
  const volume24h = (
    <dl>
      <dt>{t('common.24HV')}</dt>
      <dd>
        <EmptyDataWrap isLoading={!isFetchedPairInfo || !currentPair?.stats}>
          {currentPair?.volume24hUSD?.formatNumberWithTooltip({
            isShowTBMK: true,
            prefix: '$',
            isShowApproximatelyEqualTo: false,
          })}
        </EmptyDataWrap>
      </dd>
    </dl>
  );

  const pay = (
    <dl>
      <dt>{currentPair?.wrapAttribute('fundingRatePerHour').gt(0) ? t('common.longPay') : t('common.shortPay')}</dt>
      <dd>
        <EmptyDataWrap isLoading={!isFetchedPairInfo || !currentPair?.fundingRatePerHour}>
          {currentPair?.wrapAttribute('fundingRatePerHour').gt(0)
            ? currentPair?.fundingFeeRateForLongAndShort.long
                .abs()
                .formatPercentage({ decimals: 4, colorShader: false })
            : currentPair?.fundingFeeRateForLongAndShort.short
                .abs()
                .formatPercentage({ decimals: 4, colorShader: false })}
        </EmptyDataWrap>
      </dd>
    </dl>
  );
  const receive = (
    <dl>
      <dt>
        {currentPair?.wrapAttribute('fundingRatePerHour').gt(0) ? t('common.shortReceive') : t('common.longReceive')}
      </dt>
      <dd>
        <EmptyDataWrap isLoading={!isFetchedPairInfo || !currentPair?.fundingRatePerHour}>
          {currentPair?.wrapAttribute('fundingRatePerHour').gt(0)
            ? currentPair?.fundingFeeRateForLongAndShort.short
                .abs()
                .formatPercentage({ decimals: 4, colorShader: false })
            : currentPair?.fundingFeeRateForLongAndShort.long
                .abs()
                .formatPercentage({ decimals: 4, colorShader: false })}
        </EmptyDataWrap>
      </dd>
    </dl>
  );

  return (
    <>
      <Button className="syn-mobile-info-drawer-btn" onClick={() => setOpen(true)} type="text" icon={<InfowIcon />} />
      <Drawer
        open={open}
        title={t('common.statistics')}
        onClose={() => {
          setOpen(false);
        }}
        className="syn-mobile-info-drawer reverse-header">
        <div className="syn-mobile-info-drawer-container">
          {type === PAIR_PAGE_TYPE.TRADE
            ? getTable(
                [
                  [indexPrice, markPrice],
                  currentPair?.isPerpetual ? [pay, receive] : undefined,
                  [openInterest, longOiShortOi],
                  // [high24h, low24h],
                  [volume24h, tvl],
                ],
                'trade-mobile-stats',
              )
            : getTable(
                [
                  [poolApy, tvl],
                  [fairPrice, indexPrice],
                  [markPrice, volume24h],
                  // [high24h, low24h],
                  [openInterest, longOiShortOi],
                ],
                'earn-mobile-stats',
              )}
        </div>
        {pairInfo && (
          <div className="syn-mobile-info-drawer-container">
            <div className="syn-mobile-info-drawer-title">{t('common.pairInfo')}</div>
            <div className="syn-mobile-info-drawer-row">
              <dl>
                <dt>{t('common.tradePage.base')}</dt>
                <dd>{pairInfo.displayBaseToken.symbol}</dd>
              </dl>
              <dl>
                <dt>{t('common.tradePage.quote')}</dt>
                <dd>{pairInfo.displayQuoteToken.symbol}</dd>
              </dl>
            </div>
            <div className="syn-mobile-info-drawer-row">
              <dl>
                <dt>{t('common.tradePage.maturity')}</dt>
                <dd>{pairInfo.expiry}</dd>
              </dl>
              <dl>
                <dt>{t('common.tradePage.margin')}</dt>
                <dd>{pairInfo.marginToken.symbol}</dd>
              </dl>
            </div>
            <div className="syn-mobile-info-drawer-row">
              <dl>
                <dt>{t('common.tradePage.imrShort')}</dt>
                <dd>{pairInfo.imrRate.formatPercentage({ colorShader: false })}</dd>
              </dl>
              <dl>
                <dt>{t('common.tradePage.mmrShort')}</dt>
                <dd>{pairInfo.mmrRate.formatPercentage({ colorShader: false })}</dd>
              </dl>
            </div>
            <div className="syn-mobile-info-drawer-row">
              <dl>
                <dt>{t('common.tradePage.tfr')}</dt>
                <dd>
                  {pairInfo.tradingFeeRatio.add(pairInfo.protocolFeeRatio).formatPercentage({ colorShader: false })}
                </dd>
              </dl>
              <dl>
                <dt>{t('common.tradePage.lofr')}</dt>
                <dd>{pairInfo.tradingFeeRatio.formatPercentage({ colorShader: false })}</dd>
              </dl>
            </div>
            <div className="syn-mobile-info-drawer-row">
              <dl>
                <dt>{t('common.tradePage.mTs')}</dt>
                <dd>
                  {pairInfo.minQuoteTradeSize.formatNumberWithTooltip({
                    isShowTBMK: true,
                    suffix: pairInfo.marginToken.symbol,
                  })}
                </dd>
              </dl>
              <dl>
                <dt>{t('common.tradePage.tip')}</dt>
                <dd>
                  {pairInfo.tip.formatNumberWithTooltip({ isShowTBMK: true, suffix: pairInfo.marginToken.symbol })}
                </dd>
              </dl>
            </div>
            <div className="syn-mobile-info-drawer-row last">
              <dl>
                <dt>{t('common.tradePage.oracle')}</dt>
                <dd>
                  {pairInfo?.oracleInfo?.name}
                  {/* <ExternalLinkIcon href={pairInfo?.oracleInfo?.link || ''}>
                    {' '}
                    {pairInfo?.oracleInfo?.name}
                  </ExternalLinkIcon> */}
                </dd>
              </dl>
              <dl>
                <dt>{t('common.tradePage.marginAdd')}</dt>
                <dd>
                  <ExternalLinkIcon href={getEtherscanLink(pairInfo.marginToken.address, 'address')}>
                    {' '}
                    {shortenAddress(pairInfo.marginToken.address)}
                  </ExternalLinkIcon>
                </dd>
              </dl>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default MobileInfoDrawer;

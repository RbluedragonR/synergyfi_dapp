/**
 * @description Component-ChartInfo
 */
import './index.less';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ExternalLink, ExternalLinkIcon } from '@/components/Link';
import TokenSymbol from '@/components/TokenLogo/TokenSymbol';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { useCurrentPairFromUrl, usePairInfo } from '@/features/pair/hook';
import { useChainId, useEtherscanLink } from '@/hooks/web3/useChain';
import { shortenAddress } from '@/utils/address';
import FeeDiscountTag from './FeeDiscountTag';
interface IPropTypes {
  className?: string;
}
const ChartInfo: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const currentPair = useCurrentPairFromUrl(chainId);
  const pairInfo = usePairInfo(currentPair);
  const getEtherscanLink = useEtherscanLink();
  const { t } = useTranslation();

  if (!pairInfo) {
    return <></>;
  }
  return (
    <div className="syn-chart-info">
      <div className="syn-chart-info-header">
        <TokenSymbol logoSize={24} tokenInfo={pairInfo?.displayBaseToken} />
        {/* <ExternalLinkIcon href={getEtherscanLink(pairInfo.marginToken.address, 'address')}>
          {t('common.tradePage.website')}
        </ExternalLinkIcon> */}
      </div>
      <div className="syn-chart-info-content">
        <div className="syn-chart-info-content-row">
          <dl>
            <dt>{t('common.tradePage.base')}</dt>
            <dd>{pairInfo.displayBaseToken.symbol}</dd>
          </dl>
          <dl>
            <dt>{t('common.tradePage.quote')}</dt>
            <dd>{pairInfo.displayQuoteToken.symbol}</dd>
          </dl>
          <dl>
            <dt>{t('common.tradePage.maturity')}</dt>
            <dd>{pairInfo.expiry}</dd>
          </dl>
        </div>
        <div className="syn-chart-info-content-row">
          <dl>
            <dt>{t('common.tradePage.margin')}</dt>
            <dd>{pairInfo.marginToken.symbol}</dd>
          </dl>
          <dl>
            <dt>{t('common.tradePage.imr')}</dt>
            <dd>{pairInfo.imrRate.formatPercentage({ colorShader: false })}</dd>
          </dl>
          <dl>
            <dt>{t('common.tradePage.mmr')}</dt>
            <dd>{pairInfo.mmrRate.formatPercentage({ colorShader: false })}</dd>
          </dl>
        </div>
        <div className="syn-chart-info-content-row">
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
            <dt>{t('common.tradePage.tfr')}</dt>
            <dd>
              <span>
                {pairInfo.tradingFeeRatio.add(pairInfo.protocolFeeRatio).formatPercentage({ colorShader: false })}
              </span>
              <FeeDiscountTag currentPair={currentPair} />
            </dd>
          </dl>
          <dl>
            <dt>{t('common.tradePage.lofr')}</dt>
            <dd>{pairInfo.tradingFeeRatio.formatPercentage({ colorShader: false })}</dd>
          </dl>
        </div>
        <div className="syn-chart-info-content-row">
          <dl>
            <dt>
              {' '}
              <UnderlineToolTip title={t('common.tradePage.tipTooltip')}>{t('common.tradePage.tip')}</UnderlineToolTip>
            </dt>
            <dd>{pairInfo.tip.formatNumberWithTooltip({ isShowTBMK: true, suffix: pairInfo.marginToken.symbol })}</dd>
          </dl>
          <dl>
            <dt>{t('common.tradePage.oracle')}</dt>
            <dd>
              {currentPair?.rootInstrument?.dexV2PairAddr ? (
                <ExternalLinkIcon href={getEtherscanLink(currentPair?.rootInstrument?.dexV2PairAddr, 'address') || ''}>
                  {pairInfo.oracleInfo.name}
                </ExternalLinkIcon>
              ) : (
                pairInfo.oracleInfo.name
              )}
            </dd>
          </dl>
          {currentPair?.rootInstrument?.quoteToken?.address && (
            <dl>
              <dt>{t('common.tradePage.address')}</dt>
              <dd>
                <ExternalLink href={getEtherscanLink(currentPair?.rootInstrument?.quoteToken?.address, 'address')}>
                  {' '}
                  {shortenAddress(currentPair?.rootInstrument?.quoteToken?.address || '')}
                </ExternalLink>
              </dd>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartInfo;

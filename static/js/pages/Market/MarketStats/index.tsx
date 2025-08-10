/**
 * @description Component-MarketStats
 */
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import './index.less';

import { useMarginSearch, useMarketSummary } from '@/features/market/hooks';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const MarketStats: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const {
    marginSearchProps: { selectedChainIds },
  } = useMarginSearch();
  // const status = useMarketListStatus();

  const summary = useMarketSummary(selectedChainIds);
  return (
    <div className="syn-market-stats">
      <div className={'tab-bar__right'}>
        <dl>
          <dt>{t('common.24HTV')}</dt>
          <dd>
            <EmptyDataWrap isLoading={!summary?.totalVolume24Usd}>
              {summary?.totalVolume24Usd.formatNumberWithTooltip({
                isShowTBMK: true,
                prefix: '$',
              })}
            </EmptyDataWrap>
          </dd>
        </dl>
        <dl>
          <dt>{t('common.effectLiq')}</dt>
          <dd>
            <EmptyDataWrap isLoading={!summary?.totalOpenInterestsUsd}>
              {summary?.totalEffectLiqTvlUsd.formatNumberWithTooltip({
                isShowTBMK: true,
                prefix: '$',
              })}
            </EmptyDataWrap>
          </dd>
        </dl>
        <dl>
          <dt>{t('common.topTVL')}</dt>
          <dd>
            <EmptyDataWrap isLoading={!summary?.totalOpenInterestsUsd}>
              {summary?.totalTvlUsd.formatNumberWithTooltip({
                isShowTBMK: true,
                prefix: '$',
              })}
            </EmptyDataWrap>
          </dd>
        </dl>
      </div>
    </div>
  );
};

export default MarketStats;

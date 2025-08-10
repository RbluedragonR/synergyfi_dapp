/**
 * @description Component-MarketTrends
 */
import { useFetchMarketTrendList } from '@/features/market/query';
import './index.less';

import { Skeleton } from '@/components/Skeleton';
import { THEME_ENUM } from '@/constants';
import { useTheme } from '@/features/global/hooks';
import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const MarketTrends: FC<IPropTypes> = function ({}) {
  const { data: trendList, isFetched } = useFetchMarketTrendList();
  const { dataTheme } = useTheme();

  return (
    <div className="syn-market-trends">
      <h1 className="syn-market-trends-title">{`What's New`}</h1>
      <div className="syn-market-trends-content">
        {!isFetched && (
          <div className="syn-market-trends-skeleton-card-list">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="syn-market-trends-skeleton-card" key={index}>
                <Skeleton loading={true} title active={true} paragraph={false} style={{ width: '40%' }} />
                <Skeleton loading={true} title active={true} paragraph={false} style={{ width: '100%' }} />
                <Skeleton loading={true} title active={true} paragraph={false} style={{ width: '60%' }} />
              </div>
            ))}
          </div>
        )}
        {isFetched &&
          trendList &&
          trendList?.map((trend) => (
            <a
              key={trend.link}
              href={trend.link}
              target={trend.openNewTab ? '_blank' : '_self'}
              rel="noreferrer"
              className="syn-market-trend-card">
              <img src={dataTheme === THEME_ENUM.DARK ? trend.darkBg : trend.lightBg} alt="trend bg" />
            </a>
          ))}
      </div>
    </div>
  );
};

export default MarketTrends;

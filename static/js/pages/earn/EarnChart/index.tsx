/**
 * @description Component-CoinPriceChart
 */
import './index.less';

import classNames from 'classnames';
import React, { FC } from 'react';

// import { useTranslation } from 'react-i18next';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import { CHART_TYPE } from '@/constants/trade';
import { useCurrentNewPairFromUrl, useCurrentPairFromUrl } from '@/features/pair/hook';
import { useChainId } from '@/hooks/web3/useChain';

import { useMockDevTool } from '@/components/Mock';
import { useIsFetchedPairInfo } from '@/features/futures/hooks';
import NewPairBanner from './NewPairBanner';
// import CoinPriceDepthChart from './CoinPriceDepthChart';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const EarnChart: FC<IPropTypes> = function ({ className = '' }) {
  // const { t } = useTranslation();
  const chartType = CHART_TYPE.VOLUME;
  const chainId = useChainId();
  const currentPair = useCurrentPairFromUrl(chainId);
  const newPair = useCurrentNewPairFromUrl(chainId);
  const isFetched = useIsFetchedPairInfo(chainId, currentPair?.instrumentAddr, currentPair?.expiry, true);
  //const { t } = useTranslation();
  // const tabList = useMemo(() => {
  //   const tabs = [{ label: t('common.earn.vol'), vale: CHART_TYPE.VOLUME, key: CHART_TYPE.VOLUME }];
  //   if (currentPair) {
  //     tabs.push({ label: t('common.earn.info'), vale: CHART_TYPE.INFO, key: CHART_TYPE.INFO });
  //   }
  //   return tabs;
  // }, [currentPair, t]);
  const { isMockSkeleton } = useMockDevTool();
  return (
    <Card className={classNames(className)}>
      <div className="syn-earn-charts">
        <div className="syn-earn-charts-header">
          <div className="syn-earn-charts-header-left">
            {/* <Tabs
              activeKey={chartType}
              onChange={(key) => fetchingStatus === FETCHING_STATUS.DONE && setChartType(key as CHART_TYPE)}
              items={tabList}
            /> */}
          </div>
        </div>
        {chartType === CHART_TYPE.VOLUME && (
          <div className="syn-earn-chart">
            {(isMockSkeleton || !isFetched) && <Loading size="large" spinning={true} />}
            <>{isFetched && !currentPair && newPair && <NewPairBanner pair={newPair} />}</>
          </div>
        )}
        {/* {chartType === CHART_TYPE.INFO && currentPair && <ChartInfo />} */}
      </div>
    </Card>
  );
};

export default EarnChart;

/**
 * @description Component-CoinPriceChart
 */
import './index.less';

import { FundingChartInterval, KlineInterval } from '@synfutures/sdks-perp-datasource';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@/components/Card';
import { FETCHING_STATUS } from '@/constants';
import { CHART_TYPE, DEFAULT_STEP_RATIO } from '@/constants/trade';
import { getPairKlineData } from '@/features/chart/actions';
import { useKlineChartData, useKlineChartFetchingStatus } from '@/features/chart/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { setFundingChartDuration, setPairChartDuration, setPairStepRatio } from '@/features/trade/actions';
import { useChartDuration, useFundingChartDuration, useStepRatio } from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';

import ChartInfo from './ChartInfo';
import FundingChart from './FundingChart';
// import CoinPriceDetail from './CoinPriceDetail';
import SynCircleTabs from '@/components/Tabs/SynCircleTabs';
import SynTitleTabs from '@/components/Tabs/SynTitleTabs';
import { useBackendChainConfig } from '@/features/config/hook';
import KLineChart from './KLineChart';
import OrderBook from './OrderBook';
import PriceDepthChart from './PriceDepthChart';
import StepRatioSelector from './StepRatioSelector';
// import CoinPriceDepthChart from './CoinPriceDepthChart';
// import PriceDepthChart from './PriceDepthChart';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const CoinPriceChart: FC<IPropTypes> = function ({ className = '' }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const dappConfig = useBackendChainConfig(chainId);
  const [tab, setTab] = useState(CHART_TYPE.PRICE);
  const chartDuration = useChartDuration(chainId);
  const fundingChartDuration = useFundingChartDuration(chainId);
  const setChartDuration = useCallback(
    (duration: KlineInterval) => {
      chainId && dispatch(setPairChartDuration({ chainId, chartDuration: duration }));
    },
    [chainId, dispatch],
  );
  const setFundingChartDurationCB = useCallback(
    (duration: FundingChartInterval) => {
      chainId && dispatch(setFundingChartDuration({ chainId, chartDuration: duration }));
    },
    [chainId, dispatch],
  );
  const stepRatio = useStepRatio(chainId);
  const setStepRatio = useCallback(
    (stepRatio: number) => {
      chainId && dispatch(setPairStepRatio({ chainId, stepRatio }));
    },
    [chainId, dispatch],
  );

  const currentPair = useCurrentPairFromUrl(chainId);
  const kLineDataList = useKlineChartData(chainId, currentPair, chartDuration);
  const fetchingStatus = useKlineChartFetchingStatus(chainId, currentPair?.id, chartDuration);
  const fetchingStatusForHour = useKlineChartFetchingStatus(chainId, currentPair?.id, KlineInterval.HOUR);
  const kLineDataListForHour = useKlineChartData(chainId, currentPair, KlineInterval.HOUR);
  const tabList = useMemo(
    () =>
      !kLineDataList?.length && fetchingStatus === FETCHING_STATUS.DONE
        ? [{ label: t('common.tradePage.info'), vale: CHART_TYPE.INFO, key: CHART_TYPE.INFO }]
        : [
            { label: t('common.tradePage.price'), vale: CHART_TYPE.PRICE, key: CHART_TYPE.PRICE },
            { label: t('common.tradePage.depth'), vale: CHART_TYPE.DEPTH, key: CHART_TYPE.DEPTH },
            { label: t('common.tradePage.funding'), vale: CHART_TYPE.FUNDING, key: CHART_TYPE.FUNDING },
            { label: t('common.tradePage.info'), vale: CHART_TYPE.INFO, key: CHART_TYPE.INFO },
          ],
    [fetchingStatus, kLineDataList?.length, t],
  );
  useEffect(() => {
    const defaultDuration =
      (dappConfig?.trade.fundingChartInterval.default as FundingChartInterval) || FundingChartInterval.HOUR;
    setFundingChartDurationCB(defaultDuration);
    return () => {
      setFundingChartDurationCB(defaultDuration);
    };
  }, [dappConfig?.trade.fundingChartInterval.default, setFundingChartDurationCB]);
  useEffect(() => {
    const defaultDuration = (dappConfig?.trade.klineInterval.default as KlineInterval) || KlineInterval.HOUR;
    setChartDuration(defaultDuration);
    return () => {
      const defaultDuration = (dappConfig?.trade.klineInterval.default as KlineInterval) || KlineInterval.HOUR;
      setChartDuration(defaultDuration);
    };
  }, [chainId, dappConfig?.trade.klineInterval.default, setChartDuration, currentPair]);

  useEffect(() => {
    return () => {
      setStepRatio(DEFAULT_STEP_RATIO);
    };
  }, [chainId, setStepRatio]);

  useEffect(() => {
    if (currentPair && chainId) {
      try {
        dispatch(
          getPairKlineData({
            chainId,
            instrumentAddr: currentPair.rootInstrument.id,
            expiry: currentPair.expiry,
            chartDuration,
            minTradeValue: currentPair?.rootInstrument?.minTradeValue,
          }),
        );
      } catch (e) {
        console.log('🚀 ~ file: index.tsx:122 ~ useEffect ~ e:', e);
      }
    }
  }, [currentPair?.id, chainId, chartDuration]);

  useEffect(() => {
    setTab(CHART_TYPE.PRICE);
  }, [chainId, currentPair?.id]);

  useEffect(() => {
    // set tab to info when no data
    if (fetchingStatusForHour === FETCHING_STATUS.DONE && !kLineDataListForHour?.length && tab !== CHART_TYPE.INFO) {
      setTab(CHART_TYPE.INFO);
    }
  }, [fetchingStatusForHour, kLineDataListForHour, tab]);

  return (
    <Card className={classNames(className, 'syn-trade-charts')}>
      <>
        <div className="syn-trade-charts-content">
          <div className="syn-trade-charts-content-price">
            <>
              <div className="syn-trade-charts-content-title">
                <SynTitleTabs
                  wrapStyle={{ height: 24 }}
                  tabsStyle={{ gap: 24 }}
                  varient="solid"
                  activeKey={tab}
                  onClick={(key) => fetchingStatus === FETCHING_STATUS.DONE && setTab(key as CHART_TYPE)}
                  items={tabList}
                />
                {tab === CHART_TYPE.PRICE && (
                  <SynCircleTabs
                    varient="solid"
                    className="syn-coin-price-right-tabs-PRICE"
                    items={
                      dappConfig?.trade.klineInterval.list.map((interval: string) => {
                        return {
                          label: t(`common.tradePage.${interval}`),
                          key: interval,
                        };
                      }) || []
                    }
                    activeKey={chartDuration}
                    onClick={(key) => {
                      setChartDuration(key as KlineInterval);
                    }}
                  />
                )}
                {tab === CHART_TYPE.FUNDING && (
                  <SynCircleTabs
                    varient="solid"
                    className="syn-coin-price-right-tabs-FUNDING"
                    items={
                      dappConfig?.trade.fundingChartInterval.list.map((interval: string) => {
                        return {
                          label: t(`common.tradePage.${interval}`),
                          key: interval,
                        };
                      }) || []
                    }
                    activeKey={fundingChartDuration}
                    onClick={(key) => {
                      setFundingChartDurationCB(key as FundingChartInterval);
                    }}
                  />
                )}
              </div>

              {/* {fetchingStatus === FETCHING_STATUS.DONE && !kLineDataList?.length && tab !== CHART_TYPE.INFO && (
                <div className="syn-trade-charts-empty">{t('common.nodata')}</div>
              )} */}

              {tab === CHART_TYPE.PRICE && (
                <KLineChart
                  chartDuration={chartDuration}
                  fetchingStatus={fetchingStatus}
                  kLineDataList={kLineDataList}
                  pair={currentPair}
                  className="syn-trade-charts-body"
                />
              )}
              {tab === CHART_TYPE.FUNDING && (
                <FundingChart chainId={chainId} currentPair={currentPair} chartDuration={fundingChartDuration} />
              )}
              {tab === CHART_TYPE.DEPTH && <PriceDepthChart pair={currentPair} />}

              {tab === CHART_TYPE.INFO && <ChartInfo />}
            </>
          </div>
          <div className="syn-trade-charts-content-depth-wrapper">
            <div className="syn-trade-charts-content-depth">
              <div className="syn-trade-charts-content-title">
                {t('common.orderBook.orderB')}
                <StepRatioSelector
                  onChange={setStepRatio}
                  imr={currentPair?.rootInstrument.metaFutures.setting.initialMarginRatio}
                />
              </div>
              <OrderBook stepRatio={stepRatio} pair={currentPair} chainId={chainId} />
            </div>
          </div>
        </div>
      </>
    </Card>
  );
};

export default CoinPriceChart;

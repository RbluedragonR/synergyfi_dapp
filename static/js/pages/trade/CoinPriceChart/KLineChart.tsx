/**
 * @description Component-PriceChart
 */
import './index.less';

import { KlineData, KlineInterval } from '@synfutures/sdks-perp-datasource';
import React, { FC, useCallback, useEffect } from 'react';

import { FETCHING_STATUS } from '@/constants';
import { POLLING_GRAPH } from '@/constants/polling';
import { WrappedPair } from '@/entities/WrappedPair';
import { getPairKlineData } from '@/features/chart/actions';
import { useKlineChartNotFirstTimeLoad } from '@/features/chart/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { pollingFunc } from '@/utils';

// import TradingViewWidget from './TradingView/TradingViewWidget';
import TradingViewLightCharts from './TradingView';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  chartDuration: KlineInterval;
  pair: WrappedPair | undefined;
  kLineDataList: KlineData[] | undefined;
  fetchingStatus: FETCHING_STATUS;
}

let polling_chart: NodeJS.Timer | null = null;

const KLineChart: FC<IPropTypes> = function ({ className, chartDuration, pair, kLineDataList, fetchingStatus }) {
  const chainId = useChainId();
  const firstTimeLoad = useKlineChartNotFirstTimeLoad(chainId, pair?.id, chartDuration);
  const dispatch = useAppDispatch();
  const onFetchData = useCallback(
    (timeEnd: number) => {
      chainId &&
        pair &&
        dispatch(
          getPairKlineData({
            chainId,
            instrumentAddr: pair.rootInstrument.id,
            expiry: pair.expiry,
            chartDuration,
            timeEnd: timeEnd,
            minTradeValue: pair?.rootInstrument?.minTradeValue,
          }),
        );
    },
    [chainId, chartDuration, dispatch, pair],
  );
  useEffect(() => {
    if (polling_chart) clearInterval(polling_chart);
    polling_chart = pollingFunc(() => {
      onFetchData(Math.floor(Date.now() / 1000));
    }, POLLING_GRAPH);
    return () => {
      if (polling_chart) clearInterval(polling_chart);
    };
  }, [firstTimeLoad, onFetchData]);
  return (
    <div className={className}>
      {/* <TradingViewWidget chartDuration={chartDuration} symbol={symbol}></TradingViewWidget> */}
      <TradingViewLightCharts
        fetchingStatus={fetchingStatus}
        fairPriceBN={pair?.wrapAttribute('fairPrice')}
        instrumentAddr={pair?.rootInstrument.id}
        expiry={pair?.expiry}
        baseToken={pair?.rootInstrument.baseToken}
        chartDuration={chartDuration}
        firstTimeLoad={firstTimeLoad}
        pairId={pair?.id}
        isStablePair={pair?.rootInstrument.isStablePair}
        kLineDataList={kLineDataList}
        onFetchData={onFetchData}
      />
    </div>
  );
};

export default KLineChart;

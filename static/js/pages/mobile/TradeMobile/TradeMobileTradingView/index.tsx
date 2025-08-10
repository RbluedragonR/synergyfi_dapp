/**
 * @description Component-TradeMobileTradingView
 */
import './index.less';

import { KlineInterval } from '@synfutures/sdks-perp-datasource';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FETCHING_STATUS } from '@/constants';
import { CHAIN_ID } from '@/constants/chain';
import { getPairKlineData } from '@/features/chart/actions';
import { useKlineChartData, useKlineChartFetchingStatus } from '@/features/chart/hooks';
import { useBackendChainConfig } from '@/features/config/hook';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import KLineChart from '@/pages/trade/CoinPriceChart/KLineChart';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradeMobileTradingView: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const dappConfig = useBackendChainConfig(chainId);
  const [chartDuration, setChartDuration] = useState<KlineInterval>(
    (dappConfig?.trade.klineInterval.default as KlineInterval) || KlineInterval.HOUR,
  );
  const currentPair = useCurrentPairFromUrl(chainId);
  const kLineDataList = useKlineChartData(chainId, currentPair, chartDuration);
  const fetchingStatus = useKlineChartFetchingStatus(chainId, currentPair?.id, chartDuration);
  useEffect(() => {
    if (chainId === CHAIN_ID.LINEA) {
      setChartDuration(KlineInterval.DAY);
    }
    if (chainId === CHAIN_ID.GOERLI) {
      setChartDuration(KlineInterval.HOUR);
    }
  }, [chainId]);
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
        console.log('🚀 ~ file: index.tsx:57 ~ useEffect ~ e:', e);
      }
    }
    // only these three
  }, [currentPair?.id, chainId, chartDuration]);
  return (
    <div className="syn-trade-mobile-trading-view">
      {fetchingStatus === FETCHING_STATUS.DONE && !kLineDataList?.length && (
        <div className="syn-trade-mobile-trading-view-empty">{t('common.nodata')}</div>
      )}
      {!(fetchingStatus === FETCHING_STATUS.DONE && !kLineDataList?.length) && (
        <>
          <div className="syn-trade-mobile-trading-view-content">
            <div className="syn-trade-mobile-trading-view-content-title">{t('common.tradePage.price')}</div>
            <div className="syn-trade-mobile-trading-view-content-price-right">
              {dappConfig?.trade.klineInterval.list.map((interval: string) => {
                return (
                  <div
                    key={interval}
                    onClick={() => setChartDuration(interval as KlineInterval)}
                    className={`syn-trade-mobile-trading-view-content-price-right-item ${
                      interval === chartDuration ? 'active' : ''
                    }`}>
                    {t(`common.tradePage.${interval}`)}
                  </div>
                );
              })}
            </div>
          </div>
          <KLineChart
            chartDuration={chartDuration}
            pair={currentPair}
            className="syn-trade-mobile-trading-view-body"
            kLineDataList={kLineDataList}
            fetchingStatus={fetchingStatus}
          />
        </>
      )}
    </div>
  );
};

export default TradeMobileTradingView;

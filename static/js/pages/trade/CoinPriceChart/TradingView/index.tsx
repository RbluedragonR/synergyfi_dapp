/**
 * @description Component-TradingViewLightCharts
 */
import './index.less';

import { KlineData, KlineInterval } from '@synfutures/sdks-perp-datasource';
import { useDebounceEffect, useDebounceFn } from 'ahooks';
// import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import {
  CandlestickSeries,
  ChartOptions,
  ColorType,
  CrosshairMode,
  DeepPartial,
  HistogramSeries,
  IChartApi,
  // IPriceLine,
  ISeriesApi,
  LogicalRange,
  MismatchDirection,
  SingleValueData,
  TickMarkType,
  // ChartOptions,
  // DeepPartial,
  // TickMarkType,
  UTCTimestamp,
  createChart,
} from 'lightweight-charts';
import _ from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isMobile as isMobileDevice } from 'react-device-detect';
import { useTranslation } from 'react-i18next';

import Loading from '@/components/Loading';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { FETCHING_STATUS, THEME_ENUM } from '@/constants';
import { SIGNIFICANT_DIGITS } from '@/constants/global';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useTheme } from '@/features/global/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { TokenInfo } from '@/types/token';
import { formatDate, getKlineTimeDuration } from '@/utils/timeUtils';
import { getPairId } from '@/utils/transform/transformId';

import { useMockDevTool } from '@/components/Mock';

const needRequestData: {
  [pairId: string]: {
    [chartDuration: string]: number;
  };
} = {};

interface IPropTypes {
  fetchingStatus: FETCHING_STATUS;
  children?: React.ReactNode;
  className?: string;
  kLineDataList?: KlineData[];
  chartDuration: KlineInterval;
  fairPriceBN: WrappedBigNumber | undefined;
  baseToken: TokenInfo | undefined;
  instrumentAddr: string | undefined;
  expiry: number | undefined;
  firstTimeLoad: boolean;
  pairId: string | undefined;
  isStablePair: boolean | undefined;
  onFetchData: (firstTime: number) => void;
}

const RECENT_TICKS_COUNT = 10;

const green = 'rgba(20, 184, 75, 0.6)';
const red = 'rgba(255, 102, 102, 0.6)';
const TradingViewLightCharts: FC<IPropTypes> = function ({
  kLineDataList,
  chartDuration,
  fetchingStatus,
  fairPriceBN,
  baseToken,
  instrumentAddr,
  expiry,
  firstTimeLoad,
  isStablePair,
  onFetchData,
  pairId,
}) {
  const { t } = useTranslation();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { dataTheme } = useTheme();
  const chartRef = useRef<IChartApi | null>(null);
  const hideVolume = useMemo(() => process.env.REACT_APP_AWS_ENV === 'prod', []);
  const chartKLineRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const chartVolumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  // const chartIndexPriceLineRef = useRef<IPriceLine | undefined>(undefined);
  const [hoverKLineData, setHoverKLineData] = useState<KlineData | null>(null);
  const chainId = useChainId();
  const { deviceType, isMobile } = useMediaQueryDevice();
  const klineData = useMemo(() => {
    if (kLineDataList?.length && fairPriceBN && fairPriceBN.gt(0)) {
      const lastTick = kLineDataList[kLineDataList.length - 1];
      const num = fairPriceBN.toNumber();
      lastTick.close = num;
      lastTick.high = Math.max(lastTick.high, num);
      lastTick.low = Math.min(lastTick.low, num);
    }
    return kLineDataList;
    // must use stringValue
  }, [fairPriceBN?.stringValue, kLineDataList]);

  const updateChartOptions = useCallback(() => {
    if (!chartContainerRef.current) return undefined;

    const crossColor = dataTheme === THEME_ENUM.LIGHT ? '#C3E7E7' : '#3D4F5C';

    const chartOptions: DeepPartial<ChartOptions> = {
      handleScale: {
        axisPressedMouseMove: true,
      },
      layout: {
        textColor: dataTheme === THEME_ENUM.LIGHT ? '#333' : 'rgba(140, 191, 217, 0.8)',
        background: { type: ColorType.Solid, color: 'transparent' },
        attributionLogo: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: {
        vertLines: {
          color: 'transparent',
        },
        horzLines: {
          color: 'transparent',
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: crossColor,
          labelBackgroundColor: crossColor,
        },
        horzLine: {
          color: crossColor,
          labelBackgroundColor: crossColor,
        },
      },
      // watermark: {
      //   fontSize: 98,
      //   color: 'rgba(41, 181, 188, 0.07)',
      //   visible: true,
      // },
      rightPriceScale: {
        borderColor: 'transparent',
        textColor: dataTheme === THEME_ENUM.LIGHT ? '#333' : 'rgba(140, 191, 217, 0.8)',
      },

      timeScale: {
        borderColor: dataTheme === THEME_ENUM.LIGHT ? '#C3E7E7' : 'rgba(17, 120, 178, 0.15)',
        timeVisible: true,
        // secondVisible: false,
        // borderVisible:false,
        tickMarkFormatter: (timePoint: number, tickMarkType: TickMarkType) => {
          switch (tickMarkType) {
            case TickMarkType.Year:
              return formatDate(timePoint * 1000, 'YYYY-MM-DD');
              break;

            case TickMarkType.Month:
            case TickMarkType.DayOfMonth:
              return formatDate(timePoint * 1000, 'MM-DD');
              break;

            case TickMarkType.Time:
            case TickMarkType.TimeWithSeconds:
              return formatDate(timePoint * 1000, 'HH:mm');
              break;
          }

          return formatDate(timePoint * 1000, 'HH:mm');
        },
      },
      localization: {
        locale: navigator.language,
        dateFormat: 'YYYY-MM-DD',
        timeFormatter: (time: number) => {
          const formater =
            chartDuration === KlineInterval.DAY || chartDuration === KlineInterval.WEEK
              ? 'YYYY-MM-DD'
              : 'YYYY-MM-DD HH:mm';
          return formatDate(time * 1000, formater);
        },
        priceFormatter: (price: number) => {
          const priceS = WrappedBigNumber.from(price).formatDisplayNumber({
            type: 'price',
            significantDigits: isStablePair ? SIGNIFICANT_DIGITS + 1 : SIGNIFICANT_DIGITS,
            // roundingMode: isStablePair ? BigNumber.ROUND_HALF_UP : undefined,
          });
          return priceS;
        },
      },
    };
    return chartOptions;
  }, [chartDuration, dataTheme, isStablePair]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) return;
    const chartOptions = updateChartOptions();
    const chart = createChart(chartContainerRef.current || '', {
      ...chartOptions,
      autoSize: false,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#14b84b',
      downColor: '#ff6666',
      borderVisible: false,
      wickUpColor: '#14b84b',
      wickDownColor: '#ff6666',
      priceFormat: {
        minMove: 0.00000001,
      },
      // priceLineStyle: 0,
    });
    // candlestickSeries.setData(priceData);
    candlestickSeries.priceScale().applyOptions({
      autoScale: true,
      scaleMargins: {
        top: 0.15, // highest point of the series will be 70% away from the top
        bottom: 0.1,
      },
    });
    chartKLineRef.current = candlestickSeries;
    if (!hideVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        // color: `rgba(38, 166, 154, 0.3)`,
        priceFormat: {
          type: 'volume',
        },
        priceLineVisible: false,
        lastValueVisible: false,
        priceScaleId: '', // set as an overlay by setting a blank priceScaleId
        // set the positioning of the volume series
        //   scaleMargins: {
        //     top: 0.7, // highest point of the series will be 70% away from the top
        //     bottom: 0,
        //   },
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.9, // highest point of the series will be 70% away from the top
          bottom: 0,
        },
        autoScale: true,
      });
      chartVolumeRef.current = volumeSeries;
    }

    // chart.timeScale().fitContent();
    chartRef.current = chart;

    // chart.timeScale().applyOptions({ fixLeftEdge: true });

    //used to resize observer
    const resizeO = new ResizeObserver(() => {
      if (chartContainerRef.current)
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
    });

    resizeO.observe(chartContainerRef.current);

    return () => {
      resizeO.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chartContainerRef.current) {
      const background = document.createElement('div');
      background.id = 'syn-tv-watermark';
      // place below the chart
      // background.style.zIndex = '1';
      background.classList.add('syn-tv-charts-watermark');
      // background.style.position = 'absolute';
      // set size and position to match container
      // background.style.inset = '0px';
      // background.style.backgroundImage = watemarkBase64;
      // background.style.backgroundRepeat = 'no-repeat';
      // background.style.backgroundPosition = 'center';
      // background.style.opacity = '0.6';
      if (isMobileDevice) {
        background.classList.add('mobile');
        // background.style.width = '60vw';
        // background.style.backgroundSize = 'contain';
        // background.style.left = '10vw';
      }
      chartContainerRef.current.appendChild(background);
    }
  }, []);

  // watch chart duration change
  useEffect(() => {
    if (chartRef.current) {
      const chartOptions = updateChartOptions();
      if (chartOptions) chartRef.current.applyOptions(chartOptions);
    }
  }, [updateChartOptions]);

  useEffect(() => {
    if (fetchingStatus !== FETCHING_STATUS.DONE) {
      if (firstTimeLoad) {
        chartKLineRef.current?.setData([]);
        chartVolumeRef.current?.setData([]);
        setHoverKLineData(null);
      }
    } else if (klineData?.length) {
      // update kline data
      const data = klineData.map((item) => ({
        time: item.timestamp as UTCTimestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      // update volue data
      const volumeData = hideVolume
        ? []
        : klineData.map((item) => ({
            time: item.timestamp as UTCTimestamp,
            value: item.baseVolume,
            color: item.open > item.close ? red : green,
          }));

      // if not first time load, update the last tick with the new data
      if (!firstTimeLoad) {
        const lastTick = chartKLineRef.current?.dataByIndex(Infinity, MismatchDirection.NearestLeft);
        if (lastTick) {
          const lastTickData = data.find((item) => item.time === lastTick.time);
          if (lastTickData) {
            chartKLineRef.current?.update({
              time: lastTickData.time as UTCTimestamp,
              open: lastTickData.open,
              high: lastTickData.high,
              low: lastTickData.low,
              close: lastTickData.close,
            });
            if (!hideVolume) {
              const lastVolumeData = volumeData.find((item) => item.time === lastTickData.time);
              if (lastVolumeData) {
                chartVolumeRef.current?.update({
                  time: lastVolumeData.time as UTCTimestamp,
                  value: lastVolumeData.value,
                  color: lastVolumeData.color,
                });
              }
            }
          }
        }
      }

      chartKLineRef.current?.setData(data);
      if (!hideVolume) {
        chartVolumeRef.current?.setData(volumeData);
      }
      // chartRef.current?.timeScale().applyOptions({ fixLeftEdge: true });

      chartRef.current &&
        chartRef.current?.timeScale().scrollPosition() >= 0 &&
        chartRef.current?.timeScale().scrollToPosition(5, false);

      // chartRef.current?.timeScale().fitContent();

      //set hover data
      if (data.length) {
        const lastTick = data[data.length - 1];
        const hoverData = {
          ...(lastTick as unknown as KlineData),
          timestamp: Number(lastTick.time),
        };
        if (!hideVolume && volumeData.length) {
          const dataVolume = volumeData[volumeData.length - 1];
          hoverData.baseVolume = dataVolume?.value;
        }

        if (firstTimeLoad) {
          setHoverKLineData(hoverData);
        }
      }
    }
  }, [klineData, fetchingStatus, firstTimeLoad, hideVolume]);

  useEffect(() => {
    setTimeout(() => {
      pairId && chartRef.current && chartRef.current?.timeScale().scrollToPosition(5, false);
    }, 500);
  }, [chartDuration, pairId]);

  useDebounceEffect(
    () => {
      if (fetchingStatus === FETCHING_STATUS.DONE && klineData?.length) {
        const recentTicks = klineData.slice(-RECENT_TICKS_COUNT);

        if (fairPriceBN) {
          const num = fairPriceBN.toNumber();
          if (num) {
            recentTicks.forEach((tick) => {
              // Only update the latest tick with fair price
              if (tick === recentTicks[recentTicks.length - 1]) {
                tick.close = Number(num);
                tick.high = Math.max(tick.high, Number(num));
                tick.low = Math.min(tick.low, Number(num));
              }

              chartKLineRef.current?.update(
                {
                  time: tick.timestamp as UTCTimestamp,
                  open: tick.open,
                  high: tick.high,
                  low: tick.low,
                  close: tick.close,
                },
                true,
              );
            });
          }
        }
      }
    },
    [klineData, fetchingStatus, fairPriceBN],
    { wait: 200 },
  );

  useEffect(() => {
    if (chartRef?.current) {
      // watch crosshair move
      chartRef.current.subscribeCrosshairMove((param) => {
        if (chartKLineRef.current) {
          const data = param.seriesData.get(chartKLineRef.current);
          if (!data) {
            return;
          }
          const newData = {
            ...(data as unknown as KlineData),
            timestamp: Number(data.time as string),
          };
          if (!hideVolume && chartVolumeRef.current) {
            const dataVolume = param.seriesData.get(chartVolumeRef.current) as SingleValueData;
            newData.baseVolume = dataVolume?.value;
          }
          setHoverKLineData(newData);
        }
      });
    }
  }, [hideVolume]);

  const { run: fetchHistoryData } = useDebounceFn(
    async (firstTime: number) => {
      onFetchData(firstTime);
    },
    { wait: 500 },
  );

  const onVisibleLogicalRangeChanged = useCallback(
    (newVisibleLogicalRange: LogicalRange | null) => {
      if (chartKLineRef.current && newVisibleLogicalRange) {
        const barsInfo = chartKLineRef.current.barsInLogicalRange(newVisibleLogicalRange);
        // if there less than 50 bars to the left of the visible area
        if (barsInfo !== null && barsInfo.barsBefore) {
          if (instrumentAddr && expiry && barsInfo.barsBefore > 0 && barsInfo.barsBefore <= 50) {
            const firstTime = Math.floor(
              Number(barsInfo.from) - getKlineTimeDuration(chartDuration) * barsInfo.barsBefore,
            );
            const timeRequested = _.get(needRequestData, [getPairId(instrumentAddr, expiry), chartDuration]);
            if (!timeRequested || firstTime < timeRequested) {
              // try to load additional historical data and prepend it to the series data
              _.set(needRequestData, [getPairId(instrumentAddr, expiry), chartDuration], firstTime);

              fetchHistoryData(firstTime);
            }
          }
        }
      }
    },
    [chartDuration, expiry, fetchHistoryData, instrumentAddr],
  );

  useEffect(() => {
    if (chartRef?.current && chainId && instrumentAddr && expiry) {
      // subscribe to visible range change event
      chartRef.current.timeScale().subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged);
    }
  }, [chainId, expiry, instrumentAddr, onVisibleLogicalRangeChanged]);

  // useDebounceEffect(
  //   () => {
  //     if (!pair?.rootInstrument?.spotPrice) {
  //       return;
  //     }
  //     const indexPriceLine = {
  //       price: pair?.rootInstrument?.wrapAttribute('spotPrice').toNumber(),
  //       color: '#29b5bc',
  //       // lineWidth: lineWidth,
  //       lineStyle: 2, // LineStyle.Dashed
  //       axisLabelVisible: true,
  //       title: 'Index Price',
  //     };
  //     if (!chartIndexPriceLineRef.current) {
  //       chartIndexPriceLineRef.current = chartKLineRef.current?.createPriceLine(indexPriceLine);
  //     } else {
  //       chartIndexPriceLineRef.current.applyOptions(indexPriceLine);
  //     }
  //   },
  //   [pair?.rootInstrument?.spotPrice],
  //   { wait: 200 },
  // );

  const durationStr = useMemo(() => {
    return t(`common.tradePage.${chartDuration}`);
  }, [chartDuration, t]);
  const { isMockSkeleton } = useMockDevTool();
  const isloading = fetchingStatus !== FETCHING_STATUS.DONE || isMockSkeleton;
  return (
    <div className={classNames('syn-tv-charts', deviceType)}>
      {isloading && <Loading size="large" spinning={true}></Loading>}
      <div
        ref={chartContainerRef}
        id="tv_container"
        style={{
          height: `100%`,
          width: `100%`,
          visibility: !isloading ? 'visible' : 'hidden',
        }}
      />

      <div className="syn-tv-charts-legend">
        <div className="syn-tv-charts-legend-info">
          {hoverKLineData && !isMobile && (
            <>
              <div>
                {formatDate(
                  hoverKLineData?.timestamp * 1000,
                  [KlineInterval.DAY, KlineInterval.WEEK].includes(chartDuration) ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm',
                )}
              </div>
              <div className="syn-tv-charts-legend-info-duration"> • {durationStr}</div>
            </>
          )}

          {hoverKLineData && (
            <div className="syn-tv-charts-legend-info-ohlc">
              <span>
                O{' '}
                <span
                  className={
                    hoverKLineData.open > hoverKLineData.close
                      ? 'syn-tv-charts-legend-info-ohlc-red'
                      : 'syn-tv-charts-legend-info-ohlc-green'
                  }>
                  {WrappedBigNumber.from(hoverKLineData.open).formatPriceNumberWithTooltip({
                    isStablePair: isStablePair,
                    // roundingMode: isStablePair ? BigNumber.ROUND_HALF_UP : undefined,
                  })}
                </span>
              </span>
              <span>
                H{' '}
                <span
                  className={
                    hoverKLineData.open > hoverKLineData.close
                      ? 'syn-tv-charts-legend-info-ohlc-red'
                      : 'syn-tv-charts-legend-info-ohlc-green'
                  }>
                  {WrappedBigNumber.from(hoverKLineData.high).formatPriceNumberWithTooltip({
                    isStablePair: isStablePair,
                    // roundingMode: isStablePair ? BigNumber.ROUND_HALF_UP : undefined,
                  })}
                </span>
              </span>
              <span>
                L{' '}
                <span
                  className={
                    hoverKLineData.open > hoverKLineData.close
                      ? 'syn-tv-charts-legend-info-ohlc-red'
                      : 'syn-tv-charts-legend-info-ohlc-green'
                  }>
                  {WrappedBigNumber.from(hoverKLineData.low).formatPriceNumberWithTooltip({
                    isStablePair: isStablePair,
                    // roundingMode: isStablePair ? BigNumber.ROUND_HALF_UP : undefined,
                  })}
                </span>
              </span>
              <span>
                C{' '}
                <span
                  className={
                    hoverKLineData.open > hoverKLineData.close
                      ? 'syn-tv-charts-legend-info-ohlc-red'
                      : 'syn-tv-charts-legend-info-ohlc-green'
                  }>
                  {WrappedBigNumber.from(hoverKLineData.close).formatPriceNumberWithTooltip({
                    isStablePair: isStablePair,
                    // roundingMode: isStablePair ? BigNumber.ROUND_HALF_UP : undefined,
                  })}
                </span>
              </span>
            </div>
          )}
        </div>
        {hoverKLineData && !hideVolume && (
          <div className="syn-tv-charts-legend-volume">
            Vol • {baseToken?.symbol}
            <span
              className={
                hoverKLineData.open > hoverKLineData.close
                  ? 'syn-tv-charts-legend-volume-red'
                  : 'syn-tv-charts-legend-volume-green'
              }>
              {WrappedBigNumber.from(hoverKLineData.baseVolume).formatNumberWithTooltip({ isShowTBMK: true })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(TradingViewLightCharts);

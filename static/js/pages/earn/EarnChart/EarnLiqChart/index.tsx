/**
 * @description Component-EarnLiqChart
 */
import './index.less';

import { ORDER_SPACING, TickMath, utils } from '@synfutures/sdks-perp';
import { useDebounceEffect, useDebounceFn } from 'ahooks';
import classNames from 'classnames';
import * as d3Scale from 'd3-scale';
import _ from 'lodash';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import Loading from '@/components/Loading';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useMockDevTool } from '@/components/Mock';
import { FETCHING_STATUS, THEME_ENUM } from '@/constants';
import { DEFAULT_MIN_TICK_DELTA } from '@/constants/earn';
import { EARN_ALPHA_THRESHOLDS } from '@/constants/global';
import { POLLING_GRAPH } from '@/constants/polling';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useMetaRangeByPairId } from '@/features/account/rangeHook';
import { useAvailableTokenBalance } from '@/features/balance/hook';
import { getPairLiqChartData } from '@/features/chart/actions';
import { useLiqChartData, useLiqChartDataStatus } from '@/features/chart/hooks';
import { useBackendChainConfig } from '@/features/config/hook';
import { addLiquidityAsymmetricSimulate, setAddLiqFormState } from '@/features/earn/action';
import { useAddLiquidationSimulationData, useAddLiquidityFormState, usePairPriceRange } from '@/features/earn/hook';
import { useGlobalConfig, useTheme } from '@/features/global/hooks';
import { useCurrentNewPairFromUrl, usePairFromUrl } from '@/features/pair/hook';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { pollingFunc } from '@/utils';
import { toWad } from '@/utils/numberUtil';
import { perToTenThousands } from '@/utils/trade';
import { alignTick } from '@synfutures/sdks-perp/dist/utils';
import { Slider } from 'antd';
import IlChart from '../IlChart';

let polling_chart: NodeJS.Timer | null = null;
interface IPropTypes {
  className?: string;
  asymmetric?: boolean;
  loading?: boolean;
}
const EarnLiqChart: FC<IPropTypes> = function ({ asymmetric, loading }) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const { dataTheme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const userAddr = useUserAddr();
  const { deviceType } = useMediaQueryDevice();
  const dispatch = useAppDispatch();
  const currentPair = usePairFromUrl(chainId);
  const newPair = useCurrentNewPairFromUrl(chainId);
  const combinedPair = useMemo(() => currentPair || newPair, [currentPair, newPair]);
  const sdkContext = useSDK(chainId);
  const data = useLiqChartData(chainId, currentPair);
  const addLiqState = useAddLiquidityFormState(chainId);
  const backendChainConfig = useBackendChainConfig(chainId);
  const chartHeight = 100;
  const { slippage } = useGlobalConfig(chainId);
  const { isMockSkeleton } = useMockDevTool();
  const metaRangeList = useMetaRangeByPairId(chainId, userAddr, currentPair?.id);
  const rangeLength = useMemo(() => {
    return metaRangeList ? Object.keys(metaRangeList).length : 0;
  }, [metaRangeList]);
  const fetchingStatus = useLiqChartDataStatus(chainId, currentPair?.id);
  const liqSimulation = useAddLiquidationSimulationData(chainId);
  const [rawPrice, setRawPrice] = useState(currentPair?.wrapAttribute('fairPrice'));
  const availableBalance = useAvailableTokenBalance(currentPair?.rootInstrument?.quoteToken?.address, chainId, true);
  const currentPrice = useMemo(
    () => (currentPair ? currentPair.wrapAttribute('fairPrice') : rawPrice),
    [currentPair, rawPrice],
  );
  const currentTick = useMemo(() => {
    if (currentPair) {
      return currentPair.tick;
    }
    if (currentPrice?.wadValue && currentPrice.notEq(0)) {
      try {
        return TickMath.getTickAtPWad(currentPrice.wadValue);
      } catch (error) {}
    }
    return 0;
  }, [currentPair, currentPrice]);
  const alphaWadLowerUpper = useMemo(() => {
    if (addLiqState?.lowerUpperTicks?.length) {
      const [lowerTick, upperTick] = addLiqState.lowerUpperTicks;
      const lowerWad = utils.tickDeltaToAlphaWad(Math.abs(currentTick - lowerTick));
      const upperWad = utils.tickDeltaToAlphaWad(Math.abs(upperTick - currentTick));

      return combinedPair?.rootInstrument.isInverse ? [upperWad, lowerWad] : [lowerWad, upperWad];
    }
  }, [addLiqState?.lowerUpperTicks, combinedPair?.rootInstrument.isInverse, currentTick]);
  const range = usePairPriceRange(toWad(EARN_ALPHA_THRESHOLDS.MAX), currentTick, currentPair?.rootInstrument.isInverse);
  const yMinMax = useMemo(() => {
    const liqs = data?.map((d) => d.liqNumber);
    return [(_.min(liqs) || 0) * 0.9, (_.max(liqs) || 100) * 1.05];
  }, [data]);
  const tickMinMax = useMemo(() => {
    const { ticks } = range;
    return ticks;
  }, [range]);
  const dataFiltered = useMemo(
    () =>
      _.filter(data, (d) => {
        const [min, max] = tickMinMax;
        return d.tick <= max && d.tick >= min;
      }),
    [data, tickMinMax],
  );
  /*
    pre-fetch ilchart data
   */
  // useILData(
  //   combinedPair && tickMinMax?.length > 1 && !!alphaWadLowerUpper?.length
  //     ? {
  //         expiry: combinedPair.expiry,
  //         instrument: {
  //           marketType: combinedPair.rootInstrument.marketType,
  //           baseSymbol: combinedPair.rootInstrument.baseToken,
  //           quoteSymbol: combinedPair.rootInstrument.quoteToken,
  //         },
  //         symbol: combinedPair.symbol,
  //         alphaWadLower: alphaWadLowerUpper[0],
  //         alphaWadUpper: alphaWadLowerUpper[1],
  //         isInverse: combinedPair.rootInstrument.isInverse || false,
  //       }
  //     : undefined,
  // );
  /*
    pre-fetch ilchart data
   */
  const xAxisScale = useMemo(() => d3Scale.scaleLinear().domain(tickMinMax).range([0, 100]).clamp(true), [tickMinMax]);
  const leftRightRatios = useMemo(() => {
    let priceRatio = 50;
    let leftRatio = 50;
    let rightRatio = 50;
    let middleWidth = 0;
    let leftWidth = 0;
    let rightWidth = 0;
    if (currentPrice) {
      priceRatio = xAxisScale(currentTick);
    }
    if (!!addLiqState?.lowerUpperTicks?.length) {
      leftRatio = xAxisScale(addLiqState?.lowerUpperTicks[0]);
      rightRatio = xAxisScale(addLiqState?.lowerUpperTicks[1]);
      middleWidth = WrappedBigNumber.from(rightRatio).min(leftRatio).toNumber();
      leftWidth = WrappedBigNumber.from(priceRatio).min(leftRatio).toNumber();
      rightWidth = WrappedBigNumber.from(rightRatio).min(priceRatio).toNumber();
    }
    return { priceRatio, leftRatio, rightRatio, middleWidth, leftWidth, rightWidth };
  }, [currentPrice, addLiqState?.lowerUpperTicks, xAxisScale, currentTick]);

  const priceStyles = useMemo(
    () => ({
      left: leftRightRatios.priceRatio + '%',
      display: fetchingStatus === FETCHING_STATUS.DONE ? 'flex' : 'flex',
    }),
    [fetchingStatus, leftRightRatios.priceRatio],
  );
  const coverStylesLeft = useMemo(
    () => ({
      left: leftRightRatios.leftRatio + '%',
      width: leftRightRatios.leftWidth + '%',
      display: fetchingStatus === FETCHING_STATUS.DONE ? 'flex' : 'flex',
    }),
    [fetchingStatus, leftRightRatios.leftRatio, leftRightRatios.leftWidth],
  );
  const coverStylesRight = useMemo(
    () => ({
      left: leftRightRatios.priceRatio + '%',
      width: leftRightRatios.rightWidth + '%',
      display: fetchingStatus === FETCHING_STATUS.DONE ? 'flex' : 'flex',
    }),
    [fetchingStatus, leftRightRatios.priceRatio, leftRightRatios.rightWidth],
  );
  const updateLowerUpperTick = useCallback(
    (lowerUpperTicks: number[] | undefined) => {
      addLiqState &&
        dispatch(
          setAddLiqFormState({
            ...addLiqState,
            lowerUpperTicks,
          }),
        );
    },
    [addLiqState, dispatch],
  );
  const getRawPrice = useCallback(async () => {
    if (newPair) {
      const rawPrice = await sdkContext?.perp?.observer.getRawSpotPrice({
        baseSymbol: newPair.rootInstrument.baseToken,
        quoteSymbol: newPair.rootInstrument.quoteToken,
        marketType: newPair.rootInstrument.marketType,
      });
      rawPrice && setRawPrice(WrappedBigNumber.from(rawPrice || 0));
    }
  }, [newPair, sdkContext]);
  const checkLowerUpperTicks = useCallback(
    (ticks: number[]) => {
      const minTickDelta =
        currentPair?.rootInstrument.minTickDelta || newPair?.rootInstrument?.minTickDelta || DEFAULT_MIN_TICK_DELTA;
      let [lowerTick, upperTick] = ticks;
      if (lowerTick > currentTick - minTickDelta) {
        lowerTick = currentTick - minTickDelta;
      }
      if (upperTick < currentTick + minTickDelta) {
        upperTick = currentTick + minTickDelta;
      }
      return [lowerTick, upperTick];
    },
    [currentPair?.rootInstrument, currentTick, newPair],
  );
  const { run: simulateAddLiq } = useDebounceFn(
    (ticks: number[]) => {
      const [lowerTick, upperTick] = ticks;
      const alphaWadLower = utils.tickDeltaToAlphaWad(Math.abs(currentTick - lowerTick));
      const alphaWadUpper = utils.tickDeltaToAlphaWad(Math.abs(upperTick - currentTick));
      chainId &&
        combinedPair &&
        dispatch(
          addLiquidityAsymmetricSimulate({
            chainId,
            sdkContext,
            pair: combinedPair,
            alphaWadLower,
            alphaWadUpper,
            margin: WrappedBigNumber.from(addLiqState?.amount || 0),
            slippage: perToTenThousands(Number(slippage)),
            userAddr,
            customStableInstruments: backendChainConfig?.customStableInstruments,
          }),
        );
    },
    { wait: 200 },
  );

  useDebounceEffect(
    () => {
      if (polling_chart) clearInterval(polling_chart);
      if (chainId && currentPair && sdkContext) {
        polling_chart = pollingFunc(() => {
          dispatch(
            getPairLiqChartData({
              chainId,
              instrumentAddr: currentPair.rootInstrument.instrumentAddr,
              expiry: currentPair.expiry,
              sdk: sdkContext,
            }),
          );
        }, POLLING_GRAPH);
      }

      return () => {
        if (polling_chart) clearInterval(polling_chart);
      };
    },
    // must include rangeLength to renew after addLiq
    [chainId, currentPair?.id, rangeLength],
    { wait: 500 },
  );
  useEffect(() => {
    if (!currentPair) {
      getRawPrice();
    }
  }, [currentPair, getRawPrice, newPair, sdkContext]);
  useEffect(() => {
    if (liqSimulation?.data && !addLiqState?.lowerUpperTicks?.length && currentPrice) {
      updateLowerUpperTick([
        currentTick - liqSimulation.data.tickDeltaLower,
        currentTick + liqSimulation.data.tickDeltaUpper,
      ]);
    }
    // only these three
  }, [liqSimulation?.data, addLiqState?.lowerUpperTicks?.length, currentPrice]);
  useEffect(() => {
    // reset lowerUpperTicks when switch pair
    updateLowerUpperTick([]);
  }, [currentPair?.id, newPair?.id]);

  useEffect(() => {
    if (currentPrice && !!addLiqState?.lowerUpperTicks?.length) {
      const ticks = checkLowerUpperTicks(addLiqState.lowerUpperTicks);
      if (ticks) {
        updateLowerUpperTick(ticks);
        simulateAddLiq(ticks);
      }
    }
    //resimulate when currentPrice or balance changes
  }, [currentPrice, availableBalance?.stringValue]);

  useEffect(() => {
    if (!addLiqState?.asymmetric && liqSimulation?.data?.tickDeltaLower) {
      const tickDelta = Math.min(liqSimulation?.data?.tickDeltaLower, liqSimulation?.data?.tickDeltaUpper);
      const newTicks = [currentTick - tickDelta, currentTick + tickDelta];
      updateLowerUpperTick(newTicks);
      simulateAddLiq(newTicks);
    }
    // resimulate when uncheck asymmetric
  }, [addLiqState?.asymmetric]);

  useDebounceEffect(() => {
    if (!!addLiqState?.lowerUpperTicks?.length) {
      const ticks = checkLowerUpperTicks(addLiqState.lowerUpperTicks);
      if (ticks && WrappedBigNumber.from(addLiqState?.amount || 0).notEq(0)) {
        updateLowerUpperTick(ticks);
        simulateAddLiq(ticks);
      }
    }
    //resimulate when amount changes
  }, [addLiqState?.amount]);

  const setElsListener = useCallback(
    (add: boolean, left?: boolean) => {
      if (!asymmetric) {
        const els = document.querySelectorAll('.syn-earn-liq-chart-sliders .ant-slider-handle');
        els.forEach((el) => {
          el.setAttribute('data-active', add ? 'true' : 'false');
        });
      } else {
        const el = left
          ? document.querySelector('.syn-earn-liq-chart-sliders .ant-slider:first-of-type .ant-slider-handle')
          : document.querySelector('.syn-earn-liq-chart-sliders .ant-slider:last-of-type .ant-slider-handle');
        el?.setAttribute('data-active', add ? 'true' : 'false');
      }
    },
    [asymmetric],
  );

  if (!liqSimulation?.data || loading || isMockSkeleton) {
    return (
      <div className="syn-earn-liq-chart-loading">
        <Loading spinning />
        <Slider range={true} tooltip={{ open: false }} value={[20, 80]} min={0} max={100} />
      </div>
    );
  }
  return (
    <>
      <div className={classNames('syn-earn-liq-chart', deviceType)}>
        <div
          className={`syn-earn-liq-chart-item-chart ${liqSimulation?.data ? 'short' : ''} ${
            newPair && !currentPair ? 'has-new-pair' : ''
          }`}>
          <div ref={chartContainerRef} className="syn-earn-liq-chart-item-chart-container">
            <div style={priceStyles} className="syn-earn-liq-chart-item-price-container">
              <>{t('common.earn.currentP')}</>
              <span className="font-number">
                {newPair && !currentPair
                  ? rawPrice?.formatPriceNumberWithTooltip()
                  : currentPair?.wrapAttribute('fairPrice').formatPriceNumberWithTooltip()}
              </span>
            </div>
            <div style={priceStyles} className="syn-earn-liq-chart-item-price-line" />
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart
                height={chartHeight}
                data={dataFiltered}
                margin={{
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}>
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={'#00BFBF'} stopOpacity={1} />
                    <stop offset="95%" stopColor={'#00BFBF'} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis
                  domain={tickMinMax}
                  interval="preserveStart"
                  type={'number'}
                  tick={false}
                  width={0}
                  // scale="log"
                  height={0}
                  dataKey="tick"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={yMinMax}
                  width={0}
                  height={chartHeight}
                  dataKey="liqNumber"
                  tick={false}
                  yAxisId="liq"
                  tickLine={false}
                  axisLine={false}
                />
                <Area
                  type="step"
                  isAnimationActive={false}
                  animationDuration={0}
                  dataKey="liqNumber"
                  yAxisId="liq"
                  stroke={'transparent'}
                  fill={dataTheme === THEME_ENUM.DARK ? '#00BFBF' : '#00BFBF66'}
                />
              </AreaChart>
            </ResponsiveContainer>{' '}
            <div
              style={coverStylesLeft}
              className={classNames('syn-earn-liq-chart-item-cover left', { borderless: true })}
            />
            <div
              style={coverStylesRight}
              className={classNames('syn-earn-liq-chart-item-cover right', { borderless: true })}
            />
          </div>
          {!!addLiqState?.lowerUpperTicks?.length && (
            <div className="syn-earn-liq-chart-sliders">
              <Slider
                tooltip={{ open: false }}
                onFocus={() => {
                  setElsListener(true, true);
                }}
                onBlur={() => {
                  setElsListener(false, true);
                }}
                style={{ width: `${leftRightRatios.priceRatio}%` }}
                onChange={(value) => {
                  const [min, max] = tickMinMax;
                  let tick1 = xAxisScale.invert(value);
                  let tick2 = _.get(addLiqState.lowerUpperTicks, [1]);
                  if (!asymmetric) {
                    tick2 = currentTick + currentTick - tick1;
                  }
                  tick1 = Math.max(alignTick(tick1, ORDER_SPACING), min);
                  if (tick2) {
                    tick2 = Math.min(alignTick(tick2, ORDER_SPACING), max);
                    const ticks = checkLowerUpperTicks([tick1, tick2]);
                    if (ticks) {
                      updateLowerUpperTick(ticks);
                      simulateAddLiq(ticks);
                    }
                  }
                }}
                value={leftRightRatios.leftRatio}
                min={0}
                max={leftRightRatios.priceRatio}
              />
              <Slider
                tooltip={{ open: false }}
                onFocus={() => {
                  setElsListener(true);
                }}
                onBlur={() => {
                  setElsListener(false);
                }}
                onChange={(value) => {
                  const [min, max] = tickMinMax;
                  let tick1 = _.get(addLiqState.lowerUpperTicks, [0]);
                  let tick2 = xAxisScale.invert(value);
                  if (!asymmetric) {
                    tick1 = currentTick - (tick2 - currentTick);
                  }
                  tick2 = Math.min(alignTick(tick2, ORDER_SPACING), max);
                  if (tick1) {
                    tick1 = Math.max(alignTick(tick1, ORDER_SPACING), min);
                    const ticks = checkLowerUpperTicks([tick1, tick2]);
                    if (ticks) {
                      updateLowerUpperTick(ticks);
                      simulateAddLiq(ticks);
                    }
                  }
                }}
                value={leftRightRatios.rightRatio}
                min={leftRightRatios.priceRatio}
                max={100}
              />
            </div>
          )}

          <IlChart
            ticksMinMax={tickMinMax}
            alphaWadLower={_.get(alphaWadLowerUpper, [0])}
            alphaWadUpper={_.get(alphaWadLowerUpper, [1])}
            currentTick={currentTick}
            lowerUpperTicks={addLiqState?.lowerUpperTicks}
            pair={combinedPair}
          />
        </div>
      </div>
    </>
  );
};

export default EarnLiqChart;

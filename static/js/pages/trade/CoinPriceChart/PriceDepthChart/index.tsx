/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description Component-PriceDepthChart
 */

import { DepthChartData } from '@synfutures/sdks-perp-datasource';
import classNames from 'classnames';
import { axisBottom, axisLeft } from 'd3-axis';
import { ScaleLinear, scaleLinear, scaleLog } from 'd3-scale';
import * as d3 from 'd3-selection';
import { area, curveStepAfter, line } from 'd3-shape';
import { zoom } from 'd3-zoom';
import _ from 'lodash';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';

import Loading from '@/components/Loading';
import { WrappedPair } from '@/entities/WrappedPair';
import { useChainId } from '@/hooks/web3/useChain';
import { formatDisplayNumber, reduceArrayByStep } from '@/utils/numberUtil';

import { useFuturesDepthChartsData, useIsFetchedFuturesDepthCharts } from '@/features/futures/hooks';
import { watemarkBase64 } from '../TradingView/assets/watemark_base64';
import CustomTooltip from './CustomTooltip';
interface IProps {
  isMobile?: boolean;
  pair: WrappedPair | undefined;
}
// let depthPolling: NodeJS.Timeout | undefined = undefined;
function PriceDepthChart({ pair }: IProps): JSX.Element {
  const chainId = useChainId();
  // const sdkContext = useSDK(chainId);
  // const dispatch = useAppDispatch();
  // const stepRatios = usePairStepRatios(pair?.rootInstrument?.setting?.initialMarginRatio);
  // const stepRatio = useMemo(() => _.min(stepRatios), [stepRatios]);
  const depthDataFromApi = useFuturesDepthChartsData(chainId, pair?.rootInstrument.instrumentAddr, pair?.expiry);

  // const depthData = usePairDepthData(chainId, pair, stepRatio);

  // const fetchingStatus = usePairDepthDataStatus(chainId, pair?.id, stepRatio);
  const isFetched = useIsFetchedFuturesDepthCharts(chainId, pair?.rootInstrument.instrumentAddr, pair?.expiry);
  const contentRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(760);
  const [leftWidth, setLeftWidth] = useState(0);
  const [rightWidth, setRightWidth] = useState(760);
  const chartHeight = 370;
  const kScale = scaleLog().domain([1.01, 20]).range([40, 98]).clamp(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [rightPriceData, setRightPriceData] = useState<DepthChartData | undefined>(undefined);
  const [leftPriceData, setLeftPriceData] = useState<DepthChartData | undefined>(undefined);
  const getDataByScale = useCallback(
    (data: DepthChartData[], scale: number, left?: boolean) => {
      const last = _.last(data);
      if (pair && last) {
        const fairPrice = pair.wrapAttribute('fairPrice');
        const gap = fairPrice.min(last.price).abs();
        const distance = gap.mul(100 - scale).dividedBy(100);
        const getStep = (length: number) => (length > 2000 ? 10 : 4);
        if (left) {
          const capPrice = fairPrice.min(distance);
          const filteredData = data.filter((d) => capPrice.lte(d.price));
          return reduceArrayByStep(filteredData, getStep(filteredData.length));
        } else {
          const capPrice = fairPrice.add(distance);
          const filteredData = data.filter((d) => capPrice.gte(d.price));
          return reduceArrayByStep(filteredData, getStep(filteredData.length));
        }
      }
      return data;
    },
    // only fairprice
    [pair?.fairPrice._hex],
  );

  const [scale, setScale] = useState(1);
  const leftData = useMemo(
    () => getDataByScale(depthDataFromApi?.left || [], scale, true),
    [depthDataFromApi?.left, getDataByScale, scale],
  );
  const rightData = useMemo(
    () => getDataByScale(depthDataFromApi?.right || [], scale),
    [depthDataFromApi?.right, getDataByScale, scale],
  );
  const xMinMax = useMemo(() => {
    return [_.last(leftData)?.price || 0, _.last(rightData)?.price || 10000];
  }, [leftData, rightData]);
  const yMinMax = useMemo(() => {
    return [0, _.max([_.last(leftData)?.base, _.last(rightData)?.base]) || 10000];
  }, [leftData, rightData]);
  const xAxisScale = useMemo(() => scaleLinear().domain(xMinMax).range([0, chartWidth]), [chartWidth, xMinMax]);
  const yAxisScale = useMemo(() => scaleLinear().domain(yMinMax).range([chartHeight, 0]), [yMinMax]);
  const fairPriceLeft = useMemo(
    () => (pair ? xAxisScale(pair?.wrapAttribute('fairPrice').toNumber()) : chartWidth / 2),
    [chartWidth, pair, xAxisScale],
  );
  const getNearestData = useCallback((price: number, datas: DepthChartData[]): DepthChartData => {
    const data = datas.reduce((prev, current) => {
      const aDiff = Math.abs(prev.price - price);
      const bDiff = Math.abs(current.price - price);
      if (aDiff == bDiff) {
        return prev.price > current.price ? prev : current;
      } else {
        return bDiff < aDiff ? current : prev;
      }
    }, datas[0]);
    return data;
  }, []);
  const setLeftRightPrices = useCallback(
    (rawPrice: number) => {
      if (pair && !!leftData.length && !!rightData.length) {
        const isRight = pair.wrapAttribute('fairPrice').lte(rawPrice);
        const data = getNearestData(rawPrice, (isRight ? rightData : leftData) || []);
        if (!data) {
          return;
        }
        const dataGap = pair.wrapAttribute('fairPrice').min(data.price).abs().toNumber();
        const symmetricalPrice = pair
          .wrapAttribute('fairPrice')
          .add(dataGap * (pair.wrapAttribute('fairPrice').gt(data.price) ? 1 : -1))
          .toNumber();
        let symmetricalData: DepthChartData | undefined = getNearestData(
          symmetricalPrice,
          (isRight ? leftData : rightData) || [],
        );
        if (symmetricalData.price === data.price) {
          symmetricalData = undefined;
        }
        const leftPriceData = pair.wrapAttribute('fairPrice').gt(data.price) ? data : symmetricalData;
        const rightPriceData = pair.wrapAttribute('fairPrice').lte(data.price) ? data : symmetricalData;
        setLeftWidth(leftPriceData ? xAxisScale(leftPriceData.price) : 0);
        setRightWidth(rightPriceData ? chartWidth - xAxisScale(rightPriceData.price) : 0);
        setLeftPriceData(leftPriceData);
        setRightPriceData(rightPriceData);
      }
    },
    [chartWidth, getNearestData, leftData, pair, rightData, xAxisScale],
  );
  const onMouseMove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (event: MouseEvent) => {
      const mouse = d3.pointer(event);
      const price = xAxisScale.invert(mouse[0]);
      setLeftRightPrices(price);
    },
    [setLeftRightPrices, xAxisScale],
  );
  const updatePrices = useCallback(
    (axis: ScaleLinear<number, number, never>) => {
      if (depthDataFromApi && showTooltip) {
        const leftPriceRaw = axis.invert(leftWidth);
        setLeftRightPrices(leftPriceRaw);
      }
    },
    [depthDataFromApi, leftWidth, setLeftRightPrices, showTooltip],
  );
  const areaFunc = useCallback(
    (axis: ScaleLinear<number, number, never>) => {
      return area<DepthChartData>()
        .curve(curveStepAfter)
        .x((d) => axis(d.price))
        .y0(yAxisScale(0))
        .y1((d) => yAxisScale(d.base));
    },
    [yAxisScale],
  );
  const lineFunc = useCallback(
    (axis: ScaleLinear<number, number, never>) =>
      line<DepthChartData>()
        .x((d) => axis(d.price))
        .y((d) => yAxisScale(d.base))
        .curve(curveStepAfter),
    [yAxisScale],
  );
  const xAxis = useCallback((x: ScaleLinear<number, number, never>) => axisBottom(x).tickPadding(4).tickSize(0), []);
  const initSvg = useCallback(() => {
    const [min, max] = xMinMax;
    if (!min || !max || !pair) {
      return;
    }
    const svg = d3.select('.coin-price-chart__container svg').node()
      ? d3.select('.coin-price-chart__container svg')
      : d3
          .select('.coin-price-chart__container')
          .append('svg')
          .attr('viewBox', [0, 0, chartWidth, chartHeight + 24])
          .attr('width', chartWidth)
          .attr('height', chartHeight + 24);

    const gArea = svg.select('g.area').node()
      ? svg.select('g.area')
      : svg.append('g').attr('class', 'area').attr('transform', `translate(0,0)`);
    // areas
    const pathLeft = d3.select('#pathLeft').node()
      ? d3.select('#pathLeft')
      : gArea.append('path').attr('fill', '#14B84B33').attr('id', 'pathLeft');
    pathLeft.attr('d', areaFunc(xAxisScale)(leftData || []));
    const lineLeft = d3.select('#lineLeft').node()
      ? d3.select('#lineLeft')
      : gArea
          .append('path')
          .attr('fill', 'none')
          .attr('stroke', '#14B84B')
          .attr('stroke-width', 1)
          .attr('id', 'lineLeft');
    lineLeft.attr('d', lineFunc(xAxisScale)(leftData || []));
    const pathRight = d3.select('#pathRight').node()
      ? d3.select('#pathRight')
      : gArea.append('path').attr('fill', '#FF666633').attr('id', 'pathRight');
    pathRight.attr('d', areaFunc(xAxisScale)(rightData || []));
    const lineRight = d3.select('#lineRight').node()
      ? d3.select('#lineRight')
      : gArea
          .append('path')
          .attr('fill', 'none')
          .attr('stroke', '#FF6666')
          .attr('stroke-width', 1)
          .attr('id', 'lineRight');
    lineRight.attr('d', lineFunc(xAxisScale)(rightData || []));

    // axis X
    const axisX = d3.select('#axisX').node()
      ? d3.select('#axisX')
      : svg.append('g').attr('id', 'axisX').attr('transform', `translate(0,${chartHeight})`);
    axisX
      .call(
        xAxis(xAxisScale)
          .tickValues([min, pair?.wrapAttribute('fairPrice').toNumber(), max])
          .tickSizeInner(0)
          .tickFormat((v) => formatDisplayNumber({ num: v as number, type: 'price' }))
          .tickSizeOuter(0) as any,
      )
      .call((g) => g.select('.tick:last-of-type text').attr('x', -3).attr('text-anchor', 'end'))
      .call((g) => g.select('.tick:first-of-type text').attr('x', 3).attr('text-anchor', 'start'))
      .attr('class', 'axis');

    //Axis Y
    const axisY = d3.select('#axisY').node()
      ? d3.select('#axisY')
      : svg.append('g').attr('id', 'axisY').attr('transform', `translate(${chartWidth},0)`).attr('height', chartHeight);
    axisY
      .call(
        axisLeft(yAxisScale)
          .ticks(7)
          .tickSize(0)
          .tickFormat((v) => formatDisplayNumber({ num: v as number, isShowTBMK: true, type: 'price' }))
          .tickPadding(10)
          .tickSizeInner(0)
          .tickSizeOuter(0) as any,
      )
      .call((g) => g.select('.tick text').attr('y', -12).attr('text-anchor', 'end'))
      .attr('class', 'axis');

    //zoom
    const zoomFunc = zoom()
      .scaleExtent([1, 20])
      .extent([
        [0, 0],
        [chartWidth, chartHeight],
      ])
      .translateExtent([
        [0, -Infinity],
        [chartWidth, Infinity],
      ]);
    svg.call(zoomFunc as any);
    const zoomRect = d3.select('#zoomRect').node()
      ? d3.select<SVGRectElement, unknown>('#zoomRect')
      : d3
          .select('.coin-price-chart__svg g')
          .append('rect')
          .attr('id', 'zoomRect')
          .attr('width', chartWidth)
          .attr('height', chartHeight)
          .attr('fill', 'none')
          .attr('pointer-events', 'all');
    zoomRect
      .on('mouseenter', () => {
        setShowTooltip(true);
      })
      .on('mouseout', () => {
        setShowTooltip(false);
      })
      .on('mousemove', onMouseMove)
      .call(
        zoomFunc.on('zoom', (event) => {
          const k = event.transform.k;
          const scale = k === 1 ? 0 : kScale(k);
          setScale(scale);
        }) as any,
      );
  }, [
    xMinMax,
    pair,
    chartWidth,
    areaFunc,
    xAxisScale,
    leftData,
    lineFunc,
    rightData,
    xAxis,
    yAxisScale,
    onMouseMove,
    kScale,
  ]);
  // const getDepthChartData = useCallback(() => {
  //   if (pair && chainId && sdkContext) {
  //     try {
  //       dispatch(
  //         getPairDepthChartData({
  //           chainId,
  //           instrumentAddr: pair?.rootInstrument.instrumentAddr,
  //           expiry: pair.expiry,
  //           sdkContext,
  //           stepRatio,
  //           isInverse: pair.isInverse,
  //         }),
  //       );
  //     } catch (e) {
  //       console.log('🚀 ~ file: index.tsx:196 ~ useEffect ~ e:', e);
  //     }
  //   }
  // }, [chainId, dispatch, pair, sdkContext, stepRatio]);

  useEffect(() => {
    if (!!leftData.length) {
      initSvg();
      updatePrices(xAxisScale);
    }
    // only dep on this
  }, [leftData]);

  useEffect(() => {
    setScale(1);
  }, [pair?.id]);

  // useEffect(() => {
  //   if (pair && chainId && sdkContext && stepRatio) {
  //     try {
  //       clearInterval(depthPolling);
  //       depthPolling = pollingFunc(() => {
  //         getDepthChartData();
  //       }, POLLING_ORDER_BOOK);
  //     } catch (e) {
  //       console.log('🚀 ~ file: index.tsx:220 ~ useEffect ~ e:', e);
  //     }
  //   }
  //   return () => {
  //     depthPolling && clearInterval(depthPolling);
  //   };
  //   // only these four
  // }, [chainId, pair?.id, pair?.fairPrice._hex, stepRatio]);

  //  update chartWidth on resizing
  const updateChartWidth = useCallback(
    _.throttle(() => {
      setChartWidth(contentRef.current?.offsetWidth || 760);
    }, 150),
    [],
  );
  useEffect(() => {
    window.addEventListener('resize', updateChartWidth);
    setChartWidth(contentRef.current?.offsetWidth || 760);
    // no deps
  }, []);
  return (
    <>
      <div
        ref={contentRef}
        className={classNames('coin-price-chart')}
        style={{
          backgroundImage: watemarkBase64,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}>
        <div id="coinChart" className="coin-price-chart__container">
          {!isFetched && <Loading size="large" spinning={true} />}
        </div>
        {depthDataFromApi && (
          <>
            <CustomTooltip
              xScale={xAxisScale}
              yScale={yAxisScale}
              pair={pair}
              className="right"
              data={rightPriceData}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
              show={showTooltip}
              fairPrice={pair?.wrapAttribute('fairPrice').toNumber()}
            />
            <CustomTooltip
              left={true}
              chartHeight={chartHeight}
              xScale={xAxisScale}
              yScale={yAxisScale}
              pair={pair}
              className="left"
              data={leftPriceData}
              fairPrice={pair?.wrapAttribute('fairPrice').toNumber()}
              chartWidth={chartWidth}
              show={showTooltip}
            />
            <svg style={{ width: chartWidth, height: chartHeight }} className="coin-price-chart__svg">
              <g className="mouseOverEffect"></g>
            </svg>
            <div
              style={{ width: leftWidth, height: chartHeight, opacity: showTooltip ? 1 : 0 }}
              className="coin-price-chart-cover left"
            />
            <div style={{ left: `${fairPriceLeft}px`, height: chartHeight }} className="coin-price-chart-cover-line" />
            <div
              style={{ width: rightWidth, height: chartHeight, opacity: showTooltip ? 1 : 0 }}
              className="coin-price-chart-cover right"
            />
          </>
        )}
      </div>
    </>
  );
}
export default memo(PriceDepthChart);

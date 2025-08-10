/**
 * @description Component-SpotChart
 */
import {
  Area,
  AreaChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import Loading from '@/components/Loading';
import { useMockDevTool } from '@/components/Mock';
import { SPOT_KLINE_INTERVAL } from '@/constants/spot';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useSpotKlinePoints, useSpotOrderBookDepth, useSpotPairPrice } from '@/features/spot/query';
import { useSpotState } from '@/features/spot/store';
import { useChainId } from '@/hooks/web3/useChain';
import { watemarkBase64 } from '@/pages/trade/CoinPriceChart/TradingView/assets/watemark_base64';
import { getSpotXAxisTickFormatter, getSpotXAxisTicks } from '@/utils/spot';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SpotChartInterval from '../SpotInfo/SpotChartInterval';
import tradeChartBg from './assets/trade_chart_bg.png';
import tradeChartLi from './assets/trade_chart_il.png';
import './index.less';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  isMobile?: boolean;
  defaultSpotKlineInterval?: SPOT_KLINE_INTERVAL;
}
const SpotChart: FC<IPropTypes> = function ({ isMobile = false, defaultSpotKlineInterval }) {
  const chartHeight = isMobile ? 200 : 430;
  const chainId = useChainId();
  const { token0, token1, spotKlineInterval, stepRatio } = useSpotState();
  const { data } = useSpotOrderBookDepth(chainId, token0?.address, token1?.address, stepRatio);
  const chartWidth = useMemo(() => (isMobile ? '100%' : data?.isMultiple ? 952 : 692), [data?.isMultiple, isMobile]);
  const { data: pairPrice } = useSpotPairPrice(chainId, token0?.address, token1?.address);
  const finalSpotKlineInterval = useMemo(() => {
    return defaultSpotKlineInterval || spotKlineInterval;
  }, [defaultSpotKlineInterval, spotKlineInterval]);
  const { data: klinePoints, isFetched } = useSpotKlinePoints(
    chainId,
    token0?.address,
    token1?.address,
    finalSpotKlineInterval,
  );
  const { t } = useTranslation();
  const [labelY, setLabelY] = useState(0);

  const chartData = useMemo(() => {
    return (
      _.cloneDeep(klinePoints)
        ?.sort((a, b) => a.timestamp - b.timestamp)
        .map((point, index) => {
          const price =
            !!klinePoints?.length && index === klinePoints?.length - 1
              ? pairPrice?.price.toNumber() || point.price
              : point.price;

          return {
            date: point.timestamp,
            price,
          };
        }) || []
    );
  }, [klinePoints, pairPrice?.price]);
  const minDomain = useMemo(() => {
    const maxPrice = _.maxBy(chartData, 'price')?.price || 0;
    const minPrice = _.minBy(chartData, 'price')?.price || 0;
    const gap = maxPrice - minPrice;
    return minPrice ? minPrice - gap * 0.3 : 'auto';
  }, [chartData]);
  const maxDate = useMemo(() => _.maxBy(chartData, 'date')?.date, [chartData]);
  const width = WrappedBigNumber.from(chartData?.[0]?.price || 0).formatPriceString().length * 8;
  const ticks = useMemo(
    () =>
      getSpotXAxisTicks(
        _.first(chartData)?.date || Date.now(),
        _.last(chartData)?.date || Date.now(),
        spotKlineInterval,
      ),
    [chartData, spotKlineInterval],
  );

  const { isMockSkeleton } = useMockDevTool();
  const ToolTipContent = ({ payload }: TooltipProps<ValueType, NameType>) => {
    if (payload?.length) {
      const data = payload[0]?.payload;
      return (
        <div className="syn-spot-chart-tooltip">
          <div className="top">
            {t('common.price')}
            <div className="price">{WrappedBigNumber.from(data?.price).formatPriceString()}</div>
          </div>
          <div className="bottom">{moment(data?.date).format('YYYY MM-DD HH:mm')}</div>
        </div>
      );
    }
    return null;
  };
  if (isFetched && (klinePoints === null || klinePoints?.length === 0)) {
    return (
      <div className="syn-spot-chart-empty">
        <img src={tradeChartBg} alt="tradeChartBg" />
        <img src={tradeChartLi} alt="tradeChartLi" />
      </div>
    );
  }
  if (!klinePoints || isMockSkeleton) {
    return <Loading style={{ width: 'unset', flex: 1 }} spinning height={chartHeight} />;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomLabel = (props: any) => {
    const { y } = props.viewBox;
    setLabelY(y);
    return null;
  };
  return (
    <div
      style={{
        backgroundImage: watemarkBase64,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
      className={classNames('syn-spot-chart', { 'syn-spot-chart-mobile': isMobile })}>
      {!isMobile && <SpotChartInterval />}
      <div className="syn-spot-chart-container" style={{ width: '100%' }}>
        <div className="syn-spot-chart-reference_label" style={{ top: labelY }}>
          {pairPrice?.price.formatPriceString()}
        </div>
        <ResponsiveContainer width={chartWidth} height={chartHeight}>
          <AreaChart
            data={chartData}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}>
            <defs>
              <linearGradient id="colorGreen" x1="304" y1="0" x2="304" y2="400.172" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00BFBF" stopOpacity="0.3" />
                <stop offset="1" stopColor="#00BFBF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <XAxis
              ticks={ticks}
              tickFormatter={(value, i) => {
                return getSpotXAxisTickFormatter(value, i, spotKlineInterval);
              }}
              dy={1}
              axisLine={true}
              dataKey="date"
              tickLine={false}
              tick={{ color: '#1F292E99', fontSize: 12 }}
            />
            <YAxis
              orientation="right"
              domain={[minDomain, 'auto']}
              height={chartHeight}
              dataKey="price"
              tickSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => WrappedBigNumber.from(value).formatPriceString()}
              width={width}

              //mirror={true}
            />
            <ReferenceLine
              y={pairPrice?.price.toNumber()}
              label={<CustomLabel />}
              stroke="#00BFBF"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <ReferenceDot x={maxDate} y={pairPrice?.price.toNumber()} stroke="#00BFBF" fill="#00BFBF" r={3} />
            <Tooltip wrapperStyle={{ outline: 'none' }} content={<ToolTipContent />} />

            <Area animationDuration={3} dataKey="price" stroke={'#00BFBF'} strokeWidth={2} fill={'url(#colorGreen)'} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpotChart;

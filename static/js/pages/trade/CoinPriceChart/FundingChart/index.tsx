import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import { FundingChartInterval, FundingRateData } from '@synfutures/sdks-perp-datasource';
import { ComponentProps, useMemo } from 'react';
import { Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import Loading from '@/components/Loading';
import { WrappedPair } from '@/entities/WrappedPair';

import { useMockDevTool } from '@/components/Mock';
import { useFuturesFundingChartsData, useIsFetchedFuturesFundingCharts } from '@/features/futures/hooks';
import { watemarkBase64 } from '../TradingView/assets/watemark_base64';
import { FundingLegend } from './FundingLegend/FundingLegend';
import FundingTooltip from './FundingTooltip';

type IProps = ComponentProps<'div'> & {
  chainId?: CHAIN_ID;
  currentPair?: WrappedPair;
  chartDuration: FundingChartInterval;
  data?: FundingRateData[];
};
const lineProps = {
  type: 'monotone',
  strokeWidth: 1,
  dot: false,
};
export default function FundingChart({ chainId, currentPair, chartDuration, ...others }: IProps): JSX.Element {
  // const dispatch = useAppDispatch();
  const fundingChartDataList = useFuturesFundingChartsData(
    chainId,
    currentPair?.instrumentAddr,
    currentPair?.expiry,
    chartDuration,
  );
  const isFetched = useIsFetchedFuturesFundingCharts(
    chainId,
    currentPair?.instrumentAddr,
    currentPair?.expiry,
    chartDuration,
  );
  // const fundingChartDataList = useFundingChartData(chainId, currentPair, chartDuration);
  // const fetchingStatus = useFundingChartFetchingStatus(chainId, currentPair?.id, chartDuration);
  const preprocessedData = useMemo(() => {
    return fundingChartDataList?.map(({ timestamp, payRate, receiveRate, isLongPay }) => ({
      timestamp: timestamp * 1000,
      receiveRateNum: receiveRate.times(100).toNumber(),
      payRateNum: payRate.times(100).toNumber(),
      isLongPay,
    }));
  }, [fundingChartDataList]);
  const { isMockSkeleton } = useMockDevTool();
  // useEffect(() => {
  //   if (currentPair && chainId) {
  //     try {
  //       dispatch(
  //         getPairFundingData({
  //           chainId,
  //           pair: currentPair,
  //           interval: chartDuration,
  //         }),
  //       );
  //     } catch (e) {
  //       console.log('🚀 ~ file: index.tsx:139 ~ useEffect ~ e:', e);
  //     }
  //   }
  // }, [chainId, currentPair, dispatch, chartDuration]);
  return (
    <div
      className="syn-funding-chart"
      {...others}
      style={{
        backgroundImage: watemarkBase64,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}>
      {isMockSkeleton || !preprocessedData || !isFetched ? (
        <Loading size="large" spinning={true} />
      ) : (
        <>
          <div className="syn-funding-chart-line" style={{ bottom: 25 }} />
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={preprocessedData}>
              <YAxis
                orientation="right"
                dx={11}
                axisLine={false}
                tickLine={false}
                tick={{ color: '#1F292E99', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value === 0) {
                    return '';
                  }
                  return `${Number(value).toPrecision(2)}%`;
                }}
                mirror={true}
              />
              <Tooltip wrapperStyle={{ outline: 'none' }} content={<FundingTooltip interval={chartDuration} />} />
              <Legend wrapperStyle={{ bottom: 45 }} content={<FundingLegend />} />
              <XAxis
                interval={'preserveStartEnd'}
                minTickGap={100}
                tickFormatter={(value, i) => {
                  return i === 2
                    ? `${new Date(value).toLocaleString('default', { month: 'short' })}`
                    : `${new Date(value).getDate()}`;
                }}
                dy={35}
                axisLine={false}
                dataKey="timestamp"
                tickLine={false}
                tick={{ color: '#1F292E99', fontSize: 12 }}
              />
              <ReferenceLine y={0} strokeDasharray="3 3" stroke="#ABB5BA" strokeWidth={1} />
              <Line
                activeDot={{ r: 2, fill: '#14B84B', stroke: '#14B84B' }}
                isAnimationActive={false}
                {...lineProps}
                type="monotone"
                dataKey="receiveRateNum"
                stroke="#14B84B"
              />
              <Line
                activeDot={{ r: 2, fill: '#FF6666', stroke: '#FF6666' }}
                isAnimationActive={false}
                {...lineProps}
                type="monotone"
                dataKey="payRateNum"
                stroke="#FF6666"
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

/**
 * @description Component-InfoChart
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import _ from 'lodash';
// import _ from 'lodash';
import moment from 'moment';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import Loading from '@/components/Loading';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { FETCHING_STATUS } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { getTVLAndVolumeChartData } from '@/features/chart/actions';
import { useVolumeChartData, useVolumeDataStatus } from '@/features/chart/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import ChartLoading from '@/pages/trade/CoinPriceChart/ChartLoading';
import { ITooltipProps } from '@/types/pair';
import { formatDisplayNumber } from '@/utils/numberUtil';
import { VolumeChartData } from '@synfutures/sdks-perp-datasource';
import classNames from 'classnames';

interface IPropTypes {
  className?: string;
  pair?: WrappedPair;
  chainId?: CHAIN_ID;
}
const InfoChart: FC<IPropTypes> = function ({ pair, chainId }) {
  // const tvlList = useTVLChartData(chainId, pair);
  const volumeListOriginal = useVolumeChartData(chainId, pair);
  const sdk = useSDK(chainId);
  const volumeList = useMemo(
    () =>
      _.filter(volumeListOriginal, (v: VolumeChartData) => {
        const now = Date.now();
        return v?.timestamp && now - v.timestamp * 1000 > 1000 * 60 * 60 * 24;
      }),
    [volumeListOriginal],
  );
  const { t } = useTranslation();
  const { isMobile, deviceType } = useMediaQueryDevice();
  const fetchingStatus = useVolumeDataStatus(chainId, pair?.id);
  const dispatch = useAppDispatch();
  // const xTicks = useMemo(() => {
  //   const timestamps = _.map(volumeList, (v) => v.timestamp);
  //   const max = _.max(timestamps) || 0;
  //   const min = _.min(timestamps) || 0;
  //   const daySeconds = 60 * 60 * 24 * 1000;
  //   const tickMax =
  //     moment(max * 1000)
  //       .hour(0)
  //       .minute(0)
  //       .valueOf() / 1000;
  //   const tickMin =
  //     moment(min * 1000 + daySeconds)
  //       .hour(0)
  //       .minute(0)
  //       .valueOf() / 1000;
  //   let cursor = tickMin;
  //   const xTicks = [];

  //   while (cursor < tickMax) {
  //     xTicks.push(cursor);
  //     cursor = cursor + daySeconds / 1000;
  //   }
  //   console.log('🚀 ~ file: index.tsx:44 ~ xTicks ~ xTicks:', min, max, xTicks);
  //   return {
  //     xMinMax: [min, max],
  //     xTicks,
  //   };
  // }, [volumeList]);
  // console.log('🚀 ~ file: index.tsx:62 ~ xTicks ~ xTicks:', xTicks);
  const CustomTooltip = useCallback(
    ({ active, payload }: ITooltipProps) => {
      if (active && payload && payload.length) {
        const timestamp = _.get(payload, [0, 'payload', 'timestamp']);
        const volume = _.get(payload, [0, 'payload', 'quoteVolume']);
        return (
          <div className="syn-info-chart-custom-tooltip">
            <div className="syn-info-chart-custom-tooltip__label">
              {moment(Number(timestamp) * 1000).format('YYYY-MM-DD')}
            </div>
            <div className="syn-info-chart-custom-tooltip__content">
              <span className="syn-info-chart-custom-tooltip__content-label">{t('common.volume')}</span>
              <span>
                {WrappedBigNumber.from(volume).formatNumberWithTooltip({
                  suffix: pair?.rootInstrument.marginToken.symbol,
                  isShowTBMK: true,
                })}
              </span>
            </div>
          </div>
        );
      }

      return null;
    },
    [pair?.rootInstrument.marginToken.symbol, t],
  );
  useEffect(() => {
    if (!chainId) return;
    if (pair && sdk) {
      dispatch(
        getTVLAndVolumeChartData({
          chainId,
          pair,
          sdk,
        }),
      );
    }
  }, [chainId, pair, pair?.id, dispatch, sdk]);

  return (
    <ChartLoading isLoading={fetchingStatus !== FETCHING_STATUS.DONE}>
      <div className={classNames('syn-info-chart', deviceType)}>
        {fetchingStatus === FETCHING_STATUS.FETCHING && <Loading size="large" spinning={true}></Loading>}
        {fetchingStatus === FETCHING_STATUS.DONE && (
          <>
            {/* <ResponsiveContainer width="100%" height={'50%'}>
            <AreaChart
              data={tvlList}
              margin={{
                top: 5,
                left: 0,
                right: 0,
                bottom: 0,
              }}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={'#00BFBF'} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={'rgba(0, 191, 191, 0.00)'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                domain={['auto', 'auto']}
                width={0}
                tick={false}
                tickLine={false}
                axisLine={false}
                type={'number'}
              />
              <YAxis
                domain={['auto', 'auto']}
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  return formatDisplayNumber({ num: v });
                }}
              />
              <Area dataKey="tvl" name="TVL" stroke={'#00BFBF'} fill="url(#colorGreen)" />
            </AreaChart>
          </ResponsiveContainer> */}
            <ResponsiveContainer width="100%" height={'100%'}>
              <AreaChart
                data={volumeList}
                margin={{
                  top: 5,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}>
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={'#00BFBF'} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={'rgba(0, 191, 191, 0.00)'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  // domain={xTicks.xMinMax}
                  tickMargin={4}
                  // ticks={xTicks.xTicks}
                  tickLine={false}
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  tickCount={isMobile ? 7 : volumeList?.length}
                  tickFormatter={(v) => {
                    const date = moment(v * 1000);
                    if (date.date() === 1) {
                      return t(`common.months.${date.month() + 1}`);
                    }
                    return date.format('D');
                  }}
                  padding={{ left: 0, right: 0 }}
                />
                <Tooltip wrapperStyle={{ border: 'none' }} content={<CustomTooltip />} />
                <YAxis
                  domain={['auto', 'auto']}
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  padding={{ top: 0, bottom: 0 }}
                  tickFormatter={(v) => {
                    return formatDisplayNumber({ num: v, isShowTBMK: true });
                  }}
                />
                <Area
                  activeDot={false}
                  dataKey="quoteVolume"
                  name="Volume"
                  stroke={'#00BFBF'}
                  fill="url(#colorGreen)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </ChartLoading>
  );
};

export default InfoChart;

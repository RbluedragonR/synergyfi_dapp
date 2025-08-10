/**
 * @description Component-IlChart
 */
import { useILData } from '@/features/earn/query';
import './index.less';

// import { ReactComponent as PointD } from '@/assets/svg/point_dark.svg';
// import { ReactComponent as PointL } from '@/assets/svg/point_light.svg';
import Loading from '@/components/Loading';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { THEME_ENUM } from '@/constants';
import { IL_LOSS_BASE } from '@/constants/earn';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { useTheme } from '@/features/global/hooks';
import { CreativePair } from '@/types/pair';
import { PEARL_SPACING, SimulateImpermenantLossResult, TickMath } from '@synfutures/sdks-perp';
import { alignTick } from '@synfutures/sdks-perp/dist/utils';
import { useDebounceEffect } from 'ahooks';
import classNames from 'classnames';
import { BigNumber } from 'ethers';
import _ from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  ticksMinMax: number[];
  pair: WrappedPair | CreativePair | undefined;
  alphaWadLower?: BigNumber;
  alphaWadUpper?: BigNumber;
  lowerUpperTicks?: number[];
  currentTick: number;
}
const IlChart: FC<IPropTypes> = function ({
  ticksMinMax,
  pair,
  alphaWadLower,
  alphaWadUpper,
  lowerUpperTicks,
  currentTick,
}) {
  const chartHeight = 66;
  const [activeData, setActiveData] = useState<SimulateImpermenantLossResult | undefined>();
  const { deviceType } = useMediaQueryDevice();
  const { dataTheme } = useTheme();
  const [dotPosition, setDotPosition] = useState<{ cx: number; cy: number } | undefined>();
  const currentTickInverse = useMemo(
    () => currentTick * (pair?.rootInstrument.isInverse ? -1 : 1),
    [currentTick, pair?.rootInstrument.isInverse],
  );
  const ticksMinMaxInverse = useMemo(
    () =>
      _.orderBy(
        ticksMinMax.map((t) => t * (pair?.rootInstrument.isInverse ? -1 : 1)),
        [(t) => t],
        ['asc'],
      ),
    [pair?.rootInstrument.isInverse, ticksMinMax],
  );
  const { data, isLoading } = useILData(
    pair && alphaWadLower && alphaWadUpper
      ? {
          expiry: pair?.expiry,
          instrument: {
            marketType: pair.rootInstrument.marketType,
            baseSymbol: pair.rootInstrument.baseToken,
            quoteSymbol: pair.rootInstrument.quoteToken,
          },
          symbol: pair.symbol,
          alphaWadLower,
          alphaWadUpper,
          isInverse: pair.rootInstrument.isInverse || false,
        }
      : undefined,
  );
  const activeDataTransformed = useMemo(() => {
    if (!activeData) {
      return undefined;
    }
    const price = WrappedBigNumber.from(TickMath.getWadAtTick(activeData.tick));
    return {
      price,
      loss: WrappedBigNumber.from(activeData.impermanentLoss - IL_LOSS_BASE).mul(-1),
    };
  }, [activeData]);
  const yMax = useMemo(() => {
    if (!data) return 0.33;
    const loss = data.map((d) => d.impermanentLoss);
    return _.max(loss) || 0.3;
  }, [data]);
  const { t } = useTranslation();
  const ToolTipContent = ({ payload }: TooltipProps<ValueType, NameType>) => {
    if (payload?.length) {
      const data = payload[0]?.payload;
      setActiveData(data);
      return null;
    }
    return null;
  };
  const currentTickData = useMemo(
    () => data?.find((d) => d.tick === alignTick(currentTickInverse, PEARL_SPACING)),
    [currentTickInverse, data],
  );

  useDebounceEffect(() => {
    if (!activeData) {
      setActiveData(currentTickData);
    }
  }, [currentTickData]);
  useEffect(() => {
    setActiveData(undefined);
    setDotPosition(undefined);
  }, [lowerUpperTicks]);
  return (
    <div className={classNames('syn-il-chart', deviceType, { empty: isLoading })}>
      {isLoading && <Loading spinning size="large" />}
      {!!data?.length && (
        <div className="syn-il-chart-container">
          {activeData && !!dotPosition && (
            <div className="syn-il-chart-container-dot" style={{ left: dotPosition.cx, top: dotPosition.cy }} />
          )}
          <ResponsiveContainer width="100%" className="syn-il-chart-container-chart" height={chartHeight}>
            <AreaChart
              height={chartHeight}
              data={data}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}>
              <defs>
                <linearGradient id="colorChartLight" x1="0" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00BFBF" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
                <linearGradient id="colorChartDark" x1="0" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00BFBF" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#04606e" />
                </linearGradient>
              </defs>

              <XAxis
                domain={ticksMinMaxInverse}
                interval="preserveStart"
                type={'number'}
                tick={false}
                width={0}
                xAxisId="ilX"
                orientation="top"
                height={0}
                dataKey="tick"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                width={0}
                height={chartHeight}
                dataKey="impermanentLoss"
                yAxisId="il"
                tick={false}
                tickLine={false}
                axisLine={false}
              />
              {activeData && (
                <ReferenceDot
                  xAxisId="ilX"
                  yAxisId="il"
                  x={activeData?.tick}
                  y={activeData?.impermanentLoss}
                  strokeWidth={2}
                  strokeOpacity={1}
                  fillOpacity={1}
                  shape={(props) => {
                    const cx = _.get(props, ['cx']);
                    const cy = _.get(props, ['cy']);
                    if (cx !== dotPosition?.cx) {
                      setDotPosition({ cx, cy });
                    }
                    return <g />;
                  }}
                  stroke={dataTheme === THEME_ENUM.DARK ? '#007580' : '#fff'}
                  // shape={dataTheme === THEME_ENUM.DARK ? <PointD /> : <PointL />}
                  fill="#00BFBF"
                  r={6}
                />
              )}
              <Tooltip cursor={false} wrapperStyle={{ outline: 'none' }} content={<ToolTipContent />} />
              <Area
                type="monotone"
                isAnimationActive={false}
                animationDuration={0}
                stroke={'#00BFBF'}
                strokeWidth={1}
                activeDot={{ r: 0 }}
                // fillOpacity={dataTheme === THEME_ENUM.DARK ? 0.4 : 0.2}
                fill={dataTheme === THEME_ENUM.DARK ? 'url(#colorChartDark)' : 'url(#colorChartLight)'}
                dataKey="impermanentLoss"
                yAxisId="il"
                xAxisId="ilX"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {activeData && (
        <div className={classNames('syn-il-chart-details', deviceType)}>
          <dl>
            <dt>{t('common.earn.removeP')}</dt>
            <div className="syn-il-chart-details-line"></div>
            <dd>{activeDataTransformed?.price.formatPriceNumberWithTooltip()}</dd>
          </dl>
          <dl>
            <dt>{t('common.earn.estIl')}</dt>
            <div className="syn-il-chart-details-line"></div>
            <dd>
              <UnderlineToolTip title={t('common.earn.ilTooltip')}>
                {activeDataTransformed?.loss.formatPercentage()}
              </UnderlineToolTip>
            </dd>
          </dl>
        </div>
      )}
    </div>
  );
};

export default IlChart;

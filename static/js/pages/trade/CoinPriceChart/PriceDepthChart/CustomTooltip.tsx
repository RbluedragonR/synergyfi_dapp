/**
 * @description Component-CustomTooltip
 */
import './index.less';

import { DepthChartData } from '@synfutures/sdks-perp-datasource';
import classNames from 'classnames';
import * as d3Scale from 'd3-scale';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatPercentage } from '@/components/NumberFormat';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
interface IPropTypes {
  className?: string;
  data: DepthChartData | undefined;
  chartWidth: number;
  chartHeight: number;
  left?: boolean;
  show?: boolean;
  pair: WrappedPair | undefined;
  fairPrice: number | undefined;
  xScale: d3Scale.ScaleLinear<number, number, never>;
  yScale: d3Scale.ScaleLinear<number, number, never>;
}
const CustomTooltip: FC<IPropTypes> = function ({
  data,
  className,
  left,
  xScale,
  yScale,
  chartHeight,
  show = true,
  fairPrice,
  chartWidth,
  pair,
}) {
  const fairDis = xScale(fairPrice || chartWidth / 2);
  const leftDis = useMemo(() => (data ? xScale(data.price) : fairDis), [data, fairDis, xScale]);
  const top = useMemo(() => (data ? yScale(data.base) : chartHeight / 2), [chartHeight, data, yScale]);
  const translateX = useMemo(() => {
    if (left) {
      if (leftDis + 144 > fairDis) {
        return true;
      }
    } else {
      if (leftDis - 144 > fairDis) {
        return true;
      }
    }
    return false;
  }, [fairDis, left, leftDis]);
  const pi = useMemo(() => (data && fairPrice ? (fairPrice - data.price) / fairPrice : 0), [data, fairPrice]);
  const styles = useMemo(
    () => ({
      left: leftDis,
      top: top,
      opacity: 1,
      transform: `translate( ${translateX ? '-148px' : '2px'}, -100%)`,
    }),
    [leftDis, top, translateX],
  );
  const dotStyles = useMemo(
    () => ({
      left: leftDis,
      top: top,
      opacity: 1,
    }),
    [leftDis, top],
  );
  const { t } = useTranslation();
  if (!data || !show) {
    return null;
  }
  return (
    <>
      <div style={dotStyles} className={classNames('coin-price-chart-custom-tooltip__dot', className)} />
      <div
        style={styles}
        className={classNames('coin-price-chart-custom-tooltip', className, { translate: translateX, left })}>
        <div className="coin-price-chart-custom-tooltip__label">
          <div className="coin-price-chart-custom-tooltip__values">
            <dl>
              <dt> {t('common.tradeFormDetails.pi')}</dt>
              <dd>{formatPercentage({ percentage: -pi, prefix: -pi > 0 ? '+' : '', colorShader: false })}</dd>
            </dl>
            <dl>
              <dt> {t('common.price')}</dt>
              <dd>{WrappedBigNumber.from(data.price).formatPriceNumberWithTooltip({ isShowTBMK: true })}</dd>
            </dl>
            <dl>
              <dt>{t('common.size')}</dt>
              <dd>
                {WrappedBigNumber.from(data.base).formatNumberWithTooltip({
                  isShowTBMK: true,
                  suffix: pair?.rootInstrument.baseToken.symbol,
                })}{' '}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomTooltip;

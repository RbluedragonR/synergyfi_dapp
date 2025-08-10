/**
 * @description Component-AccountPieChart
 */
import './index.less';

import _ from 'lodash';
import { FC, useCallback, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';

import { THEME_ENUM } from '@/constants';
import { useTheme } from '@/features/global/hooks';
import { PieChartItem } from '@/types/chart';
import { ITooltipProps } from '@/types/pair';
import { formatDisplayNumber } from '@/utils/numberUtil';
import { disabledDarkColor, disabledLightColor } from '../constant';

export interface ValuesPieChartProps {
  chartList: PieChartItem[];
  size?: number;
  disabled?: boolean;
  noPadding?: boolean;
  onMouseOver?: (data: PieChartItem, index: number) => void;
  onMouseLeave?: (data: PieChartItem, index: number) => void;
  hideTooltip?: boolean;
  noHoverEffect?: boolean;
  isHollow?: boolean;
}
const ValuesPieChart: FC<ValuesPieChartProps> = function ({
  chartList,
  noPadding,
  disabled,
  hideTooltip,
  size = 64,
  noHoverEffect = false,
  isHollow = true,
  ...props
}) {
  const dataTheme = useTheme();
  const [activeIndex, setActiveIndex] = useState(-1);

  const onMouseOver = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any, index: number) => {
      if (disabled) {
        return;
      }
      if (data?.payload?.payload) {
        props.onMouseOver && props.onMouseOver(data.payload.payload, index);
      }
      setActiveIndex(index);
    },
    [props, disabled],
  );
  const onMouseLeave = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any, index: number) => {
      if (disabled) {
        return;
      }
      setActiveIndex(-1);
      if (data?.payload?.payload) {
        props.onMouseLeave && props.onMouseLeave(data.payload.payload, index);
      }
    },
    [props, disabled],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderActiveShape = useCallback((props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 3}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  }, []);
  const CustomTooltip = useCallback(
    (item: ITooltipProps) => {
      const { active, payload } = item;
      if (active && payload && payload.length) {
        const content = _.get(payload, [0]);
        const contentFill = _.get(content, ['payload', 'fill']);
        const dataItem = chartList.find((d) => d.name === _.get(content, ['name']));
        return (
          <div className="account-chart_custom-tooltip">
            <div className="account-chart_custom-tooltip-label">
              <div className="account-chart_custom-tooltip-dot" style={{ background: contentFill }}></div>
              {dataItem?.name}
            </div>
            <div className="account-chart_custom-tooltip__item">
              ${formatDisplayNumber({ num: dataItem?.value || 0, type: 'price', isShowTBMK: true })}
            </div>
          </div>
        );
      }

      return null;
    },
    [chartList],
  );

  return (
    <div
      className="syn-values-pie-chart"
      style={{ width: noPadding ? size : size + 20, height: noPadding ? size : size + 16 }}>
      <ResponsiveContainer>
        <PieChart margin={{ top: 0, bottom: 0 }}>
          <Pie
            data={chartList}
            innerRadius={isHollow ? size / 4.3 : undefined}
            outerRadius={size / 2}
            paddingAngle={chartList.length > 1 ? 0.5 : 0}
            dataKey="value"
            minAngle={0}
            cornerRadius={2.5}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseOver={noHoverEffect ? undefined : onMouseOver}
            onMouseLeave={noHoverEffect ? undefined : onMouseLeave}>
            {chartList.map((entry, index) => {
              let color = entry.color;
              if (disabled) {
                color = dataTheme.dataTheme === THEME_ENUM.DARK ? disabledDarkColor : disabledLightColor;
              }
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Pie>
          {false && !hideTooltip && !disabled && (
            <Tooltip animationDuration={0} viewBox={{ width: 120 }} position={{ y: 80 }} content={<CustomTooltip />} />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ValuesPieChart;

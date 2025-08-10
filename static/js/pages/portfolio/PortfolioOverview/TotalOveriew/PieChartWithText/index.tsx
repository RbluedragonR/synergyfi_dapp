import { ReactComponent as IconPnl } from '@/assets/svg/total-pnl-icon.svg';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { ComponentProps, ReactNode } from 'react';
import ValuesPieChart, { ValuesPieChartProps } from '../ValuesPieChart';
import './index.less';
type PieChartWithTextProps = {
  isPnl?: boolean;
  valuesPieChartProps?: ValuesPieChartProps;
  valuesPieChartContainerProps?: ComponentProps<'div'>;
  title?: ReactNode;
  value?: ReactNode;
  size?: 'medium' | 'small';
  tooltipTitle?: ReactNode;
};
export default function PieChartWithText({
  isPnl,
  valuesPieChartContainerProps,
  valuesPieChartProps,
  title,
  value,
  tooltipTitle,
  size = 'medium',
}: PieChartWithTextProps): JSX.Element {
  return (
    <div className={classNames('syn-pie-chart-with-text', size)}>
      <Tooltip placement="rightTop" title={tooltipTitle} rootClassName="syn-pie-chart-with-text-tooltip">
        {isPnl && (
          <div
            {...valuesPieChartContainerProps}
            className={classNames('syn-pie-chart-with-text-pie-chart-wrap syn-pie-chart-with-text-pie-chart-pnl-wrap')}>
            <IconPnl />
          </div>
        )}
        {valuesPieChartProps && (
          <div
            {...valuesPieChartContainerProps}
            className={classNames('syn-pie-chart-with-text-pie-chart-wrap', valuesPieChartContainerProps?.className)}>
            <ValuesPieChart
              size={(size === 'medium' && 100) || (size === 'small' && 45) || 100}
              {...valuesPieChartProps}
            />
          </div>
        )}
      </Tooltip>

      <div className="syn-pie-chart-with-text-right">
        <div className="syn-pie-chart-with-text-title">
          {title && <div className="syn-pie-chart-with-text-title-top">{title}</div>}
          {value && <div className="syn-pie-chart-with-text-title-bottom">{value}</div>}
        </div>
      </div>
    </div>
  );
}

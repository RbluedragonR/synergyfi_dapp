import { CalenderIcon } from '@/assets/svg';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import './index.less';
export const CampaignCardPeriod = ({
  period,
  className,
  width,
  ...others
}: ComponentProps<'div'> & { period: string; width?: number }) => {
  return (
    <div {...others} className={classNames('syn-campaign-card-period', className)}>
      <CalenderIcon width={width} />
      <span>{period}</span>
    </div>
  );
};

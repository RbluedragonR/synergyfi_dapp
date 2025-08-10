import classNames from 'classnames';
import { ComponentProps } from 'react';
import './index.less';
export const CampaignCardTitle = ({ className, ...others }: ComponentProps<'h1'>) => {
  return (
    <h1
      {...others}
      title={JSON.stringify(others.children)}
      className={classNames('syn-campaign-card-title', className)}
    />
  );
};

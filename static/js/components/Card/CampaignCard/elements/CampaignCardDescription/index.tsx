import classNames from 'classnames';
import parse from 'html-react-parser';
import { ComponentProps } from 'react';
import './index.less';
export const CampaignCardDescription = ({ className, ...others }: ComponentProps<'h1'>) => {
  return (
    <div
      {...others}
      className={classNames('syn-campaign-card-description', className)}
      title={JSON.stringify(others.children)}>
      {parse(others.children as string)}
    </div>
  );
};

/**
 * @description Component-CampaignRefTag
 */
import './index.less';

import classNames from 'classnames';
import React, { FC } from 'react';

import Tag from '@/components/Tag';
import { Tooltip } from '@/components/ToolTip';
import { useTheme } from '@/features/global/hooks';

import { useNavigate } from 'react-router-dom';
import { ReactComponent as IconListRewards } from './assets/icon_list_rewards.svg';
import { ReactComponent as IconLink } from './assets/solar_square-top-down-linear.svg';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  campaignTitle?: string;
  campaignBonus?: number;
}

const CampaignRefTag: FC<IPropTypes> = function ({ campaignBonus, campaignTitle }) {
  const { dataTheme } = useTheme();
  const navigate = useNavigate();
  if (!campaignBonus) return null;
  return (
    <div className="syn-campaign-ref-tag-container">
      <Tooltip title={campaignTitle}>
        <Tag
          bordered={true}
          className={classNames('syn-campaign-ref-tag boost', dataTheme)}
          onClick={(e) => {
            navigate('/campaign');
            e.stopPropagation();
          }}>
          <IconListRewards />
          <span>{campaignBonus}</span>
          <IconLink />
        </Tag>
      </Tooltip>
    </div>
  );
};

export default CampaignRefTag;

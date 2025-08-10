import { useMediaQueryDevice } from '@/components/MediaQuery';
import { CampaignData } from '@/constants/campaign';
import SkeletonButton from 'antd/es/skeleton/Button';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { CampaignCardDescription } from '../elements/CampaignCardDescription';
import { CampaignCardPeriod } from '../elements/CampaignCardPeriod';
import { CampaignCardTitle } from '../elements/CampaignTitle';
import CampaignCardContainer from '../elements/common';
import './index.less';

export const ExpiredCampaignCard = ({
  campaignData,
  className,
  isSkeleton = false,
  ...others
}: ComponentProps<'div'> & { campaignData: CampaignData; isSkeleton?: boolean }) => {
  const { deviceType } = useMediaQueryDevice();

  if (isSkeleton) {
    return (
      <CampaignCardContainer
        {...others}
        href={campaignData.cardUrl}
        className={classNames('syn-expired-campaign-card', 'syn-expired-campaign-card-skeleton', className)}>
        {deviceType !== 'mobile' && (
          <div className="syn-expired-campaign-card-left-wrapper">
            <SkeletonButton
              className="syn-expired-campaign-card-skeleton-img"
              size="small"
              shape="round"
              active
              block
            />
          </div>
        )}
        <div className="syn-expired-campaign-card-right">
          <div className="syn-expired-campaign-card-content">
            <SkeletonButton
              className="syn-expired-campaign-card-skeleton-title"
              size="small"
              shape="round"
              active
              block
            />
            {deviceType !== 'mobile' && (
              <SkeletonButton
                className="syn-expired-campaign-card-skeleton-description"
                size="small"
                shape="round"
                active
                block
              />
            )}
          </div>
          <SkeletonButton
            className="syn-expired-campaign-card-skeleton-period"
            size="small"
            shape="round"
            active
            block
          />
        </div>
      </CampaignCardContainer>
    );
  }

  return (
    <CampaignCardContainer
      {...others}
      href={campaignData.cardUrl}
      className={classNames('syn-expired-campaign-card', className)}>
      {deviceType !== 'mobile' && (
        <div className="syn-expired-campaign-card-left-wrapper">
          <div
            className="syn-expired-campaign-card-left"
            style={{
              backgroundImage: `url(${campaignData.imgSrc})`,
            }}></div>
        </div>
      )}
      <div className="syn-expired-campaign-card-right">
        <div className="syn-expired-campaign-card-content">
          <CampaignCardTitle>{campaignData.title}</CampaignCardTitle>
          {deviceType !== 'mobile' && <CampaignCardDescription>{campaignData.description}</CampaignCardDescription>}
        </div>
        <CampaignCardPeriod period={campaignData.period} />
      </div>
    </CampaignCardContainer>
  );
};

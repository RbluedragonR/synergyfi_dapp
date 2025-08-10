import { CampaignData } from '@/constants/campaign';
import SkeletonButton from 'antd/es/skeleton/Button';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { CampaignCardPeriod } from '../CampaignCardPeriod';
import { CampaignCardTitle } from '../CampaignTitle';
import CampaignCardContainer from '../common';
import './index.less';
export const OngoingUpcomingMobileCampaignCard = ({
  campaignData,
  className,
  isSkeleton = false,
  ...others
}: ComponentProps<'div'> & { campaignData: CampaignData; isSkeleton?: boolean }) => {
  if (isSkeleton) {
    return (
      <CampaignCardContainer
        {...others}
        href={campaignData.cardUrl}
        className={classNames(
          'syn-ongoing-upcoming-mobile-campaign-card',
          'syn-ongoing-upcoming-mobile-campaign-card-skeleton',
          className,
        )}>
        <SkeletonButton
          className="syn-ongoing-upcoming-mobile-campaign-card-skeleton-img"
          size="small"
          shape="round"
          active
          block
        />
        <div className="syn-ongoing-upcoming-mobile-campaign-card-right">
          <SkeletonButton
            className="syn-ongoing-upcoming-mobile-campaign-card-skeleton-title1"
            size="small"
            shape="round"
            active
            block
          />
          <SkeletonButton
            className="syn-ongoing-upcoming-mobile-campaign-card-skeleton-title2"
            size="small"
            shape="round"
            active
            block
          />
          <SkeletonButton
            className="syn-ongoing-upcoming-mobile-campaign-card-skeleton-title3"
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
      className={classNames('syn-ongoing-upcoming-mobile-campaign-card', className)}>
      <div
        className="syn-ongoing-upcoming-mobile-campaign-card-left"
        style={{
          backgroundImage: `url(${campaignData.imgSrc})`,
        }}
      />
      <div className="syn-ongoing-upcoming-mobile-campaign-card-right">
        <CampaignCardTitle>{campaignData.title}</CampaignCardTitle>
        <CampaignCardPeriod period={campaignData.period} />
      </div>
    </CampaignCardContainer>
  );
};

import { RightArrow } from '@/assets/svg';
import { Button } from '@/components/Button';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { CampaignData, getTagColor } from '@/constants/campaign';
import { setSelectedLeaderboardCampaignId } from '@/features/campaign/slice';
import { useAppDispatch } from '@/hooks';
import { useDappChainConfig } from '@/hooks/web3/useChain';
import SkeletonButton from 'antd/es/skeleton/Button';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { CampaignCardDescription } from '../elements/CampaignCardDescription';
import { CampaignCardPeriod } from '../elements/CampaignCardPeriod';
import { CampaignCardTitle } from '../elements/CampaignTitle';
import CampaignCardContainer, { CampaignCardTag, CampaignCardTags, CampaignLeaderboardBtn } from '../elements/common';
import './index.less';
export default function CampaignBannerCard({
  campaignData,
  className,
  isSkeleton = false,
  ...others
}: ComponentProps<'div'> & { campaignData: CampaignData; btnRequired?: boolean; isSkeleton?: boolean }) {
  const { isMobile } = useMediaQueryDevice();
  const chainConfig = useDappChainConfig(campaignData.chainId || undefined);
  const dispatch = useAppDispatch();
  if (isSkeleton) {
    return (
      <CampaignCardContainer
        {...others}
        href={campaignData.cardUrl}
        className={classNames('syn-campaign-banner-card', 'syn-campaign-banner-card-skeleton', className)}>
        <div
          className="syn-campaign-banner-card-top"
          style={{
            backgroundColor: 'var(--skeleton, linear-gradient(90deg, #EFF7F7 0%, #E1F3F2 64.58%, #EFF7F7 100%))',
          }}
        />
        <div className="syn-campaign-banner-card-bottom">
          {isMobile ? (
            <>
              <SkeletonButton
                className="syn-campaign-banner-card-skeleton-title"
                size="small"
                shape="round"
                active
                block
              />
              <SkeletonButton
                className="syn-campaign-banner-card-skeleton-description1"
                size="small"
                shape="round"
                active
                block
              />
              <SkeletonButton
                className="syn-campaign-banner-card-skeleton-description2"
                size="small"
                shape="round"
                active
                block
              />
              <div className="syn-campaign-banner-card-skeleton-tags">
                {new Array(3).fill(0).map((_, i) => {
                  return (
                    <SkeletonButton
                      className="syn-campaign-banner-card-skeleton-tag"
                      size="small"
                      shape="round"
                      active
                      block
                      key={`syn-campaign-detail-card-skeleton-tag_${i}`}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="syn-campaign-banner-card-details">
              <SkeletonButton
                className="syn-campaign-banner-card-skeleton-title"
                size="small"
                shape="round"
                active
                block
              />
              <SkeletonButton
                className="syn-campaign-banner-card-skeleton-description1"
                size="small"
                shape="round"
                active
                block
              />
              <SkeletonButton
                className="syn-campaign-banner-card-skeleton-description2"
                size="small"
                shape="round"
                active
                block
              />
              <div className="syn-campaign-banner-card-skeleton-tags">
                {new Array(3).fill(0).map((_, i) => {
                  return (
                    <SkeletonButton
                      className="syn-campaign-banner-card-skeleton-tag"
                      size="small"
                      shape="round"
                      active
                      block
                      key={`syn-campaign-detail-card-skeleton-tag_${i}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
          <SkeletonButton
            className="syn-campaign-banner-card-skeleton-period"
            size="small"
            shape="round"
            active
            block
          />
          <SkeletonButton className="syn-campaign-banner-card-skeleton-btn" size="small" shape="round" active block />
        </div>
      </CampaignCardContainer>
    );
  }
  return (
    <CampaignCardContainer
      {...others}
      href={campaignData.cardUrl}
      className={classNames('syn-campaign-banner-card', className)}>
      <div
        className="syn-campaign-banner-card-top"
        style={{
          backgroundImage: `url(${campaignData.imgSrc})`,
        }}>
        {campaignData.showLeaderBoard && (
          <CampaignLeaderboardBtn
            onClick={() => {
              dispatch(setSelectedLeaderboardCampaignId({ selectedLeaderboardCampaignId: campaignData.id }));
            }}
          />
        )}
      </div>
      <div className="syn-campaign-banner-card-bottom">
        {isMobile ? (
          <>
            <CampaignCardTitle>{campaignData.title}</CampaignCardTitle>
            <CampaignCardDescription>{campaignData.description}</CampaignCardDescription>
            <CampaignCardTags>
              {campaignData.tags.map(({ url, name: title }, i) => {
                return (
                  <CampaignCardTag {...getTagColor(i)} href={url} key={i}>
                    {title}
                  </CampaignCardTag>
                );
              })}
            </CampaignCardTags>
          </>
        ) : (
          <div className="syn-campaign-banner-card-details">
            <CampaignCardTitle>{campaignData.title}</CampaignCardTitle>
            <CampaignCardDescription>{campaignData.description}</CampaignCardDescription>
            <CampaignCardTags>
              {campaignData.tags.map(({ url, name: title }, i) => {
                return (
                  <CampaignCardTag {...getTagColor(i)} href={url} key={i}>
                    {title}
                  </CampaignCardTag>
                );
              })}
            </CampaignCardTags>
          </div>
        )}

        <CampaignCardPeriod width={14} period={campaignData.period} />
        <Button type="primary" href={campaignData.button.url}>
          {campaignData.chainId && chainConfig?.network.icon && <img src={chainConfig?.network.icon} />}
          {campaignData.button.title || 'Participate Now'}
          <RightArrow />
        </Button>
      </div>
    </CampaignCardContainer>
  );
}

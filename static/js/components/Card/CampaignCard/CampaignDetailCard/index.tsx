import { RightArrow } from '@/assets/svg';
import { Button } from '@/components/Button';
import { CampaignData, CampaignStatus, getTagColor } from '@/constants/campaign';
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
export default function CampaignDetailCard({
  campaignData,
  className,
  btnRequired = false,
  isSkeleton = false,
  ...others
}: ComponentProps<'div'> & { campaignData: CampaignData; btnRequired?: boolean; isSkeleton?: boolean }) {
  const chainConfig = useDappChainConfig(campaignData.chainId || undefined);
  const dispatch = useAppDispatch();

  if (isSkeleton) {
    return (
      <div className="syn-campaign-detail-card-wrapper">
        <CampaignCardContainer
          {...others}
          href={campaignData.cardUrl}
          style={{
            height: btnRequired ? 454 : 430,
          }}
          className={classNames('syn-campaign-detail-card', 'syn-campaign-detail-card-skeleton', className)}>
          <div
            className="syn-campaign-detail-card-top"
            style={{
              background: 'var(--skeleton, linear-gradient(90deg, #EFF7F7 0%, #E1F3F2 64.58%, #EFF7F7 100%))',
            }}
          />
          <div
            className="syn-campaign-detail-card-bottom-wrapper"
            style={{
              paddingBottom: 24,
              height: 232,
            }}>
            <div className="syn-campaign-detail-card-bottom">
              <SkeletonButton
                className="syn-campaign-detail-card-skeleton-title"
                size="small"
                shape="round"
                active
                block
              />
              <SkeletonButton
                className="syn-campaign-detail-card-skeleton-description"
                size="small"
                shape="round"
                active
                block
              />

              <div className="syn-campaign-detail-card-skeleton-tags">
                {new Array(3).fill(0).map((_, i) => {
                  return (
                    <SkeletonButton
                      className="syn-campaign-detail-card-skeleton-tag"
                      size="small"
                      shape="round"
                      active
                      block
                      key={`syn-campaign-detail-card-skeleton-tag_${i}`}
                    />
                  );
                })}
              </div>
              <SkeletonButton
                className="syn-campaign-detail-card-skeleton-period"
                size="small"
                shape="round"
                active
                block
              />
            </div>
          </div>
        </CampaignCardContainer>
      </div>
    );
  }
  return (
    <div className="syn-campaign-detail-card-wrapper">
      <CampaignCardContainer
        {...others}
        href={campaignData.cardUrl}
        style={{
          height: btnRequired ? 454 : 430,
        }}
        className={classNames('syn-campaign-detail-card', className)}>
        {/* <CampaignStatusTag campaignStatus={campaignData.status} /> */}
        <div
          className="syn-campaign-detail-card-top"
          style={{
            backgroundImage: `url(${campaignData.imgSrc})`,
          }}>
          {campaignData.showLeaderBoard && campaignData.status === CampaignStatus.Ongoing && (
            <CampaignLeaderboardBtn
              onClick={() => {
                dispatch(setSelectedLeaderboardCampaignId({ selectedLeaderboardCampaignId: campaignData.id }));
              }}
            />
          )}
        </div>
        <div
          className="syn-campaign-detail-card-bottom-wrapper"
          style={{
            paddingBottom: btnRequired ? 48 : 24,
            height: btnRequired ? 232 : 208,
          }}>
          <div className="syn-campaign-detail-card-bottom">
            <div className="syn-campaign-detail-card-bottom-text">
              <CampaignCardTitle>{campaignData.title}</CampaignCardTitle>
              <CampaignCardDescription>{campaignData.description}</CampaignCardDescription>
            </div>

            <CampaignCardTags>
              {campaignData.tags.map(({ url, name: title }, i) => {
                return (
                  <CampaignCardTag href={url} {...getTagColor(i)} key={i}>
                    {title}
                  </CampaignCardTag>
                );
              })}
            </CampaignCardTags>
            <CampaignCardPeriod width={14} period={campaignData.period} />
          </div>
        </div>
      </CampaignCardContainer>
      {btnRequired && (
        <Button type="primary" href={campaignData.button.url}>
          {campaignData.chainId && chainConfig?.network.icon && <img src={chainConfig?.network.icon} />}
          {campaignData.button.title || 'Participate Now'}
          <RightArrow />
        </Button>
      )}
    </div>
  );
}

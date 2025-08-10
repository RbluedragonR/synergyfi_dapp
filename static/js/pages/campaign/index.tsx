import CampaignBannerCard from '@/components/Card/CampaignCard/CampaignBannerCard';
import { ExpiredCampaignCard } from '@/components/Card/CampaignCard/ExpiredCampaignCard';
import { default as OngoingCampaignCard } from '@/components/Card/CampaignCard/OngoingCampaignCard';
import UpcomingCampaignCard from '@/components/Card/CampaignCard/UpcomingCampaignCard';
import { useMockDevTool } from '@/components/Mock';
import CampaignLeaderboardModal from '@/components/Modal/CampaignLeaderboardModal';
import CampaignTitleText from '@/components/Text/CampaignTitleText';
import { CampaignStatus } from '@/constants/campaign';
import { demoCampaignData } from '@/features/campaign/GlobalEffect';
import { useCampaignsData } from '@/features/campaign/hook';
import _ from 'lodash';
import { useMemo } from 'react';
import './index.less';
export default function CampaignPage() {
  const { groupedCampaignsData, isCampaignsDataFetched } = useCampaignsData();
  const { isMockSkeleton } = useMockDevTool();
  const isSkeleton = useMemo(() => {
    return !isCampaignsDataFetched || isMockSkeleton;
  }, [isCampaignsDataFetched, isMockSkeleton]);
  const { banner, upcoming, ongoing, expired } = useMemo(() => {
    if (isSkeleton) {
      return {
        banner: new Array(1).fill({ ...demoCampaignData, isBanner: true }).map((item, i) => {
          return {
            ...item,
            id: `${i}_mock_banner`,
          };
        }),
        ongoing: new Array(3).fill({ ...demoCampaignData, isBanner: false }).map((item, i) => {
          return {
            ...item,
            id: `${i}_mock_ongoing`,
          };
        }),
        upcoming: new Array(3).fill({ ...demoCampaignData, isBanner: false }).map((item, i) => {
          return {
            ...item,
            id: `${i}_mock_upcoming`,
          };
        }),
        expired: new Array(6).fill({ ...demoCampaignData, isBanner: false }).map((item, i) => {
          return {
            ...item,
            id: `${i}_mock_expired`,
          };
        }),
      };
    }
    return {
      banner: _.cloneDeep(
        groupedCampaignsData?.Ongoing?.filter((data) => data.isBanner)?.sort((a, b) => a.bannerOrder - b.bannerOrder),
      ),
      ongoing: _.cloneDeep(
        groupedCampaignsData?.Ongoing?.filter((data) => !data.isBanner).sort(
          (a, b) => (a?.endTimestamp || Infinity) - (b?.endTimestamp || Infinity),
        ),
      ),
      upcoming: _.cloneDeep(groupedCampaignsData?.Upcoming?.sort((a, b) => b.startTimestamp - a.startTimestamp)),
      expired: _.cloneDeep(
        groupedCampaignsData?.Expired?.sort((a, b) => (b.endTimestamp || 0) - (a.endTimestamp || 0)),
      ),
    };
  }, [groupedCampaignsData?.Expired, groupedCampaignsData?.Ongoing, groupedCampaignsData?.Upcoming, isSkeleton]);
  return (
    <div className="syn-campaign-page">
      <div className="syn-campaign-page-banner">
        {banner?.map((data) => (
          <CampaignBannerCard campaignData={data} key={data.id} isSkeleton={isSkeleton} />
        ))}
      </div>
      {ongoing && ongoing?.length > 0 && (
        <div className="syn-campaign-page-ongoing">
          <CampaignTitleText campaignStatus={CampaignStatus.Ongoing} />
          <div className="syn-campaign-page-ongoing-content">
            {ongoing?.map((data) => (
              <OngoingCampaignCard campaignData={data} key={data.id} isSkeleton={isSkeleton} />
            ))}
          </div>
        </div>
      )}
      {upcoming && upcoming?.length > 0 && (
        <div className="syn-campaign-page-upcoming">
          <CampaignTitleText campaignStatus={CampaignStatus.Upcoming} />
          <div className="syn-campaign-page-upcoming-content">
            {upcoming.map((data) => (
              <UpcomingCampaignCard campaignData={data} key={data.id} isSkeleton={isSkeleton} />
            ))}
          </div>
        </div>
      )}
      {expired && expired?.length > 0 && (
        <div className="syn-campaign-page-expired">
          <CampaignTitleText campaignStatus={CampaignStatus.Expired} />
          <div className="syn-campaign-page-expired-content">
            {expired.map((data) => (
              <ExpiredCampaignCard campaignData={data} key={data.id} isSkeleton={isSkeleton} />
            ))}
          </div>
        </div>
      )}
      <div style={{ paddingBottom: 48 }}> </div>
      <CampaignLeaderboardModal />
    </div>
  );
}

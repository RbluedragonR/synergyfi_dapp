import { useMediaQueryDevice } from '@/components/MediaQuery';
import { CampaignData } from '@/constants/campaign';
import CampaignDetailCard from '../CampaignDetailCard';
import { OngoingUpcomingMobileCampaignCard } from '../elements/OngoingUpcomingMobileCampaignCard';
import './index.less';
export default function OngoingCampaignCard({
  campaignData,
  isSkeleton = false,
}: {
  campaignData: CampaignData;
  isSkeleton?: boolean;
}) {
  const { isMobile } = useMediaQueryDevice();
  return isMobile ? (
    <OngoingUpcomingMobileCampaignCard campaignData={campaignData} isSkeleton={isSkeleton} />
  ) : (
    <CampaignDetailCard campaignData={campaignData} btnRequired isSkeleton={isSkeleton} />
  );
}

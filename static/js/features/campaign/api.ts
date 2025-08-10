import { CampaignLeaderboardData, CampaignRawData } from '@/constants/campaign';
import { axiosGet } from '@/utils/axios';
import { campaignRawToData } from '@/utils/campaign';
import _ from 'lodash';

export const campaignApiLeaderboardUrl = 'https://api.synfutures.com/v3/public/campaign/';
export const campaignApiUrl = 'https://api.synfutures.com/v3/public/campaign';
//`https://api.synfutures.com/v3/api/campaign/dashboard/${campaignId}?address=${userAddress}`;

export const getCampaigns = async () => {
  const res = await axiosGet({
    url: campaignApiUrl,
  });
  const campaignsRawData = res.data?.data as CampaignRawData[];
  const campaignsData = campaignsRawData?.map((item) => campaignRawToData(item));

  return campaignsData;
};

export const getCampaignLeaderboard = async (campaignId: number, userAddress: string) => {
  const res = await axiosGet({
    url: `${campaignApiLeaderboardUrl}${campaignId}`,
    config: {
      params: { address: userAddress },
    },
  });
  const campaignLeaderboardDataWithId = res.data?.data as CampaignLeaderboardData & { id: number };
  const campaignLeaderboardData = _.omit(campaignLeaderboardDataWithId, 'id');
  return campaignLeaderboardData as CampaignLeaderboardData;
};

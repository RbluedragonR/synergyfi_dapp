import { QUERY_KEYS } from '@/constants/query';
import { useQuery } from '@tanstack/react-query';
import { getCampaignLeaderboard, getCampaigns } from './api';

export const useCampaigns = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPAIGN.CAMPAIGNS(),
    queryFn: () => getCampaigns(),
  });
};

export const useCampaignLeaderboard = (campaignId: number | undefined, userAddress: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPAIGN.LEADERBOARD(campaignId, userAddress),
    queryFn: async () => {
      if (userAddress && campaignId) return getCampaignLeaderboard(campaignId, userAddress);
    },
    enabled: userAddress !== undefined && campaignId !== undefined && campaignId !== null,
  });
};

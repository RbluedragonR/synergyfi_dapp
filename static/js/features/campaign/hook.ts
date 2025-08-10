import _ from 'lodash';
import { useCampaigns } from './query';

export function useCampaignsData() {
  const { data: campaigns, isFetched } = useCampaigns();
  const groupedCampaignsData = campaigns && _.groupBy(campaigns, ({ status }) => status);

  return { groupedCampaignsData, isCampaignsDataFetched: isFetched };
}

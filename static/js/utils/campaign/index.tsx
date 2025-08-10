import { CampaignData, CampaignRawData, CampaignStatus } from '@/constants/campaign';
import { CHAIN_ID } from '@/constants/chain';
import moment from 'moment';
export const campaignRawToData = (rawData: CampaignRawData): CampaignData => {
  const isBanner = rawData.isBanner === 0 ? false : true;
  return {
    id: Number(rawData.id),
    title: rawData.title,
    description: rawData.description,
    tags: rawData.tags,
    bannerOrder: rawData.bannerOrder,
    chainId:
      rawData.chainId !== 'all' && Object.values(CHAIN_ID).includes(Number(rawData.chainId))
        ? Number(rawData.chainId)
        : null,
    isBanner,
    status: rawData.status as CampaignStatus,
    period: rawData.endTime
      ? `${moment(rawData.startTime).format('Do MMM')}~${moment(rawData.endTime).format('Do MMM YYYY')}, UTC`
      : `Start at ${moment(rawData.startTime).format('Do MMM YYYY')}, UTC`,
    button: { title: rawData.buttonTitle, url: rawData.buttonClickUrl },
    cardUrl: rawData.cardClickUrl,
    imgSrc: rawData.cardImageUrl,
    startTimestamp: rawData.startTime,
    endTimestamp: rawData.endTime,
    leaderboardDes: rawData.leadBoardDes,
    showLeaderBoard: rawData.showLeadBoard === 1 ? true : false,
  };
};

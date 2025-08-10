import { useCampaigns } from '../query';

export const demoCampaignData = {
  leaderboardDes:
    'Meme Perp Carinival Meme Perp Carinival Meme Perp Carinival Meme Perp Carinival Meme Perp Carinival Meme Perp Carinival',
  showLeaderBoard: true,
  id: 7,
  title:
    'Meme Perp Carinival Meme Perp Carinival Meme Perp Carinival Meme Perp Carinival Meme Perp Carinival Meme Perp Carinival',
  description:
    'Meme Perp Carnival is here with a $35,000 price pool! We are launching an exciting trading/LP competition with $BOOMER, $BUILD, $CONDO, $MIGGLES, $MOG,Meme Perp Carnival is here with a $35,000 price pool! We are launching an exciting trading/LP competition with $BOOMER, $BUILD, $CONDO, $MIGGLES, $MOG,Meme Perp Carnival is here with a $35,000 price pool! We are launching an exciting trading/LP competition with $BOOMER, $BUILD, $CONDO, $MIGGLES, $MOG',
  tagsTitle: 'BOOMER/WETH,BUILD/WETH,CONDO/WETH,MIGGLES/WETH,MOG/WETH',
  tagsUrl:
    '/WETH-BOOMER-DEXV2-Perpetual,/BUILD-WETH-EMG-Perpetual,/CONDO-WETH-DEXV2-Perpetual,/MIGGLES-WETH-DEXV2-Perpetual,/Mog-WETH-EMG-Perpetual',
  isBanner: false,
  status: 'Ongoing',
  period: '13th Aug - 31th Aug',
  startDate: '2024-8-15 00:00:00',
  endDate: '2024-9-15 11:00:00',
  cardUrl: '',

  buttonUrl: 'https://app.galxe.com/quest/synfutures/GCgebtv1z8',
  tags: [
    {
      url: '/WETH-BOOMER-DEXV2-Perpetual',
      title: 'BOOMER/WETH',
    },
    {
      url: '/BUILD-WETH-EMG-Perpetual',
      title: 'BUILD/WETH',
    },
    {
      url: '/CONDO-WETH-DEXV2-Perpetual',
      title: 'CONDO/WETH',
    },
    {
      url: '/MIGGLES-WETH-DEXV2-Perpetual',
      title: 'MIGGLES/WETH',
    },
    {
      url: '/Mog-WETH-EMG-Perpetual',
      title: 'MOG/WETH',
    },
    {
      url: '/CONDO-WETH-DEXV2-Perpetual',
      title: 'CONDO/WETH',
    },
    {
      url: '/MIGGLES-WETH-DEXV2-Perpetual',
      title: 'MIGGLES/WETH',
    },
    {
      url: '/Mog-WETH-EMG-Perpetual',
      title: 'MOG/WETH',
    },
    {
      url: '/CONDO-WETH-DEXV2-Perpetual',
      title: 'CONDO/WETH',
    },
    {
      url: '/MIGGLES-WETH-DEXV2-Perpetual',
      title: 'MIGGLES/WETH',
    },
    {
      url: '/Mog-WETH-EMG-Perpetual',
      title: 'MOG/WETH',
    },
    {
      url: '/CONDO-WETH-DEXV2-Perpetual',
      title: 'CONDO/WETH',
    },
    {
      url: '/MIGGLES-WETH-DEXV2-Perpetual',
      title: 'MIGGLES/WETH',
    },
    {
      url: '/Mog-WETH-EMG-Perpetual',
      title: 'MOG/WETH',
    },
  ],
  bannerOrder: 1,
  imgSrc: 'https://api.synfutures.com/ipfs/v2-config/v3/images/6.png',
  button: {
    title: '',
    url: 'https://app.galxe.com/quest/synfutures/GCgebtv1z8',
  },
  startTimestamp: 1723651200,
  endTimestamp: 1726369200,
};

export default function CampaignGlobalEffect(): null {
  useCampaigns();
  return null;
}

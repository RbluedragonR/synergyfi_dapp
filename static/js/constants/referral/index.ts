import { ClaimTokenResponse } from '@/features/referral/api';

export const REFERRAL_BASE_URL =
  process.env.REACT_APP_API_ENV === 'dev'
    ? 'https://test.api.iftl.info/v3/public/referral'
    : 'https://api.synfutures.com/v3/public/referral';

export const mockClaimableListData: ClaimTokenResponse = {
  commissionRebateReward: {
    WETH: {
      amount: '0.000000000000000011',
      proof: ['0x13ee4991b344579a5ae967b756ee7082e832a63c680019ff4088db9f2598d937'],
    },
    // USDC: {
    //   amount: '546.0719679889692',
    //   proof: ['0x36edbe2514d0cafd5459d7dc4e934ed1629c0ab47c6c64eaf6fbfc6083dc1c01'],
    // },
  },
  feeRebateReward: {
    WETH: {
      amount: '0.000000000000000011',
      proof: ['0x13ee4991b344579a5ae967b756ee7082e832a63c680019ff4088db9f2598d937'],
    },
  },
};

export const REFERRAL_PAGE_SIZE = 5;
export const REFERRAL_FEE_REBATE_PERCENTAGE = 5;
export const REFERRAL_RULES_LINK = 'https://docs.synfutures.com/';
export const REFERRAL_LEARN_MORE_LINK = 'https://docs.synfutures.com/';

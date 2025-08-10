import { REFERRAL_BASE_URL, REFERRAL_PAGE_SIZE } from '@/constants/referral';
import { IPaginationResponse } from '@/types/referral';
import { IAffiliateOverview, ICommissionDistribution, IInvitee } from '@/types/referral/affiliates';
import {
  IBindReferralRequest,
  IBindReferralResponse,
  IFeeRebateHistory,
  ITraderOverview,
} from '@/types/referral/trader';
import { axiosGet, axiosPost } from '@/utils/axios';

// API Functions
export const getTraderOverview = async (chainId: number, address: string): Promise<ITraderOverview> => {
  const response = await axiosGet({
    url: `${REFERRAL_BASE_URL}/traders/overview`,
    config: {
      params: { address, chainId },
    },
  });
  return response.data.data;
};

export const getFeeRebateHistory = async (
  chainId: number,
  address: string,
  page = 1,
  limit = REFERRAL_PAGE_SIZE,
): Promise<IPaginationResponse<IFeeRebateHistory>> => {
  const response = await axiosGet({
    url: `${REFERRAL_BASE_URL}/traders/fee-rebate-history`,
    config: {
      params: { address, page, limit, chainId },
    },
  });
  return response.data.data;
};

export const getAffiliateOverview = async (chainId: number, address: string): Promise<IAffiliateOverview> => {
  const response = await axiosGet({
    url: `${REFERRAL_BASE_URL}/affiliates/overview`,
    config: {
      params: { address, chainId },
    },
  });

  return response.data.data;
};

export const getCommissionHistory = async (
  chainId: number,
  address: string,
  page = 1,
  limit = REFERRAL_PAGE_SIZE,
): Promise<IPaginationResponse<ICommissionDistribution>> => {
  const response = await axiosGet({
    url: `${REFERRAL_BASE_URL}/affiliates/commission-history`,
    config: {
      params: { address, page, limit, chainId },
    },
  });
  return response.data.data;
};

export const getInvitees = async (
  chainId: number,
  address: string,
  page = 1,
  limit = REFERRAL_PAGE_SIZE,
): Promise<IPaginationResponse<IInvitee>> => {
  const response = await axiosGet({
    url: `${REFERRAL_BASE_URL}/affiliates/invitees`,
    config: {
      params: { address, page, limit, chainId },
    },
  });
  return response.data.data;
};

export const bindReferralCode = async (request: IBindReferralRequest): Promise<IBindReferralResponse> => {
  const response = await axiosPost({
    url: `${REFERRAL_BASE_URL}/traders/bind-referral`,
    data: request,
  });
  return response.data;
};

export type ClaimTokenResponse = {
  [type in 'commissionRebateReward' | 'feeRebateReward']?: {
    [tokenSymbol: string]: {
      amount: string;
      proof: string[];
    };
  };
};

export const getReferralAvailableTokenToClaimList = async (
  chainId: number,
  address: string,
): Promise<ClaimTokenResponse> => {
  const response = await axiosGet({
    url: `${REFERRAL_BASE_URL}/reward-proof`,
    config: {
      params: { address, chainId },
    },
  });
  return response.data.data;

  // return mockClaimableListData;
};

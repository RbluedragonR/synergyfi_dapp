import { AFFILIATE_TYPE } from '@/constants/affiliates';

// Query key getter functions
export const getTraderOverviewQueryKey = (chainId?: number, address?: string) => [
  'v3/public/referral/traders/overview',
  chainId?.toString(),
  address,
];
export const getFeeRebateHistoryQueryKey = (chainId?: number, address?: string, page?: number, limit?: number) => [
  'v3/public/referral/traders/fee-rebate-history',
  chainId?.toString(),
  address,
  page?.toString(),
  limit?.toString(),
];
export const getAffiliateOverviewQueryKey = (chainId?: number, address?: string) => [
  'v3/public/referral/affiliates/overview',
  chainId?.toString(),
  address,
];
export const getCommissionHistoryQueryKey = (chainId?: number, address?: string, page?: number, limit?: number) => [
  'v3/public/referral/affiliates/commission-history',
  chainId?.toString(),
  address,
  page?.toString(),
  limit?.toString(),
];
export const getInviteesQueryKey = (chainId?: number, address?: string, page?: number, limit?: number) => [
  'v3/public/referral/affiliates/invitees',
  chainId?.toString(),
  address,
  page?.toString(),
  limit?.toString(),
];
export const getReferralAvailableBalanceQueryKey = (type: AFFILIATE_TYPE, chainId?: number, address?: string) => [
  'v3/public/referral/available-balance',
  chainId,
  type,
  address,
];

export const getReferralClaimableTokensFromChainQueryKey = (
  type: AFFILIATE_TYPE,
  chainId?: number,
  address?: string,
) => ['v3/public/referral/claimable-proofs', chainId, type, address];

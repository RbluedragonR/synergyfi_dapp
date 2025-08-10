import { AFFILIATE_TYPE } from '@/constants/affiliates';
import { REFERRAL_PAGE_SIZE } from '@/constants/referral';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useDappChainConfig } from '@/hooks/web3/useChain';
import { IPaginationResponse } from '@/types/referral';
import { IAffiliateOverview, ICommissionDistribution, IInvitee } from '@/types/referral/affiliates';
import { IFeeRebateHistory, ITraderOverview } from '@/types/referral/trader';
import { TokenInfo } from '@/types/token';
import {
  getAffiliateOverviewQueryKey,
  getCommissionHistoryQueryKey,
  getFeeRebateHistoryQueryKey,
  getInviteesQueryKey,
  getReferralAvailableBalanceQueryKey,
  getReferralClaimableTokensFromChainQueryKey,
  getTraderOverviewQueryKey,
} from '@/utils/referral';
import { fixBalanceNumberDecimalsTo18 } from '@/utils/token';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useWrappedQuoteMap } from '../chain/hook';
import { useSDK } from '../web3/hook';
import {
  getAffiliateOverview,
  getCommissionHistory,
  getFeeRebateHistory,
  getInvitees,
  getReferralAvailableTokenToClaimList,
  getTraderOverview,
} from './api';

// New hooks for API methods
export const useTraderOverview = (
  chainId: number | undefined,
  address: string | undefined,
): UseQueryResult<ITraderOverview | null> => {
  return useQuery({
    queryKey: getTraderOverviewQueryKey(chainId, address),
    queryFn: () => (address && chainId ? getTraderOverview(chainId, address) : null),
    enabled: !!address && !!chainId,
  });
};

export const useFeeRebateHistory = (
  chainId: number | undefined,
  address: string | undefined,
  page?: number,
  limit?: number,
): UseQueryResult<IPaginationResponse<IFeeRebateHistory> | null> => {
  return useQuery({
    queryKey: getFeeRebateHistoryQueryKey(chainId, address, page, limit),
    queryFn: () => (address && chainId ? getFeeRebateHistory(chainId, address, page, limit) : null),
    enabled: !!address && !!chainId,
  });
};

export const useAffiliateOverview = (
  chainId: number | undefined,
  address: string | undefined,
): UseQueryResult<IAffiliateOverview | null> => {
  return useQuery({
    queryKey: getAffiliateOverviewQueryKey(chainId, address),
    queryFn: () => (address && chainId ? getAffiliateOverview(chainId, address) : null),
    enabled: !!address && !!chainId,
  });
};

export const useCommissionHistory = (
  chainId: number | undefined,
  address: string | undefined,
  page = 1,
  limit = REFERRAL_PAGE_SIZE,
): UseQueryResult<IPaginationResponse<ICommissionDistribution> | null> => {
  return useQuery({
    queryKey: getCommissionHistoryQueryKey(chainId, address, page, limit),
    queryFn: () => (address && chainId ? getCommissionHistory(chainId, address, page, limit) : null),
    enabled: !!address && !!chainId,
  });
};

export const useInvitees = (
  chainId: number | undefined,
  address: string | undefined,
  page?: number,
  limit?: number,
): UseQueryResult<IPaginationResponse<IInvitee> | null> => {
  return useQuery({
    queryKey: getInviteesQueryKey(chainId, address, page, limit),
    queryFn: () => (address && chainId ? getInvitees(chainId, address, page, limit) : null),
    enabled: !!address && !!chainId,
  });
};

export const useFetchReferralClaimableProofs = (
  type: AFFILIATE_TYPE,
  chainId: number | undefined,
  address: string | undefined,
) => {
  const res = useQuery({
    queryKey: getReferralAvailableBalanceQueryKey(type, chainId, address),
    queryFn: async () => {
      if (!chainId || !address) {
        return null;
      }
      const response = await getReferralAvailableTokenToClaimList(chainId, address);

      if (response) {
        const listMap = type === AFFILIATE_TYPE.TRADER ? response.feeRebateReward : response.commissionRebateReward;

        if (listMap) {
          const list = Object.keys(listMap)
            .map((tokenSymbol) => {
              const item = listMap[tokenSymbol];
              return {
                ...item,
                tokenSymbol,
              };
            })
            // .map((tokenSymbol) => {
            //   const item = listMap[tokenSymbol];

            //   const quote = quotesList.find((quote) => {
            //     return quote.symbol === tokenSymbol;
            //   });
            //   console.log('🚀 ~ .map ~ quote:', quote);
            //   if (quote) {
            //     return {
            //       ...item,
            //       token: quote,
            //       balance: WrappedBigNumber.from(
            //         fixBalanceNumberDecimalsTo18(BigNumber.from(item.amount), quote.decimals),
            //       ),
            //       price: quote.price,
            //       balanceUSD: quote.price?.mul(item.amount) ?? undefined,
            //     };
            //   }
            //   return null;
            // })
            .filter((item): item is NonNullable<typeof item> => item !== null);
          console.log('🚀 ~ queryFn: ~ list:', list);
          return {
            list,
          };
        }
      }

      return null;
    },
    enabled: !!address && !!chainId && !!type,
  });
  const wrappedQuotes = useWrappedQuoteMap(chainId);
  const tokensList = useMemo(() => {
    if (res.data && wrappedQuotes) {
      const quoteList = Object.values(wrappedQuotes);
      const list = res.data.list.map((item) => {
        const quote = quoteList.find((quote) => {
          return quote.symbol === item.tokenSymbol;
        });
        if (quote) {
          return {
            ...item,
            token: quote,
            // balance: WrappedBigNumber.from(fixBalanceNumberDecimalsTo18(BigNumber.from(item.amount), quote.decimals)),
            balance: WrappedBigNumber.from(item.amount),
            price: quote.price,
            balanceUSD: quote.price?.mul(item.amount) ?? undefined,
          };
        }
        return null;
      });
      return list.filter((item): item is NonNullable<typeof item> => item !== null);
    }
  }, [res.data, wrappedQuotes]);
  console.log('🚀 ~ tokensList ~ tokensList:', tokensList);

  return { ...res, tokensList };
};

export const useQueryTraderOrAffiliateAlreadyClaimedAmountFromChain = (
  chainId: number | undefined,
  type: AFFILIATE_TYPE,
  userAddr: string | undefined,
  tokens: TokenInfo[],
) => {
  const sdk = useSDK(chainId);
  const dappConfig = useDappChainConfig(chainId);
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: getReferralClaimableTokensFromChainQueryKey(type, chainId, userAddr),
    queryFn: async () => {
      const contractAddress = dappConfig?.referral?.contract?.[type];
      if (!contractAddress || !userAddr || !sdk) {
        return null;
      }
      const tokenAddrs = tokens.map((token) => token.address);
      console.log('getAlreadyClaimedRewardAmounts params:', { contractAddress, userAddr, tokenAddrs });
      const res = await sdk?.airdrop.getAlreadyClaimedRewardAmounts(contractAddress, userAddr, tokenAddrs);
      console.log('🚀 ~ queryFn: ~ res:', res);
      return tokens.map((token, index) => {
        const amount = res?.[index];
        const t = {
          ...token,
          alreadyClaimedAmount: amount ? fixBalanceNumberDecimalsTo18(amount, token.decimals) : undefined,
        };
        return t;
      });
    },
    staleTime: 0,
    enabled: !!userAddr && !!chainId && !!sdk && !!tokens.length,
  });
};

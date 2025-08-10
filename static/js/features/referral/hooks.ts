import { OPERATION_TX_TYPE } from '@/constants';
import { AFFILIATE_TYPE } from '@/constants/affiliates';
import { SYN_IS_AFFILIATE } from '@/constants/storage';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useAppDispatch } from '@/hooks';
import useCopyClipboard from '@/hooks/useCopyClipboard';
import { useTxNotification } from '@/hooks/useTxNotification';
import { useChainId, useChainShortName, useDappChainConfig, useProvider } from '@/hooks/web3/useChain';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { queryClient } from '@/pages/App';
import { IReferralAvailableTokenToClaim, IReferralAvailableTokenToClaimList } from '@/types/referral/affiliates';
import { telegramShare, tweet } from '@/utils/common';
import { parseSendingTxMessageMapping } from '@/utils/notification';
import { getReferralClaimableTokensFromChainQueryKey } from '@/utils/referral';
import { ProofInput } from '@synfutures/sdks-airdrop';
import { parseUnits } from 'ethers/lib/utils';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAllTokenBalanceAction } from '../balance/actions';
import { useMarginTokenInfoMap, useWrappedQuoteMap } from '../chain/hook';
import { sendTransaction } from '../transaction/actions';
import { useSDK } from '../web3/hook';
import {
  useAffiliateOverview,
  useFetchReferralClaimableProofs,
  useQueryTraderOrAffiliateAlreadyClaimedAmountFromChain,
  useTraderOverview,
} from './query';

export function useIsUserIsAffiliate(chainId: number | undefined, userAddr: string | undefined) {
  const { data } = useAffiliateOverview(chainId, userAddr);
  return useMemo(() => {
    if (!userAddr) return false;
    const isAffInLocalStorage = localStorage.getItem(`${SYN_IS_AFFILIATE}_${chainId}_${userAddr}`);
    if (isAffInLocalStorage === 'true') return true;
    const isAff = !!data?.referralCode;
    isAff && localStorage.setItem(`${SYN_IS_AFFILIATE}_${chainId}_${userAddr}`, isAff.toString());
    return isAff;
  }, [userAddr, chainId, data?.referralCode]);
}

export function useAffiliateReferralCode(chainId: number | undefined, userAddr: string | undefined) {
  const { data } = useAffiliateOverview(chainId, userAddr);
  return useMemo(() => {
    return data?.referralCode;
  }, [data]);
}

export function useShareAffiliateReferralLink(chainId: number | undefined, userAddr: string | undefined) {
  const referralCode = useAffiliateReferralCode(chainId, userAddr);
  const chainShortName = useChainShortName();

  const [isCopiedReferral, setCopied] = useCopyClipboard(2000);
  const [isCopiedLink, setCopiedLink] = useCopyClipboard(2000);

  const shareUrl = useMemo(() => {
    return `${window.location.origin}/#/referral/${chainShortName}/trader?referralCode=${referralCode}`;
  }, [chainShortName, referralCode]);

  const handleCopy = useCallback(async () => {
    referralCode && setCopied(referralCode);
  }, [setCopied, referralCode]);

  const handleCopyLink = useCallback(async () => {
    setCopiedLink(shareUrl);
  }, [setCopiedLink, shareUrl]);
  const handleTweet = useCallback(async () => {
    tweet({
      text: `5% can go a long way in trading. Get 5% trading fee rebate on SynFutures with my referral link.

Sign up now. `,
      url: shareUrl,
    });
  }, [referralCode, shareUrl]);

  const handleTelegram = useCallback(async () => {
    telegramShare({
      text: `5% can go a long way in trading. Get 5% trading fee rebate on SynFutures with my referral link.

Sign up now. `,
      url: shareUrl,
    });
  }, [referralCode, shareUrl]);

  return { handleCopyLink, handleTweet, isCopiedLink, handleTelegram, isCopiedReferral, handleCopy };
}

/**
 * referral claim
 * @param type AFFILIATE_TYPE
 * @param userAddr
 * @returns
 */
export function useReferralClaim(type: AFFILIATE_TYPE, userAddr: string | undefined) {
  const chainId = useChainId();
  const [isSending, setIsSending] = useState(false);
  const dispatch = useAppDispatch();
  const signer = useWalletSigner();
  const provider = useProvider();
  const marginTokenMap = useMarginTokenInfoMap(chainId);
  const sdk = useSDK(chainId);
  const dappConfig = useDappChainConfig(chainId);
  const { tokensList: claimTokenList } = useFetchReferralClaimableProofs(type, chainId, userAddr);

  const notification = useTxNotification();
  const { t } = useTranslation();

  const claim = useCallback(async () => {
    console.log(`claim ${type} referral for ${userAddr}`);
    try {
      if (isSending) return;
      if (!signer || !chainId || !userAddr) return;
      const contractAddr = dappConfig?.referral?.contract?.[type];
      if (!contractAddr) return;
      if (!claimTokenList) return;

      // const proofs: ProofInput[] = claimTokenList?.map((t) => ({
      //   amount: BigNumber.from('0x0b'),
      //   tokenAddress: t.token.address,
      //   proof: t.proof,
      // }));
      const proofs: ProofInput[] = claimTokenList?.map((t) => ({
        amount: parseUnits(t.balance.stringValue, t.token.decimals),
        tokenAddress: t.token.address,
        proof: t.proof,
      }));

      if (!proofs.length) return;

      setIsSending(true);

      console.log(`populateClaimReward params:`, {
        contractAddr,
        userAddr,
        proofs,
      });

      const result = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            // return signer.sendTransaction(populatedTx);
            const populatedTx = await sdk?.airdrop.populateClaimReward(contractAddr, userAddr, proofs, userAddr);

            return signer.sendTransaction(populatedTx!);
          },
          chainId,
          userAddr,
          txParams: {
            isDisableNotification: true,
            type:
              type === AFFILIATE_TYPE.AFFILIATES
                ? OPERATION_TX_TYPE.REFERRAL_AFFILIATES_CLAIM
                : OPERATION_TX_TYPE.REFERRAL_TRADER_CLAIM,
            instrument: {
              baseSymbol: '',
              quoteSymbol: '',
              isInverse: false,
            },
            sendingTemplate:
              parseSendingTxMessageMapping[
                type === AFFILIATE_TYPE.AFFILIATES
                  ? OPERATION_TX_TYPE.REFERRAL_AFFILIATES_CLAIM
                  : OPERATION_TX_TYPE.REFERRAL_TRADER_CLAIM
              ]!(),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      console.log('🚀 ~ claim ~ result:', result);
      if (result?.status) {
        // need update balance
        marginTokenMap &&
          dispatch(
            fetchAllTokenBalanceAction({
              chainId: chainId,
              userAddr,
              marginTokenMap,
            }),
          );

        notification.success({
          tx: result.transactionHash,
          message: t(
            `notification.${
              type === AFFILIATE_TYPE.AFFILIATES ? 'referralAffiliatesClaim' : 'referralTraderClaim'
            }.success`,
          ),
          description: t(
            `notification.${
              type === AFFILIATE_TYPE.AFFILIATES ? 'referralAffiliatesClaim' : 'referralTraderClaim'
            }.successDesc`,
          ),
        });

        queryClient.invalidateQueries({
          queryKey: getReferralClaimableTokensFromChainQueryKey(type, chainId, userAddr),
        });
      }
      if (result?.transactionHash) {
      }

      setIsSending(false);

      return result;
    } catch (e) {
      console.error('🚀 referral claim error:', e);
      setIsSending(false);
    }
  }, [
    chainId,
    claimTokenList,
    dappConfig?.referral?.contract,
    dispatch,
    isSending,
    marginTokenMap,
    notification,
    provider,
    sdk?.airdrop,
    signer,
    t,
    type,
    userAddr,
  ]);

  return { claim, isSending };
}

export function useReferralPendingQuoteBalanceList(chainId: number | undefined, userAddr: string | undefined) {
  const affiliateOverview = useAffiliateOverview(chainId, userAddr);
  const traderOverview = useTraderOverview(chainId, userAddr);
  const wrappedQuotes = useWrappedQuoteMap(chainId);
  const affiliatePendingCommissionList = useMemo(() => {
    if (affiliateOverview?.data?.periodCommissionByQuote) {
      const commissionQuotesBalance = affiliateOverview?.data?.periodCommissionByQuote;
      const quoteList = Object.values(wrappedQuotes);
      if (commissionQuotesBalance) {
        const commissionQuotesBalanceList: IReferralAvailableTokenToClaim[] = quoteList
          .filter((q) => commissionQuotesBalance[q.symbol])
          .map((quote) => {
            const balance = commissionQuotesBalance[quote.symbol];
            return {
              token: quote,
              balance: WrappedBigNumber.from(balance),
              price: quote.price || WrappedBigNumber.from(0),
              balanceUSD: WrappedBigNumber.from(balance).mul(quote.price || 0),
            };
          });

        const result: IReferralAvailableTokenToClaimList = {
          list: commissionQuotesBalanceList,
          totalUSD: commissionQuotesBalanceList.reduce(
            (acc, cur) => acc.add(cur.balanceUSD || 0),
            WrappedBigNumber.from(0),
          ),
        };
        return result;
      }
    }
  }, [affiliateOverview?.data?.periodCommissionByQuote, wrappedQuotes]);

  const traderPendingRebatesList = useMemo(() => {
    if (traderOverview?.data?.periodFeeRebatesByQuote) {
      const feeRebatesByQuote = traderOverview?.data?.periodFeeRebatesByQuote;
      const quoteList = Object.values(wrappedQuotes);
      if (feeRebatesByQuote) {
        const quotesBalanceList: IReferralAvailableTokenToClaim[] = quoteList
          .filter((q) => feeRebatesByQuote[q.symbol])
          .map((quote) => {
            const balance = feeRebatesByQuote[quote.symbol];
            return {
              token: quote,
              balance: WrappedBigNumber.from(balance),
              price: quote.price || WrappedBigNumber.from(0),
              balanceUSD: WrappedBigNumber.from(balance).mul(quote.price || 0),
            };
          });

        const result: IReferralAvailableTokenToClaimList = {
          list: quotesBalanceList,
          totalUSD: quotesBalanceList.reduce((acc, cur) => acc.add(cur.balanceUSD || 0), WrappedBigNumber.from(0)),
        };
        return result;
      }
    }
  }, [traderOverview?.data?.periodFeeRebatesByQuote, wrappedQuotes]);

  return { affiliatePendingCommissionList, traderPendingRebatesList };
}

export function useReferralClaimableQuoteBalanceList(
  chainId: number | undefined,
  userAddr: string | undefined,
  affiliateType: AFFILIATE_TYPE,
) {
  const { tokensList: claimTokenList, isLoading: isLoadingAPI } = useFetchReferralClaimableProofs(
    affiliateType as AFFILIATE_TYPE,
    chainId,
    userAddr,
  );

  const { data: alreadyClaimedAmount, isLoading: isLoadingChain } =
    useQueryTraderOrAffiliateAlreadyClaimedAmountFromChain(
      chainId,
      affiliateType,
      userAddr,
      claimTokenList?.map((t) => t.token) || [],
    );

  const claimableList = useMemo(() => {
    if (claimTokenList) {
      if (alreadyClaimedAmount) {
        const list = claimTokenList.map((t) => {
          const alreadyClaimed = alreadyClaimedAmount.find((a) => a.address === t.token.address);
          // console.log(`claimed amount`, WrappedBigNumber.from(alreadyClaimed?.alreadyClaimedAmount).stringValue);
          const changedBalance = t.balance.min(alreadyClaimed?.alreadyClaimedAmount || 0);
          return {
            ...t,
            balance: changedBalance,
            balanceUSD: changedBalance.mul(t.token.price || 0),
          };
        });
        const totalUSD = list.reduce(
          (acc, cur) => acc.add(cur.balanceUSD || cur.token.price || 0),
          WrappedBigNumber.from(0),
        );
        return {
          list,
          totalUSD,
        } as IReferralAvailableTokenToClaimList;
      }
    }
  }, [claimTokenList, alreadyClaimedAmount]);

  const isLoading = useMemo(() => isLoadingAPI || isLoadingChain, [isLoadingAPI, isLoadingChain]);

  return { claimableList, isLoading };
}

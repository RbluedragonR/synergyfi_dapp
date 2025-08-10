/**
 * @description Component-DepositModalFooter
 */
import './index.less';

import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BALANCE_TYPE, ZERO } from '@/constants';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { depositOrWithdrawBalance } from '@/features/balance/actions';
import { useGateAccountState } from '@/features/balance/hook';
import { useQuoteTokens } from '@/features/chain/hook';
import { getFundFlows } from '@/features/portfolio/actions';
import { usePortfolioOperateToken, useUserWithdrawPendingToken } from '@/features/portfolio/hook';
import { useAppProvider, useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useTxNotification } from '@/hooks/useTxNotification';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { ApproveWrapButton } from '@/pages/components/WalletStatus/ApproveButton';
import { TokenInfo } from '@/types/token';
import { ISimulation } from '@/types/trade';
import { toBN, toWad } from '@/utils/numberUtil';
import { isNativeTokenAddr, isWrappedNativeToken } from '@/utils/token';
interface IPropTypes {
  type: BALANCE_TYPE;
  quote?: TokenInfo;
  onCloseModal?: () => void;
  simulation?: ISimulation;
}
const DepositModalFooter: FC<IPropTypes> = function ({ type, quote, onCloseModal, simulation }) {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const tradeAccountState = useGateAccountState(chainId);
  const userAddr = useUserAddr();
  const signer = useWalletSigner();
  const provider = useAppProvider();
  const { t } = useTranslation();
  const sdkContext = useSDK(chainId);
  const notification = useTxNotification();
  const marginTokens = useQuoteTokens(chainId);
  const tokenInfo = usePortfolioOperateToken(chainId, userAddr);
  const { pendingToken } = useUserWithdrawPendingToken(chainId, userAddr, quote?.address);
  const isWrappedNativeTokenInfo = useMemo(() => {
    return chainId && quote && isWrappedNativeToken(chainId, quote.address);
  }, [chainId, quote]);

  const adjustQuote = useMemo(() => {
    if (isWrappedNativeTokenInfo) {
      return tokenInfo;
    }
    return quote;
  }, [isWrappedNativeTokenInfo, quote, tokenInfo]);

  const maxWithdrawableBN = useMemo(() => {
    return WrappedBigNumber.from(pendingToken?.maxWithdrawable || 0);
  }, [pendingToken?.maxWithdrawable]);

  const isShowPendingWarning = useMemo(() => {
    if (type === BALANCE_TYPE.WITHDRAW) {
      return pendingToken?.pending?.amount?.gt(0);
    }
    return false;
  }, [pendingToken?.pending?.amount, type]);

  const isShowWithDrawLimitWarning = useMemo(() => {
    if (type === BALANCE_TYPE.WITHDRAW) {
      if (isShowPendingWarning) return false;
      const amount = WrappedBigNumber.from(tradeAccountState?.depositAmountStr || 0);
      return amount.gt(0) && amount.gt(maxWithdrawableBN);
    }
    return false;
  }, [type, isShowPendingWarning, tradeAccountState?.depositAmountStr, maxWithdrawableBN]);

  const onAfterClickDeposit = useCallback(async () => {
    try {
      if (
        chainId &&
        userAddr &&
        adjustQuote &&
        signer &&
        tradeAccountState?.depositAmountStr &&
        !toBN(tradeAccountState?.depositAmountStr).eq(0) &&
        sdkContext
      ) {
        const isDisableNotification = isShowPendingWarning || isShowWithDrawLimitWarning;

        const receipt = await dispatch(
          depositOrWithdrawBalance({
            signer,
            provider,
            sdkContext,
            quote: adjustQuote,
            amount: tradeAccountState?.depositAmountStr,
            chainId,
            account: userAddr,

            balanceType: type,
            isDisableNotification,
            marginTokens,
          }),
        ).unwrap();
        if (receipt) {
          if (type === BALANCE_TYPE.WITHDRAW) {
            if (receipt?.status === 1 && isDisableNotification)
              notification.success({
                tx: receipt.transactionHash,
                message: t('notification.withdraw.success'),
                description: t('notification.withdraw.successWithLimit', {
                  quantity: WrappedBigNumber.from(tradeAccountState?.depositAmountStr).formatDisplayNumber(),
                  quote: adjustQuote.symbol,
                }),
              });
          }
          if (receipt.status === 1) {
            const dappConfig = DAPP_CHAIN_CONFIGS[chainId];
            // get fund flows with weth
            const tokenCheck = isNativeTokenAddr(adjustQuote.address) ? dappConfig.wrappedNativeToken : adjustQuote;
            if (tokenCheck) {
              dispatch(
                getFundFlows({
                  chainId,
                  sdkContext,
                  userAddr,
                  quoteTokens: [tokenCheck],
                  blockNumber: receipt.blockNumber,
                }),
              );
            }
          }
          onCloseModal && onCloseModal();
        }
      }
    } catch (e) {
      console.error('🚀 ~ file: index.tsx ~ line 91 ~ onAfterClickDeposit ~ e', e);
    }
  }, [
    chainId,
    userAddr,
    adjustQuote,
    signer,
    tradeAccountState?.depositAmountStr,
    sdkContext,
    isShowPendingWarning,
    isShowWithDrawLimitWarning,
    dispatch,
    provider,
    type,
    marginTokens,
    onCloseModal,
    notification,
    t,
  ]);

  return (
    <div className="syn-deposit-modal-footer">
      <ApproveWrapButton
        block
        amount={type === BALANCE_TYPE.DEPOSIT ? toWad(tradeAccountState.depositAmountStr || 0) : ZERO}
        marginToken={adjustQuote}
        type="primary"
        loading={tradeAccountState.isOperating || false}
        disabled={!!simulation?.message}
        afterApproved={onAfterClickDeposit}>
        {t('common.confirm')}
      </ApproveWrapButton>
    </div>
  );
};

export default React.memo(DepositModalFooter);

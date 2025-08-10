/**
 * @description Component-PortfolioAssetWithdrawLimit
 */
import './index.less';

import classNames from 'classnames';
import React, { FC, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Tooltip } from '@/components/ToolTip';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { useQuoteTokens } from '@/features/chain/hook';
import { claimWithdraw } from '@/features/portfolio/actions';
import { useUserWithdrawPendingToken, useWithdrawPendingConfig } from '@/features/portfolio/hook';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useTxNotification } from '@/hooks/useTxNotification';
import { useChainId, useProvider, useUserAddr } from '@/hooks/web3/useChain';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { formatDate } from '@/utils/timeUtils';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  isCurrentAsset: boolean;
  quote: WrappedQuote | undefined;
}
const PortfolioAssetWithdrawLimit: FC<IPropTypes> = function ({ isCurrentAsset, quote }) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const { pendingToken, isShowClaim, isShowProgress } = useUserWithdrawPendingToken(chainId, userAddr, quote?.address);
  const withdrawPendingConfig = useWithdrawPendingConfig(chainId);
  const marginTokens = useQuoteTokens(chainId);
  const sdkContext = useSDK(chainId);
  const signer = useWalletSigner();
  const provider = useProvider();
  const pendingHourly = useMemo(() => {
    if (withdrawPendingConfig?.pendingDuration) return withdrawPendingConfig?.pendingDuration / 3600;
  }, [withdrawPendingConfig?.pendingDuration]);
  const notification = useTxNotification();

  const withdrawAmountBN = useMemo(() => {
    return WrappedBigNumber.from(pendingToken?.pending?.amount || 0);
  }, [pendingToken?.pending?.amount]);

  const withdrawTime = useMemo(() => {
    return formatDate((pendingToken?.pending?.timestamp || 0) * 1000, 'MM-DD HH:mm');
  }, [pendingToken?.pending?.timestamp]);

  const releaseTime = useMemo(() => {
    return formatDate(
      (pendingToken?.pending?.timestamp || 0) * 1000 + (withdrawPendingConfig?.pendingDuration || 0) * 1000,
      'MM-DD HH:mm',
    );
  }, [pendingToken?.pending?.timestamp, withdrawPendingConfig?.pendingDuration]);

  const isShowTag = useMemo(() => {
    return isShowProgress || isShowClaim;
  }, [isShowClaim, isShowProgress]);

  const tooltip = useMemo(() => {
    if (!isShowClaim)
      return (
        <Trans
          t={t}
          i18nKey={'common.portfolio.withdrawLimit.releaseTooltip'}
          values={{
            num: withdrawAmountBN?.abs().formatDisplayNumber(),
            quote: quote?.symbol,
            hours: pendingHourly,
            time: withdrawTime,
            releaseTime,
          }}
          components={{ b: <b /> }}
        />
      );
  }, [isShowClaim, t, withdrawAmountBN, quote?.symbol, pendingHourly, withdrawTime, releaseTime]);

  const onClaimClick = useCallback(async () => {
    if (isShowClaim && chainId && userAddr && quote && sdkContext && signer && provider) {
      if (pendingToken?.pending?.amount?.gt(0)) {
        const receipt = await dispatch(
          claimWithdraw({
            chainId,
            userAddr,
            quote,
            sdkContext,
            signer,
            amount: pendingToken?.pending?.amount,
            provider,
            marginTokens,
          }),
        ).unwrap();
        if (receipt && receipt?.status === 1) {
          notification.success({
            tx: receipt.transactionHash,
            message: t('notification.claimWithdraw.success'),
            description: t('notification.claimWithdraw.successDesc', {
              quantity: WrappedBigNumber.from(pendingToken?.pending?.amount).formatDisplayNumber(),
              quote: quote.symbol,
            }),
          });
        }
      }
    }
  }, [
    chainId,
    dispatch,
    isShowClaim,
    notification,
    pendingToken?.pending?.amount,
    provider,
    quote,
    marginTokens,
    sdkContext,
    signer,
    t,
    userAddr,
  ]);

  if (!isShowTag) return null;
  if (!isCurrentAsset)
    return (
      <Tooltip title={tooltip}>
        <div className="syn-portfolio-asset-withdraw-limit-tag"></div>
      </Tooltip>
    );
  return (
    <Tooltip title={tooltip}>
      <div className={classNames('syn-portfolio-asset-withdraw-limit', isShowClaim && 'claim')}>
        <div
          className="syn-portfolio-asset-withdraw-limit-text"
          onClick={() => {
            if (isShowClaim) {
              onClaimClick();
            }
          }}>
          {isShowClaim ? t('common.portfolio.claim') : t('common.portfolio.inProgress')}
        </div>
      </div>
    </Tooltip>
  );
};

export default PortfolioAssetWithdrawLimit;

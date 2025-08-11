// import { useTranslation } from 'react-i18next';
// import LeanMoreToolTip from '@/components/ToolTip/LeanMoreToolTip';
// import { APPROVE_BTN_LINK } from '@/constants/links';
// import classNames from 'classnames';
import './index.less';

import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import LeanMoreToolTip from '@/components/ToolTip/LeanMoreToolTip';
import { FAQ_LINKS } from '@/constants/links';
import { useTokenBalance } from '@/features/balance/hook';
import { approveToken, checkTokenAllowance } from '@/features/user/actions';
import { useChainTokenAllowance, useChainTokenAllowanceApproved } from '@/features/user/hooks';
// import { Button } from '@/components/Button';
import { useAppDispatch } from '@/hooks';
import { useGa } from '@/hooks/useGa';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { IApproveButtonProps } from '@/types/button';
// import { useChainTokenAllowanceApproved, useChainTokenAllowance } from '@/features/user/hooks';
import { Tooltip } from '@/components/ToolTip';
import { useIsIpBlocked } from '@/features/global/hooks';
import { useAppProvider, useSDK } from '@/features/web3/hook';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { GaCategory } from '@/utils/analytics';
import { parseEther } from 'ethers/lib/utils';
import _ from 'lodash';

export function ApproveButtonComponent({
  spenderAddress,
  className,
  loading,
  afterApproved,
  disabled,
  marginToken,
  children,
  titleNotApproved,
  amount,
  checkMinApprove = false,
  noNeedApprove = false,
  maxAmount,
  showChainIcon = true,
  disabledOvervided = false,
  ...props
}: IApproveButtonProps): JSX.Element {
  const { t } = useTranslation();
  const { isMobile } = useMediaQueryDevice();
  const ipBlocked = useIsIpBlocked();
  const titleNotApprovedAdjusted = useMemo(
    () =>
      titleNotApproved ||
      t('common.approveBtn.approveLine', { symbol: marginToken?.symbol }) +
        (isMobile ? '' : t('common.approveBtn.continue')),
    [isMobile, marginToken?.symbol, t, titleNotApproved],
  );
  const dispatch = useAppDispatch();
  const { approving, checking } = useChainTokenAllowance(marginToken, spenderAddress);
  const checkApproveAmount = useMemo(
    () => (checkMinApprove && amount?.eq(0) ? parseEther('0.00000001') : amount),
    [amount, checkMinApprove],
  );
  const allowanceTooLow = useChainTokenAllowanceApproved(marginToken, spenderAddress, checkApproveAmount);
  const chainId = useChainId();
  const account = useUserAddr();
  const tokenBalance = useTokenBalance(marginToken?.address, chainId);
  const balanceInsuf = useMemo(() => {
    if (maxAmount) {
      return maxAmount && amount && maxAmount.lt(amount);
    }
    return amount && tokenBalance.wadValue.lt(amount);
  }, [amount, maxAmount, tokenBalance.wadValue]);
  const signer = useWalletSigner();
  const provider = useAppProvider();
  const sdk = useSDK(chainId);
  //const isBlacklisted = useIsBlacklistedFromStore();
  const gaEvent = useGa();
  const disableBtn = useMemo(() => {
    if (allowanceTooLow) {
      return !allowanceTooLow && disabled;
    }
    return disabled;
  }, [disabled, allowanceTooLow]);
  const onClickButton = useCallback(async () => {
    if (disableBtn || approving) {
      return;
    }
    if (!allowanceTooLow || noNeedApprove) {
      afterApproved();
    } else {
      marginToken &&
        chainId &&
        account &&
        signer &&
        provider &&
        amount &&
        sdk &&
        dispatch(
          approveToken({
            chainId,
            signer,
            provider,
            userAddr: account,
            marginToken,
            amount,
            spenderAddress,
            sdk,
            routerAddr: spenderAddress,
          }),
        );
      gaEvent({
        category: GaCategory.TRADE_PAIR_CARD_WRAPPER,
        action: 'Trade-Click on Approve Token',
      });
    }
  }, [
    disableBtn,
    approving,
    allowanceTooLow,
    noNeedApprove,
    afterApproved,
    marginToken,
    chainId,
    account,
    signer,
    provider,
    amount,
    dispatch,
    spenderAddress,
    sdk,
    gaEvent,
  ]);
  // always check the approval status of the underlying
  useEffect(() => {
    if (account && chainId && marginToken?.address && sdk) {
      console.log('🚀 ~ useEffect ~ account:', account, chainId, marginToken, sdk);
      dispatch(
        checkTokenAllowance({
          userAddress: account,
          chainId,
          marginToken: marginToken,
          spenderAddress,
          sdk,
        }),
      );
    }
    // must use margintoken.address otherwise it will trigger infinite loop
  }, [dispatch, account, chainId, provider, marginToken?.address, spenderAddress, sdk]);

  return (
    <Tooltip showOnMobile={true} title={ipBlocked ? t('') : undefined}>
      <Button
        {..._.omit(props, ['unConnectedText'])}
        disabled={disabledOvervided || disableBtn || balanceInsuf || ipBlocked}
        type="primary"
        className={classNames(className, 'syn-approve-btn')}
        loading={
          loading || (noNeedApprove ? false : allowanceTooLow && approving) || (noNeedApprove ? false : checking)
        }
        chainIconProps={showChainIcon && chainId ? { chainId, width: 18, marginRight: 4 } : undefined}
        onClick={onClickButton}
        //isBlocked={props.isBlocked !== undefined ? props.isBlocked : isBlacklisted}
      >
        {!allowanceTooLow || balanceInsuf || noNeedApprove ? (
          children
        ) : (
          <>
            {titleNotApprovedAdjusted}
            <LeanMoreToolTip link={FAQ_LINKS.APPROVE_FAQ} title={t('common.approveBtn.tooltip')} />
          </>
        )}
      </Button>
    </Tooltip>
  );
}
export const ApproveWrapButton = React.memo(ApproveButtonComponent);

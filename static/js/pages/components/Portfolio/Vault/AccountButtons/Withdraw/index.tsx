/**
 * @description Component-AccountWithdraw
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@/components/ToolTip';
import { BALANCE_TYPE } from '@/constants';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { setGateAccountState } from '@/features/balance/actions';
import { getUserPendings } from '@/features/portfolio/actions';
import { useUserWithdrawPendingToken } from '@/features/portfolio/hook';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { getDefaultITradeAccountState } from '@/types/balance';
import { IButtonProps } from '@/types/button';

import { useQuoteTokens } from '@/features/chain/hook';
import {
  AccountAction,
  useAssetSelectFromParams,
  useGoToAccountBalanceAction,
} from '@/hooks/portfolio/usePortfolioParams';
import WithdrawButton from './WithdrawButton';
import WithdrawModal from './WithdrawModal';
// import './index.less'
interface IPropTypes {
  quote: WrappedQuote | undefined;
  btnProps?: IButtonProps;
}
const AccountWithdraw: FC<IPropTypes> = function ({ quote, btnProps }) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);
  const { isShowClaim } = useUserWithdrawPendingToken(chainId, userAddr, quote?.address);
  const sdkContext = useSDK(chainId);
  const marginTokens = useQuoteTokens(chainId);
  const isDisableWithdrawBtn = useMemo(() => {
    return isShowClaim;
  }, [isShowClaim]);
  const handleClickWithdrawButton = useCallback(() => {
    setVisible(true);
    chainId &&
      dispatch(
        setGateAccountState({
          chainId,
          ...getDefaultITradeAccountState(),
        }),
      );

    chainId &&
      sdkContext &&
      userAddr &&
      dispatch(
        getUserPendings({
          chainId,
          sdkContext,
          userAddr,
          marginTokens,
        }),
      );
  }, [chainId, dispatch, marginTokens, sdkContext, userAddr]);
  const { accountAction } = useAssetSelectFromParams();
  const { goToAccountBalanceAction } = useGoToAccountBalanceAction();
  useEffect(() => {
    if (accountAction === AccountAction.withdraw && quote && !btnProps?.disabled) {
      handleClickWithdrawButton();
    }
  }, [accountAction, btnProps?.disabled, handleClickWithdrawButton, quote]);
  return (
    <Tooltip title={isDisableWithdrawBtn ? t('common.portfolio.withdrawLimit.disableTooltip') : undefined}>
      <div className="syn-account-withdraw">
        <WithdrawButton
          {...btnProps}
          disabled={isDisableWithdrawBtn || btnProps?.disabled}
          onClick={() => {
            handleClickWithdrawButton();
          }}
        />
        <WithdrawModal
          type={BALANCE_TYPE.WITHDRAW}
          open={visible}
          onCloseModal={() => {
            setVisible(false);
            goToAccountBalanceAction(null);
          }}
          quote={quote}
        />
      </div>
    </Tooltip>
  );
};

export default React.memo(AccountWithdraw);

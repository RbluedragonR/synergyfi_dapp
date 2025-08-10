/**
 * @description Component-DepositFormAlert
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

// import { Trans } from 'react-i18next';
import Alert from '@/components/Alert';
import I18nTrans from '@/components/I18nTrans';
import { ExternalLink } from '@/components/Link';
import { BALANCE_TYPE } from '@/constants';
import { SLIPPAGE_THRESHOLDS } from '@/constants/global';
import { FAQ_LINKS } from '@/constants/links';
import { ERROR_MSG_AMOUNT_EXCEEDS_ALLOWANCE, ERROR_MSG_EXCEED_WALLET_BALANCE } from '@/constants/simulation';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useGateAccountState } from '@/features/balance/hook';
import { useGlobalConfig } from '@/features/global/hooks';
import {
  useTokenWithdrawPendingParams,
  useUserWithdrawPendingToken,
  useWithdrawPendingDurationHourly,
} from '@/features/portfolio/hook';
import { useUserAddr } from '@/hooks/web3/useChain';
import { TokenInfo } from '@/types/token';
import { ISimulation } from '@/types/trade';
interface IPropTypes {
  simulation?: ISimulation;
  quote: TokenInfo | undefined;
  chainId: CHAIN_ID | undefined;
  type: BALANCE_TYPE;
  originQuote: TokenInfo | undefined;
}
const DepositFormAlert: FC<IPropTypes> = function ({ simulation, chainId, type, originQuote }) {
  const { slippage } = useGlobalConfig(chainId);
  const tradeAccountState = useGateAccountState(chainId);
  const userAddr = useUserAddr();
  const { pendingToken } = useUserWithdrawPendingToken(chainId, userAddr, originQuote?.address);
  const quotePendingParam = useTokenWithdrawPendingParams(chainId, originQuote?.address);
  const { t } = useTranslation();
  const errMsg = useMemo(() => {
    return t(simulation?.errorData || simulation?.message || '');
  }, [simulation?.errorData, simulation?.message, t]);

  const needHide = useMemo(
    () =>
      [ERROR_MSG_AMOUNT_EXCEEDS_ALLOWANCE.errorData, ERROR_MSG_EXCEED_WALLET_BALANCE.errorData].includes(
        simulation?.message || '',
      ),
    [simulation?.message],
  );

  const isShowError = useMemo(() => {
    return errMsg && !needHide;
  }, [errMsg, needHide]);

  const isShowSlippageHighAlert = useMemo(() => {
    return WrappedBigNumber.from(slippage).gt(SLIPPAGE_THRESHOLDS.HIGH);
  }, [slippage]);

  const maxWithdrawableBN = useMemo(() => {
    return WrappedBigNumber.from(pendingToken?.maxWithdrawable || 0);
  }, [pendingToken?.maxWithdrawable]);

  const withdrawPendingDuration = useWithdrawPendingDurationHourly(chainId);

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

  const isShowWarning = useMemo(() => {
    if (isShowError) return false;
    if (isShowPendingWarning) return true;
    if (isShowWithDrawLimitWarning) return true;
    return isShowSlippageHighAlert;
  }, [isShowError, isShowPendingWarning, isShowSlippageHighAlert, isShowWithDrawLimitWarning]);

  if (!isShowError && !isShowWarning) return null;
  return (
    <div className="deposit-form-alert">
      {isShowError && <Alert message={<I18nTrans msg={errMsg} />} type="error" showIcon></Alert>}
      {isShowPendingWarning && (
        <Alert
          message={
            <span>
              <Trans
                t={t}
                i18nKey={'common.portfolio.withdrawLimit.alreadyPending'}
                values={{
                  num: maxWithdrawableBN?.abs().formatDisplayNumber(),
                  quote: originQuote?.symbol,
                  hours: withdrawPendingDuration,
                }}
                components={{ b: <b /> }}
              />{' '}
              <ExternalLink href={FAQ_LINKS.WITHDRAW_LIMIT}>{t('common.learnMore')}</ExternalLink>
            </span>
          }
          type="info"
          showIcon
        />
      )}
      {isShowWithDrawLimitWarning && (
        <Alert
          message={
            <span>
              <Trans
                t={t}
                i18nKey={'common.portfolio.withdrawLimit.exceedingLimit'}
                values={{
                  num: WrappedBigNumber.from(quotePendingParam?.threshold || 0).formatDisplayNumber(),
                  quote: originQuote?.symbol,
                  hours: withdrawPendingDuration,
                }}
                components={{
                  b: <b />,
                  a: <a href="https://discord.com/invite/synfutures" target="_blank" rel="noreferrer" />,
                }}
              />{' '}
              <ExternalLink href={FAQ_LINKS.WITHDRAW_LIMIT}>{t('common.learnMore')}</ExternalLink>
            </span>
          }
          type="info"
          showIcon
        />
      )}
    </div>
  );
};

export default React.memo(DepositFormAlert);

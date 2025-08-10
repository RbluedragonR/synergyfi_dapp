/**
 * @description Component-DepositForm
 */
import './index.less';

import { ExchangeIcon } from '@/assets/svg';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import { SwitchBtn } from '@/components/Button';
import I18nTrans from '@/components/I18nTrans';
import { BALANCE_TYPE } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { setGateAccountState } from '@/features/balance/actions';
import { useGateAccountState, useTokenBalance, useTokenGateBalanceByChainIdAndAddress } from '@/features/balance/hook';
import { useNativeToken, useNativeTokenMinGasPriceLimit, useWrappedNativeToken } from '@/features/chain/hook';
import { setPortfolioDepositOrWithdrawOperateToken } from '@/features/portfolio/actions';
import { usePortfolioOperateToken } from '@/features/portfolio/hook';
import { useAppDispatch } from '@/hooks';
import { useDappChainConfig, useUserAddr } from '@/hooks/web3/useChain';
import InputSliderForm from '@/pages/components/Form/InputSliderForm';
import { TokenInfo } from '@/types/token';
import { ISimulation } from '@/types/trade';
import { isNativeTokenAddr, isWrappedNativeToken } from '@/utils/token';

import { useIsTokenExchangeHidden, useTokenExchangeModal } from '@/hooks/trade/useTokenExchange';
import NativeTokenSelector from './NativeTokenSelector';

interface IPropTypes {
  quote: TokenInfo | undefined;
  type: BALANCE_TYPE;
  isMobile?: boolean;
  simulation?: ISimulation;
}
const DepositForm: FC<IPropTypes> = function ({ quote, type, isMobile, simulation }) {
  const chainId = quote?.chainId;
  const dispatch = useAppDispatch();
  const tradeAccountState = useGateAccountState(chainId);
  const gateBalance = useTokenGateBalanceByChainIdAndAddress(chainId, quote?.address || '');
  const { t } = useTranslation();
  const nativeTokenMinGasPriceLimit = useNativeTokenMinGasPriceLimit(chainId);
  const nativeToken = useNativeToken(chainId);
  const wrappedNativeToken = useWrappedNativeToken(chainId);
  const wrappedBalance = useTokenBalance(wrappedNativeToken?.address || '', chainId);
  const dappConfig = useDappChainConfig(chainId);
  const userAddr = useUserAddr();
  const tokenInfo = usePortfolioOperateToken(chainId, userAddr);
  const { toggleModal } = useTokenExchangeModal();
  const isTokenExchangeHidden = useIsTokenExchangeHidden(quote?.symbol);

  const adjustQuote = useMemo(() => {
    if (chainId && quote && type === BALANCE_TYPE.DEPOSIT && isWrappedNativeToken(chainId, quote.address)) {
      return tokenInfo;
    }
    return quote;
  }, [chainId, quote, tokenInfo, type]);
  const tokenBalanceF = useTokenBalance(adjustQuote?.address || '', chainId);

  const tokenBalance = useMemo(() => {
    if (adjustQuote && isNativeTokenAddr(adjustQuote.address)) {
      return tokenBalanceF;
    }
    return tokenBalanceF;
  }, [adjustQuote, tokenBalanceF]);

  const isWrappedNativeTokenInfo = useMemo(() => {
    return chainId && quote && isWrappedNativeToken(chainId, quote.address);
  }, [chainId, quote]);
  const isNativeTokenInfo = useMemo(() => {
    return type === BALANCE_TYPE.WITHDRAW
      ? tokenInfo?.address && isNativeTokenAddr(tokenInfo.address)
      : adjustQuote?.address && isNativeTokenAddr(adjustQuote.address);
  }, [adjustQuote?.address, tokenInfo?.address, type]);

  const onInputSliderChange = useCallback(
    (inputAmountStr: string, sliderRatio: number) => {
      if (type === BALANCE_TYPE.DEPOSIT && isNativeTokenInfo) {
        if (tokenBalance.min(nativeTokenMinGasPriceLimit).lt(inputAmountStr)) {
          inputAmountStr = tokenBalance.min(nativeTokenMinGasPriceLimit).stringValue;
          sliderRatio = 100;
        }
        if (tokenBalance.lte(nativeTokenMinGasPriceLimit)) {
          inputAmountStr = '0';
          sliderRatio = 0;
        }
      }
      chainId &&
        dispatch(
          setGateAccountState({
            ...tradeAccountState,
            depositAmountStr: inputAmountStr,
            amountRatio: sliderRatio,
            chainId,
          }),
        );
    },
    [chainId, dispatch, isNativeTokenInfo, nativeTokenMinGasPriceLimit, tokenBalance, tradeAccountState, type],
  );

  const onSelectChange = useCallback(
    (value: string) => {
      if (dappConfig && chainId && userAddr) {
        let token = dappConfig.wrappedNativeToken;
        if (isNativeTokenAddr(value)) {
          token = dappConfig.nativeToken;
        }
        token && dispatch(setPortfolioDepositOrWithdrawOperateToken({ chainId, userAddr, tokenInfo: token }));
        chainId &&
          type === BALANCE_TYPE.DEPOSIT &&
          dispatch(
            setGateAccountState({
              ...tradeAccountState,
              amountRatio: 0,
              depositAmountStr: '',
              chainId,
            }),
          );
      }
    },
    [chainId, dappConfig, dispatch, tradeAccountState, type, userAddr],
  );
  // default Unwrap nativeToken for withdraw wrapped nativeToken
  useEffect(() => {
    if (type === BALANCE_TYPE.WITHDRAW && isWrappedNativeTokenInfo) {
      dappConfig?.nativeToken &&
        chainId &&
        userAddr &&
        dispatch(setPortfolioDepositOrWithdrawOperateToken({ chainId, userAddr, tokenInfo: dappConfig.nativeToken }));
    }
  }, [chainId, dappConfig, dispatch, isWrappedNativeTokenInfo, type, userAddr]);
  return (
    <>
      {isWrappedNativeTokenInfo && type === BALANCE_TYPE.DEPOSIT && wrappedBalance && (
        <NativeTokenSelector onSideChange={onSelectChange} tokenBalance={wrappedBalance} />
      )}
      <InputSliderForm
        className={`syn-deposit-form ${isMobile && 'mobile'}`}
        inputAmountStr={tradeAccountState?.depositAmountStr}
        tokenInfo={adjustQuote}
        isMobile={isMobile}
        disabled={tradeAccountState?.isOperating}
        balanceSuffix2={
          !isTokenExchangeHidden && (
            <span
              style={{ cursor: 'pointer', display: 'flex' }}
              onClick={() => {
                toggleModal(true);
              }}>
              <ExchangeIcon />
            </span>
          )
        }
        balanceTitle={
          type === BALANCE_TYPE.DEPOSIT
            ? t('common.depositForm.balanceTitleDeposit')
            : t('common.depositForm.balanceTitleWithDraw')
        }
        balanceNumberProps={
          type === BALANCE_TYPE.DEPOSIT
            ? { num: tokenBalance.min(isNativeTokenInfo ? nativeTokenMinGasPriceLimit : 0)?.stringValue }
            : {
                num: gateBalance?.balance?.stringValue || '',
              }
        }
        balanceSuffix={type === BALANCE_TYPE.DEPOSIT ? tokenBalance.stringValue : gateBalance?.balance?.stringValue}
        isDeposit={type === BALANCE_TYPE.DEPOSIT}
        hideBalanceIcon={true}
        sliderValue={tradeAccountState.amountRatio}
        onInputSliderChange={onInputSliderChange}
        suffix={adjustQuote?.symbol}
        inputProps={{}}>
        {isWrappedNativeTokenInfo && type === BALANCE_TYPE.WITHDRAW && (
          <div className="syn-deposit-form-withdraw-switch">
            <span>
              {t('common.depositForm.withdrawNativeToken', {
                wrappedToken: quote?.symbol,
                nativeToken: nativeToken?.symbol,
              })}
            </span>
            <SwitchBtn
              isChecked={tokenInfo?.address === nativeToken?.address}
              onSwitch={(checked) => {
                nativeToken && quote && onSelectChange(checked ? nativeToken?.address : quote?.address);
              }}></SwitchBtn>
          </div>
        )}
        {isNativeTokenInfo &&
          !simulation?.message &&
          type === BALANCE_TYPE.DEPOSIT &&
          (isNativeTokenInfo &&
          tokenBalance.min(nativeTokenMinGasPriceLimit).lte(tradeAccountState?.depositAmountStr || 0) ? (
            <Alert
              message={
                <Trans
                  i18nKey="common.depositForm.alert.needToKeepGas"
                  values={{
                    nativeToken: nativeToken?.symbol,
                    amount: nativeTokenMinGasPriceLimit,
                  }}
                  components={{ b: <b /> }}
                />
              }
              type="info"
              showIcon
            />
          ) : (
            <Alert
              message={
                <I18nTrans
                  msg={t('common.depositForm.alert.depositNativeToWrappedAccount', {
                    nativeToken: nativeToken?.symbol,
                    wrappedToken: wrappedNativeToken?.symbol,
                    amount: WrappedBigNumber.from(tradeAccountState?.depositAmountStr).formatDisplayNumber(),
                  })}
                />
              }
              type="info"
              showIcon></Alert>
          ))}
      </InputSliderForm>
    </>
  );
};

export default DepositForm;

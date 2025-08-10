/**
 * @description Component-TradeFormBase
 */
import './index.less';

import { toBN } from '@derivation-tech/context';
import { Side } from '@synfutures/sdks-perp';
import { useDebounceEffect } from 'ahooks';
import React, { FC, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import FormInput from '@/components/FormInput';
import { AvailableBalance } from '@/components/ToolTip/AvailableBalanceToolTip';
import { DEFAULT_DECIMALS } from '@/constants/global';
import { ERROR_MSG_IMR } from '@/constants/simulation';
import { LEVERAGE_ADJUST_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { clearMarketTradeSimulation, setTradeFormAmount, updateSimulateError } from '@/features/trade/actions';
import { useLeverageAdjustType, useTradeFormLeverage, useTradeMaxLeverage, useTradeType } from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { LEVERAGE_ADJUST } from '@/types/storage';
import { TokenInfo } from '@/types/token';
import { parsedEthersError } from '@/utils/error';
import { getSavedPairLeverage } from '@/utils/localstorage';
import { inputNumChecker } from '@/utils/numberUtil';
import { calcBaseSizeByQuote, calcQuoteSizeByBase } from '@/utils/trade';
import LeverageAdjust from '../LeverageAdjust/LeverageAdjust';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  tradeSide: Side;
  disabled?: boolean;
  state: {
    baseAmount: string | undefined;
    quoteAmount?: string | undefined;
    marginAmount?: string | undefined;
  };
  pair: WrappedPair | undefined;
  baseToken: TokenInfo | undefined;
  quoteToken: TokenInfo | undefined;
  marginToken: TokenInfo | undefined;
  price: string | undefined;
  amountStrChanged?: (val: string) => void;
  leverageChanged: (val: string) => void;
  isShowAmountWarning?: boolean;
  amountWarning?: JSX.Element;
  isShowInfoAlert?: boolean;
  infoAlert?: JSX.Element;
  showLeverageSwitch?: boolean;
  simulationMessage?: string;
  simulationErrorData?: string;
  adjustTypeChanged?: () => void;
  hideLeverage?: boolean;
}
const TradeFormBase: FC<IPropTypes> = function ({
  state,
  baseToken,
  quoteToken,
  tradeSide,
  pair,
  disabled,
  hideLeverage,
  amountStrChanged,
  leverageChanged,
  isShowAmountWarning,
  amountWarning,
  price,
  showLeverageSwitch,
  simulationMessage,
  simulationErrorData,
  adjustTypeChanged,
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const tradeType = useTradeType(chainId);
  const sdkContext = useSDK(chainId);
  const leverage = useTradeFormLeverage(chainId, tradeType, pair?.maxLeverage);
  const userAddr = useUserAddr();
  const leverageType = useLeverageAdjustType(chainId);
  const maxLeverage = useTradeMaxLeverage(pair?.maxLeverage);
  const updateQuoteAmountByBase = useCallback(
    async (baseAmountStr: string) => {
      if (chainId && sdkContext && pair) {
        try {
          let quoteAmount;
          if (baseAmountStr) {
            quoteAmount = calcQuoteSizeByBase(baseAmountStr, price || 1, pair.isInverse);
          }
          dispatch(
            setTradeFormAmount({
              chainId,
              quoteAmount: quoteAmount
                ? inputNumChecker(
                    WrappedBigNumber.from(quoteAmount).stringValue,
                    pair?.rootInstrument.marginToken.decimals,
                  )
                : baseAmountStr,
            }),
          );
        } catch (e) {
          const parsedError = parsedEthersError(e);
          if (parsedError) {
            dispatch(
              updateSimulateError({
                type: tradeType,
                errMessage: parsedError?.errorMsg,
                chainId,
              }),
            );
          }
        }
      }
    },
    [chainId, sdkContext, pair, price, dispatch, tradeType],
  );
  const baseInputAmountStrChanged = useCallback(
    (inputAmountStr: string) => {
      if (chainId && sdkContext && pair) {
        gtag('event', 'enter_limit_order_size', {
          enter_action: 'enter',
        });
        dispatch(
          setTradeFormAmount({
            chainId,
            baseAmount: inputAmountStr,
          }),
        );
        amountStrChanged && amountStrChanged(inputAmountStr);
        updateQuoteAmountByBase(inputAmountStr);
      }
    },
    [chainId, sdkContext, pair, dispatch, amountStrChanged, updateQuoteAmountByBase],
  );
  const marginInputAmountStrChanged = useCallback(
    (inputAmountStr: string) => {
      if (chainId && sdkContext && pair) {
        gtag('event', 'enter_limit_order_size', {
          enter_action: 'enter',
        });
        dispatch(
          setTradeFormAmount({
            chainId,
            marginAmount: inputAmountStr,
          }),
        );
        if (!inputAmountStr.trim()) {
          dispatch(clearMarketTradeSimulation({ chainId }));
        } else {
          amountStrChanged && amountStrChanged(inputAmountStr);
        }
      }
    },
    [chainId, sdkContext, pair, dispatch, amountStrChanged],
  );
  const leverageInputAmountStrChanged = useCallback(
    async (inputAmountStr: string) => {
      leverageChanged && leverageChanged(inputAmountStr);
    },
    [leverageChanged],
  );
  const updateBaseAmountByQuote = useCallback(
    async (quoteAmountStr: string) => {
      if (chainId && sdkContext && pair) {
        try {
          let baseAmount;
          if (quoteAmountStr) {
            baseAmount = calcBaseSizeByQuote(quoteAmountStr, price || 1, pair.isInverse);
          }
          const checkedBaseAmount = baseAmount
            ? inputNumChecker(WrappedBigNumber.from(baseAmount).stringValue, baseToken?.decimals || DEFAULT_DECIMALS)
            : quoteAmountStr;

          amountStrChanged && amountStrChanged(checkedBaseAmount);
          dispatch(
            setTradeFormAmount({
              chainId,
              baseAmount: checkedBaseAmount,
            }),
          );
        } catch (e) {
          const parsedError = parsedEthersError(e);
          if (parsedError) {
            dispatch(
              updateSimulateError({
                type: tradeType,
                errMessage: parsedError?.errorMsg,
                chainId,
              }),
            );
          }
        }
      }
    },
    [chainId, sdkContext, pair, tradeType, price, baseToken?.decimals, amountStrChanged, dispatch],
  );
  const quoteInputAmountStrChanged = useCallback(
    (inputAmountStr: string) => {
      if (chainId && sdkContext && pair) {
        gtag('event', 'enter_limit_order_size', {
          enter_action: 'enter',
        });
        dispatch(
          setTradeFormAmount({
            chainId,
            quoteAmount: inputAmountStr,
          }),
        );
        updateBaseAmountByQuote(inputAmountStr);
      }
    },
    [chainId, pair, dispatch, sdkContext, updateBaseAmountByQuote],
  );
  useDebounceEffect(
    () => {
      // always keep the base
      state.baseAmount && !toBN(state.baseAmount || 0).eq(0) && updateQuoteAmountByBase(state.baseAmount);
      // only depend on price
    },
    [price],
    { wait: 0 },
  );
  useEffect(() => {
    if (pair?.id && showLeverageSwitch) {
      const leverageAdjustSaved = getSavedPairLeverage(userAddr, chainId, pair?.id, LEVERAGE_ADJUST);
      chainId &&
        dispatch(
          setTradeFormAmount({
            chainId,
            leverageAdjustType: (leverageAdjustSaved as LEVERAGE_ADJUST_TYPE) || LEVERAGE_ADJUST_TYPE.BY_LEVERAGE,
          }),
        );
    }
    // at the begining
  }, [showLeverageSwitch, pair?.id]);
  useEffect(() => {
    if (pair?.isInverse) {
      state.quoteAmount && updateBaseAmountByQuote(state.quoteAmount);
    } else {
      state.baseAmount && updateQuoteAmountByBase(state.baseAmount);
    }
  }, [tradeSide]);
  return (
    <div className="syn-trade-form-base">
      <div className="syn-trade-form-base-section">
        <div className="syn-trade-form-base-section-title">{t('common.size')}</div>
        <div className="syn-trade-form-base-amount">
          <>
            <FormInput
              inputProps={{
                type: 'text',
                pattern: '^[0-9]*[.,]?[0-9]*$',
                inputMode: 'decimal',
                autoComplete: 'off',
                autoCorrect: 'off',
                step: 1e18,
                onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
              }}
              disabled={disabled}
              tokenInfo={baseToken}
              suffix={baseToken?.symbol}
              inputAmountStr={state.baseAmount || ''}
              inputAmountStrChanged={baseInputAmountStrChanged}
            />
            <FormInput
              className="syn-trade-form-base-input-quote"
              inputProps={{
                type: 'text',
                pattern: '^[0-9]*[.,]?[0-9]*$',
                inputMode: 'decimal',
                autoComplete: 'off',
                autoCorrect: 'off',
                step: 1e18,
                onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
              }}
              disabled={disabled}
              tokenInfo={quoteToken}
              flexible="syn-trade-form-base-amount-input"
              inputAmountStr={state.quoteAmount || ''}
              inputAmountStrChanged={quoteInputAmountStrChanged}
              suffix={quoteToken?.symbol}
            />
          </>
        </div>
      </div>
      {isShowAmountWarning && amountWarning}

      {!hideLeverage && (
        <div className="syn-trade-form-base-section">
          <>
            <LeverageAdjust
              tradeType={tradeType}
              showLeverageSwitch={showLeverageSwitch}
              pair={pair}
              leverage={leverage}
              leverageAdjustType={leverageType}
              leverageInputAmountStrChanged={leverageInputAmountStrChanged}
              marginInputAmountStrChanged={marginInputAmountStrChanged}
              adjustTypeChanged={adjustTypeChanged}
              disabled={disabled}
              maxLeverage={maxLeverage}
              quoteToken={quoteToken}
              marginAmount={state.marginAmount}
            />
            {simulationErrorData === ERROR_MSG_IMR && (
              <Alert
                message={
                  <div className="syn-trade-market-form-alert">
                    <span>
                      {t(simulationErrorData || simulationMessage || '')}
                      {'. '}
                    </span>
                    {/* <a
                    onClick={() => {
                      leverageInputAmountStrChanged(maxLeverage.toString());
                      setLeverageAdjustType(true);
                      setLeverageSwitchChecked(true);
                      if (userAddr && chainId && pair) {
                        savePairLeverage(
                          userAddr,
                          chainId,
                          pair?.id,
                          tradeType,
                          TRADE_LEVERAGE_THRESHOLDS.MAX.toString(),
                        );
                        savePairLeverage(userAddr, chainId, pair?.id, DYNAMIC, '');
                      }
                    }}>
                    {t('common.tradePage.enableLeverage')}
                  </a> */}
                  </div>
                }
                type="error"
                showIcon
              />
            )}
          </>
        </div>
      )}
      <div className="syn-trade-form-base-section">
        <AvailableBalance />
      </div>
    </div>
  );
};

export default TradeFormBase;

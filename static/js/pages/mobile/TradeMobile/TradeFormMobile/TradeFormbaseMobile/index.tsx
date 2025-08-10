/**
 * @description Component-TradeFrombaseMobile
 */
import './index.less';

import { Side, TokenInfo } from '@synfutures/sdks-perp';
import { useDebounceEffect } from 'ahooks';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SwitchBtn from '@/components/Button/SwitchBtn';
import { TradeLeverage } from '@/components/TradeLeverage/TradeLeverage';
import { DEFAULT_DECIMALS } from '@/constants/global';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { setPairLeverageSwitchChecked, setTradeFormAmount, updateSimulateError } from '@/features/trade/actions';
import { usePairLeverageSwitchChecked, useTradeFormLeverage, useTradeType } from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import FloatingInput from '@/pages/components/FloatingInput';
import { DYNAMIC } from '@/types/storage';
import { parsedEthersError } from '@/utils/error';
import { getSavedPairLeverage, savePairLeverage } from '@/utils/localstorage';
import { inputNumChecker, toBN } from '@/utils/numberUtil';

import { calcBaseSizeByQuote, calcQuoteSizeByBase } from '@/utils/trade';
import TokenSelectDrawer from './TokenSelectDrawer';
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
  leverageSwitched?: (checked: boolean) => void;
}
const TradeFormBaseMobile: FC<IPropTypes> = function ({
  state,
  baseToken,
  quoteToken,
  tradeSide,
  pair,
  disabled,
  amountStrChanged,
  leverageChanged,
  showLeverageSwitch,
  leverageSwitched,
  price,
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const tradeType = useTradeType(chainId);
  const sdkContext = useSDK(chainId);
  const leverage = useTradeFormLeverage(chainId, tradeType, pair?.maxLeverage);
  const [inputTokenAddr, setInputTokenAddr] = useState(baseToken?.address);
  const [showLeverageSelector, setShowLeverageSelector] = useState(true);
  const leverageSwitchChecked = usePairLeverageSwitchChecked(chainId, userAddr, pair?.id);
  const options = useMemo(
    () => [
      {
        value: baseToken?.address,
        label: baseToken?.symbol,
      },
      {
        value: quoteToken?.address,
        label: quoteToken?.symbol,
      },
    ],
    [baseToken?.address, baseToken?.symbol, quoteToken?.address, quoteToken?.symbol],
  );
  const onTokenChange = useCallback((tokenAddr: string) => setInputTokenAddr(tokenAddr), []);
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
    [chainId, sdkContext, pair, tradeType, dispatch, price],
  );
  const baseInputAmountStrChanged = useCallback(
    (inputAmountStr: string) => {
      if (chainId && sdkContext && pair) {
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
  const inputAmountStrChanged = useCallback(
    (amount: string) => {
      if (inputTokenAddr === baseToken?.address) {
        baseInputAmountStrChanged(amount);
      } else {
        quoteInputAmountStrChanged(amount);
      }
    },
    [baseInputAmountStrChanged, baseToken?.address, inputTokenAddr, quoteInputAmountStrChanged],
  );
  useDebounceEffect(
    () => {
      state.baseAmount && !toBN(state.baseAmount || 0).eq(0) && updateQuoteAmountByBase(state.baseAmount);

      // only depend on price
    },
    [price],
    { wait: 0 },
  );
  useEffect(() => {
    if (pair?.isInverse) {
      state.quoteAmount && updateBaseAmountByQuote(state.quoteAmount);
    } else {
      state.baseAmount && updateQuoteAmountByBase(state.baseAmount);
    }
  }, [tradeSide]);
  useEffect(() => {
    setInputTokenAddr(baseToken?.address);
    // only this
  }, [chainId, baseToken]);
  useEffect(() => {
    const leverageSaved = getSavedPairLeverage(userAddr, chainId, pair?.id, TRADE_TYPE.MARKET);
    const dynamicSaved = getSavedPairLeverage(userAddr, chainId, pair?.id, DYNAMIC);
    if (!showLeverageSwitch) {
      setShowLeverageSelector(true);
    } else {
      const switchChecked = !!leverageSaved && !dynamicSaved;
      setShowLeverageSelector(switchChecked);
      chainId &&
        userAddr &&
        pair &&
        dispatch(
          setPairLeverageSwitchChecked({
            chainId,
            userAddr,
            pairId: pair?.id,
            checked: switchChecked,
          }),
        );
    }
  }, [showLeverageSwitch]);

  return (
    <div className="syn-trade-form-base-mobile">
      <FloatingInput
        label={t('common.size')}
        disabled={disabled}
        suffix={
          <TokenSelectDrawer
            disabled={disabled}
            onTokenChange={onTokenChange}
            options={options}
            value={inputTokenAddr}
          />
        }
        decimals={pair?.rootInstrument.marginToken.decimals}
        value={(inputTokenAddr === baseToken?.address ? state.baseAmount : state.quoteAmount) || ''}
        onChange={inputAmountStrChanged}
      />
      <div className="syn-trade-form-base-mobile-leverage">
        <TradeLeverage
          leverage={leverage}
          leverageChanged={leverageInputAmountStrChanged}
          chainId={chainId}
          maxLeverage={pair?.maxLeverage}
          disabled={disabled || !showLeverageSelector || (!leverageSwitchChecked && showLeverageSwitch)}
          tradeType={tradeType}
          pairId={pair?.id}
        />
        {showLeverageSwitch && (
          <SwitchBtn
            defaultChecked={true}
            disabled={disabled}
            onSwitch={(checked) => {
              chainId &&
                userAddr &&
                pair &&
                dispatch(
                  setPairLeverageSwitchChecked({
                    chainId,
                    userAddr,
                    pairId: pair?.id,
                    checked,
                  }),
                );
              setShowLeverageSelector(checked);

              if (pair && userAddr && chainId) {
                savePairLeverage(userAddr, chainId, pair?.id, DYNAMIC, checked ? '' : DYNAMIC);
              }
              leverageSwitched && leverageSwitched(checked);
            }}
            isChecked={leverageSwitchChecked}
          />
        )}
      </div>
    </div>
  );
};

export default TradeFormBaseMobile;

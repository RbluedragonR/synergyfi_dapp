/**
 * @description Component-ScaleSizeInput
 */
import { useTranslation } from 'react-i18next';
import './index.less';

import FormInput from '@/components/FormInput';
import { DEFAULT_DECIMALS } from '@/constants/global';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { setScaleFormAmount, updateSimulateError } from '@/features/trade/actions';
import { useScaleFormState } from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { parsedEthersError } from '@/utils/error';
import { inputNumChecker } from '@/utils/numberUtil';
import { calcBaseSizeByQuote, calcQuoteSizeByBase } from '@/utils/trade';
import { Context } from '@derivation-tech/context';
import { FC, useCallback } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  price: string | undefined;
  disabled?: boolean;
  pair: WrappedPair | undefined;
  sdkContext: Context | undefined;
}
const ScaleSizeInput: FC<IPropTypes> = function ({ disabled, pair, sdkContext, price }) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const scaleFormState = useScaleFormState(chainId);

  const updateQuoteAmountByBase = useCallback(
    async (baseAmountStr: string) => {
      if (chainId && sdkContext && pair) {
        try {
          let quoteAmount;
          if (baseAmountStr) {
            quoteAmount = calcQuoteSizeByBase(baseAmountStr, price || 1, pair.isInverse);
          }
          dispatch(
            setScaleFormAmount({
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
                type: TRADE_TYPE.SCALE_LIMIT,
                errMessage: parsedError?.errorMsg,
                chainId,
              }),
            );
          }
        }
      }
    },
    [chainId, sdkContext, pair, price, dispatch],
  );
  const baseInputAmountStrChanged = useCallback(
    (inputAmountStr: string) => {
      if (chainId && sdkContext && pair) {
        dispatch(
          setScaleFormAmount({
            chainId,
            baseAmount: inputAmountStr,
          }),
        );
        updateQuoteAmountByBase(inputAmountStr);
      }
    },
    [chainId, sdkContext, pair, dispatch, updateQuoteAmountByBase],
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
            ? inputNumChecker(
                WrappedBigNumber.from(baseAmount).stringValue,
                pair.rootInstrument.baseToken?.decimals || DEFAULT_DECIMALS,
              )
            : quoteAmountStr;

          dispatch(
            setScaleFormAmount({
              chainId,
              baseAmount: checkedBaseAmount,
            }),
          );
        } catch (e) {
          const parsedError = parsedEthersError(e);
          if (parsedError) {
            dispatch(
              updateSimulateError({
                type: TRADE_TYPE.SCALE_LIMIT,
                errMessage: parsedError?.errorMsg,
                chainId,
              }),
            );
          }
        }
      }
    },
    [chainId, sdkContext, pair, price, dispatch],
  );
  const quoteInputAmountStrChanged = useCallback(
    (inputAmountStr: string) => {
      if (chainId && sdkContext && pair) {
        dispatch(
          setScaleFormAmount({
            chainId,
            quoteAmount: inputAmountStr,
          }),
        );
        updateBaseAmountByQuote(inputAmountStr);
      }
    },
    [chainId, pair, dispatch, sdkContext, updateBaseAmountByQuote],
  );

  return (
    <div className="syn-scale-limit-form-section">
      <div className="syn-scale-limit-form-section-title">{t('common.totalSize')}</div>
      <div className="syn-scale-limit-form-amount">
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
            suffix={pair?.rootInstrument.baseToken?.symbol}
            inputAmountStr={scaleFormState.baseAmount || ''}
            inputAmountStrChanged={baseInputAmountStrChanged}
          />
          <FormInput
            className="syn-scale-limit-form-input-quote"
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
            flexible="syn-scale-limit-form-amount-input"
            inputAmountStr={scaleFormState.quoteAmount || ''}
            inputAmountStrChanged={quoteInputAmountStrChanged}
            suffix={pair?.rootInstrument.quoteToken?.symbol}
          />
        </>
      </div>
    </div>
  );
};

export default ScaleSizeInput;

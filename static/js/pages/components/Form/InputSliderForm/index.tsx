/**
 * @description Component-InputSliderForm
 */
import './index.less';

import { Form, InputProps } from 'antd';
import classNames from 'classnames';
import React, { FC, ReactNode, useCallback, useMemo } from 'react';

import FormInput from '@/components/FormInput';
import { formatNumberWithTooltip, FormatNumberWithTooltipType } from '@/components/NumberFormat';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useGa } from '@/hooks/useGa';
import { TokenInfo } from '@/types/token';
import { GaCategory } from '@/utils/analytics';
import { bNToS, inputNumChecker, toBN } from '@/utils/numberUtil';

import PercentageSelector from '../../PercentageSelector/PercentageSelector';
interface InputSliderFormProps {
  inputAmountStr: string;
  tokenInfo?: TokenInfo;
  disabled?: boolean;
  className?: string;
  balanceTitle?: React.ReactNode;
  balanceNumberProps: Omit<FormatNumberWithTooltipType, 'num'> & { num: string };
  balanceSuffix?: React.ReactNode;
  hideBalanceIcon?: true;
  sliderValue?: number | undefined;
  onInputSliderChange: (inputAmountStr: string, sliderRatio: number) => void;
  clickInput?: string;
  isMobile?: boolean;
  gaCategory?: GaCategory;
  gaAction?: string;
  onFocus?: () => void;
  suffix?: ReactNode;
  balanceSuffix2?: ReactNode;
  inputProps: InputProps;
  children?: ReactNode;
  isDeposit?: boolean;
}
const InputSliderForm: FC<InputSliderFormProps> = function ({
  inputAmountStr,
  tokenInfo,
  disabled,
  className,
  balanceTitle,
  balanceNumberProps,
  balanceSuffix,
  hideBalanceIcon,
  sliderValue,
  onInputSliderChange,
  clickInput,
  gaCategory,
  gaAction,
  onFocus,
  suffix,
  inputProps,
  children,
  balanceSuffix2,
}) {
  const gaEvent = useGa();
  const balanceAbsNumber = useMemo(() => {
    return toBN(balanceNumberProps.num).abs();
  }, [balanceNumberProps.num]);

  const onInputAmountStrChanged = useCallback(
    (inputAmountStr: string) => {
      const shareRatio = Number(
        bNToS(
          toBN(inputAmountStr || 0)
            .dividedBy(balanceAbsNumber)
            .multipliedBy(100),
        ),
      );
      onInputSliderChange(inputAmountStr, shareRatio);
    },
    [balanceAbsNumber, onInputSliderChange],
  );
  const onRatioChanged = useCallback(
    (shareRatio: number) => {
      const inputAmount = bNToS(toBN(shareRatio).multipliedBy(balanceAbsNumber).dividedBy(100));
      onInputSliderChange(inputNumChecker(inputAmount, tokenInfo?.decimals), shareRatio);
      gaCategory &&
        gaAction &&
        gaEvent({
          category: gaCategory,
          action: gaAction,
          value: shareRatio,
          label: shareRatio + '%',
        });
    },

    [balanceAbsNumber, onInputSliderChange, gaEvent, gaCategory, gaAction, tokenInfo],
  );

  return (
    <Form layout="vertical" className={classNames('syn-slider-form', className)}>
      <div className="syn-slider-form-wrap">
        <div className="syn-slider-form-content">
          <div className="syn-slider-form-share-ratio">
            <div className="title">{balanceTitle}</div>
            <div
              className="number"
              onClick={() => {
                onInputAmountStrChanged(clickInput || inputNumChecker(balanceNumberProps.num, tokenInfo?.decimals));
              }}>
              {/* {balanceNumberProps && formatNumberWithTooltip(balanceNumberProps)}{' '} */}
              {balanceSuffix && formatNumberWithTooltip({ num: Number(balanceSuffix) })}
              {!hideBalanceIcon && tokenInfo?.symbol}
              {balanceSuffix2}
            </div>
          </div>
          <FormInput
            inputProps={{
              type: 'text',
              pattern: '^[0-9]*[.,]?[0-9]*$',
              // universal input options
              inputMode: 'decimal',
              autoComplete: 'off',
              autoCorrect: 'off',
              onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
              step: 1e18,
              ...inputProps,
            }}
            max={WrappedBigNumber.from(balanceAbsNumber).stringValue}
            onFocus={onFocus}
            inputAmountStr={inputAmountStr}
            tokenInfo={tokenInfo}
            disabled={disabled}
            inputAmountStrChanged={onInputAmountStrChanged}
            suffix={suffix}
          />

          <PercentageSelector value={sliderValue} disabled={disabled} onChange={onRatioChanged} />
          {children}
        </div>
      </div>
    </Form>
  );
};

export default React.memo(InputSliderForm);

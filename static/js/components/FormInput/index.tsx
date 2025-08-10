import './index.less';

import { InputProps } from 'antd';
import React, { memo, ReactNode } from 'react';

import { TokenFormInput } from '@/components/TokenFormInput';
import { TokenInfo } from '@/types/token';
import { inputNumChecker } from '@/utils/numberUtil';

import { Message } from '../Message';

export default function FormInputComponent({
  inputAmountStr,
  inputAmountStrChanged,
  loading,
  status,
  msg,
  suffix,
  max,
  tokenInfo,
  placeHolder,
  showMsg,
  disabled,
  className = '',
  onFocus,
  onBlur,
  formLabel,
  flexible,
  name,
  min,
  inputProps,
  maxCheckZero,
}: {
  inputAmountStr: string;
  inputAmountStrChanged?: (inputAmountStr: string) => void;
  loading?: boolean | undefined;
  status?: string | undefined;
  msg?: string | undefined;
  suffix?: ReactNode;
  max?: number | string;
  min?: number | string;
  tokenInfo?: TokenInfo;
  placeHolder?: string;
  showMsg?: boolean;
  disabled?: boolean;
  className?: string;
  flexible?: string;
  formLabel?: React.ReactNode;
  name?: string;
  maxCheckZero?: boolean;
  onFocus?: React.FocusEventHandler<HTMLInputElement> | undefined;
  onBlur?: React.FocusEventHandler<HTMLInputElement> | undefined;
  inputProps?: InputProps;
}): JSX.Element | null {
  return (
    <div className={`form-input-wrap ${className} ${inputAmountStr ? 'has-value' : ''}`}>
      <TokenFormInput
        {...inputProps}
        // remove number type to fix cursor position issue
        // type="number"
        size="large"
        className="form-input"
        formClassName="form-input-item"
        tokenInfo={tokenInfo}
        placeholder={placeHolder || '0.0'}
        // defaultValue=""
        min={0}
        name={name}
        flexible={flexible}
        onFocus={onFocus}
        onBlur={(e) => {
          const value = inputNumChecker(e.target.value || '', tokenInfo?.decimals || 4);
          if (min && Number(min) > Number(value)) {
            inputAmountStrChanged && inputAmountStrChanged(min.toString());
          }
          onBlur && onBlur(e);
        }}
        onWheel={(e) => {
          e.preventDefault();
        }}
        formLabel={formLabel}
        disabled={disabled}
        max={maxCheckZero ? max : max || Infinity}
        suffix={suffix}
        onChange={(ipt) => {
          const value = inputNumChecker(ipt.target.value || '', tokenInfo?.decimals || 4);
          if (maxCheckZero) {
            if (Number(value) > Number(max)) {
              max !== undefined && inputAmountStrChanged && inputAmountStrChanged(max.toString());
            } else {
              inputAmountStrChanged && inputAmountStrChanged(value);
            }
          } else {
            if (max && Number(value) > Number(max)) {
              max && inputAmountStrChanged && inputAmountStrChanged(max.toString());
            } else {
              inputAmountStrChanged && inputAmountStrChanged(value);
            }
          }
        }}
        value={inputAmountStr}
      />
      {showMsg && <Message msg={msg} status={status} loading={loading} />}
    </div>
  );
}

export const FormInput = memo(FormInputComponent);

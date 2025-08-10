/**
 * @description Component-FloatingInput
 */
import './index.less';

import classNames from 'classnames';
import React, { FC, useRef } from 'react';

import { inputNumChecker } from '@/utils/numberUtil';
import { useDebounceEffect } from 'ahooks';
interface IPropTypes {
  className?: string;
  suffix: React.ReactNode;
  label: string;
  disabled?: boolean;
  max?: number;
  value: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange: (value: string) => void;
  decimals?: number;
  autoFocus?: boolean;
}
const FloatingInput: FC<IPropTypes> = function ({
  suffix,
  label,
  disabled,
  value,
  onBlur,
  autoFocus,
  onFocus,
  onChange,
  max,
  decimals,
}) {
  const ref = useRef<HTMLLabelElement>(null);
  useDebounceEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.querySelector('input')?.focus();
      ref.current.classList.add('focus');
    }
  }, []);
  return (
    <div className="syn-floating-input-container">
      <label ref={ref} className={classNames('syn-floating-input', !!value ? 'has-value' : '', { disabled: disabled })}>
        <div className="syn-floating-input-title">{label}</div>
        <input
          value={value}
          placeholder="0.0"
          onFocus={onFocus}
          onBlur={() => {
            ref.current && ref.current.classList.remove('focus');
            onBlur && onBlur();
          }}
          onChange={(e) => {
            const value = inputNumChecker(e.target.value || '', decimals || 4);
            if (max && Number(value) > Number(max)) {
              max && onChange(max.toString());
            } else {
              onChange(value);
            }
          }}
          disabled={disabled}
          {...{
            type: 'text',
            pattern: '^[0-9]*[.,]?[0-9]*$',
            inputMode: 'decimal',
            autoComplete: 'off',
            autoCorrect: 'off',
            step: 1e18,
            onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
          }}
        />
      </label>
      <div
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="syn-floating-input-container-suffix">
        {suffix}
      </div>
    </div>
  );
};

export default FloatingInput;

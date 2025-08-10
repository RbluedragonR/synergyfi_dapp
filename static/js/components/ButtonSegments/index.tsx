/**
 * @description Component-ButtonSegments
 */
import './index.less';

import classNames from 'classnames';
import React, { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  value?: string | number;
  options: { label: React.ReactNode; value: string | number }[];
  onChange: (val: string | number) => void;
  disabled?: boolean;
}
const ButtonSegments: FC<IPropTypes> = function ({ value, options, onChange, disabled }) {
  return (
    <div className={classNames('syn-button-segments', { disabled: disabled })}>
      {options.map((op) => (
        <div
          onClick={() => {
            !disabled && onChange(op.value);
          }}
          key={op.value}
          className={classNames('syn-button-segments-item', { selected: value === op.value })}>
          {op.label}
        </div>
      ))}
    </div>
  );
};

export default ButtonSegments;

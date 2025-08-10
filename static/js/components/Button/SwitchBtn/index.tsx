/**
 * @description Component-SwitchBtn
 */
import './index.less';

import { Switch } from 'antd';
import classNames from 'classnames';
import React, { FC, memo } from 'react';

import { IButtonProps } from '@/types/button';
interface IPropTypes extends IButtonProps {
  isChecked: boolean;
  labelLeft?: string;
  twoSided?: boolean;
  onSwitch: (checked: boolean) => void;
}
const SwitchBtn: FC<IPropTypes> = function ({
  children,
  disabled,
  isChecked,
  onSwitch,
  labelLeft,
  twoSided,
  ...props
}) {
  return (
    <div
      className={classNames(props.className, 'syn-switch-btn')}
      onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation();
      }}>
      <div className="syn-btn-switch">
        {labelLeft}
        <Switch
          className={`${twoSided ? 'two-sided' : ''}`}
          defaultChecked={isChecked}
          checked={isChecked}
          disabled={disabled}
          onChange={(checked, e) => {
            e.stopPropagation();
            onSwitch && onSwitch(checked);
          }}
        />
        {children}
      </div>
    </div>
  );
};

export default memo(SwitchBtn);

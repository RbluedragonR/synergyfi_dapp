/**
 * @description Component-DrawerSelector
 */
import './index.less';

import { DrawerProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

import Drawer from '..';

export type DrawerSelectorOptionProps<ValueType> = {
  key: React.Key;
  value: ValueType;
  label: React.ReactNode | JSX.Element | string;
  className?: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface IPropTypes<ValueType> extends DrawerProps {
  children?: React.ReactNode;
  className?: string;
  selectOptions: DrawerSelectorOptionProps<ValueType>[];
  onChange: (value: ValueType) => void;
  value: ValueType;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MyComponentI<T = any> = React.FC<IPropTypes<T>>;

const DrawerSelector: MyComponentI = function <T>({
  selectOptions,
  value,
  onChange,
  className,
  children,
  ...props
}: IPropTypes<T>) {
  return (
    <>
      {children}
      <Drawer className={classNames('syn-drawer-selector', className)} {...props} closeIcon={props.closeIcon || false}>
        <div className="syn-drawer-selector-content">
          <>
            {selectOptions.map((selectOption) => (
              <div
                key={selectOption.key}
                className={classNames('syn-drawer-selector-item', selectOption.className, {
                  'syn-drawer-selector-item-active': selectOption.value === value,
                })}
                onClick={(e) => {
                  onChange(selectOption.value);
                  props.onClose && props.onClose(e);
                }}>
                {selectOption.label}
              </div>
            ))}
          </>
        </div>
      </Drawer>
    </>
  );
};

export default DrawerSelector;

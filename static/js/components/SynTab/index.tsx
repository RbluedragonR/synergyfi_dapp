/**
 * @description Component-SynTab
 */
import './index.less';

import { Tabs } from 'antd';
import classNames from 'classnames';
import React, { FC } from 'react';
interface IPropTypes {
  className?: string;
  items: {
    key: string;
    label: React.ReactNode;
  }[];
  activeKey: string;
  onChange: (key: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'rounded';
}
const SynTab: FC<IPropTypes> = function ({ items, activeKey, disabled, onChange, className, variant = 'default' }) {
  return (
    <Tabs
      className={classNames('syn-syn-tab', `syn-syn-tab-${variant}`, className, { disabled: disabled })}
      onChange={(key) => !disabled && onChange(key)}
      activeKey={activeKey}
      items={items}
    />
  );
};

export default SynTab;

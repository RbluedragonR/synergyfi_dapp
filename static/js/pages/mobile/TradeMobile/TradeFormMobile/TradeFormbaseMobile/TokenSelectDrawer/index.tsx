/**
 * @description Component-TokenSelectDrawer
 */
import './index.less';

import classNames from 'classnames';
import React, { FC, useMemo, useState } from 'react';

import { ReactComponent as ChevronDown } from '@/assets/svg/icon_chevron_down.svg';
import Drawer from '@/components/Drawer';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  value: string | undefined;
  onTokenChange: (value: string) => void;
  disabled?: boolean;
  options: { value: string | undefined; label: string | undefined }[];
}
const TokenSelectDrawer: FC<IPropTypes> = function ({ value, onTokenChange, options, disabled }) {
  const [open, setOpen] = useState(false);
  const selectedOption = useMemo(() => options.find((op) => op.value === value), [options, value]);
  return (
    <>
      <div onClick={() => !disabled && setOpen(true)} className="syn-token-select-drawer-selected">
        {' '}
        {selectedOption?.label}
        <ChevronDown />
      </div>
      <Drawer
        placement="bottom"
        className="syn-token-select-drawer"
        styles={{ header: { display: 'none' } }}
        open={open}
        onClose={() => setOpen(false)}>
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => {
              onTokenChange(option?.value || '');
              setOpen(false);
            }}
            className={classNames('syn-token-select-drawer-item', { active: value === option.value })}>
            {option.label}
          </div>
        ))}
      </Drawer>
    </>
  );
};

export default TokenSelectDrawer;

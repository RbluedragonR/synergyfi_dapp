import { mockOpenDropdown } from '@/constants/mock';
import { Dropdown as AntdDropdown } from 'antd';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import './index.less';
type DropdownProps = {
  withPadding?: boolean;
};
export default function Dropdown({
  withPadding = true,
  overlayClassName,
  className,
  ...others
}: ComponentProps<typeof AntdDropdown> & DropdownProps) {
  return (
    <AntdDropdown
      open={mockOpenDropdown ? mockOpenDropdown : undefined}
      overlayClassName={classNames(overlayClassName, 'syn-dropdown', withPadding && 'withPadding')}
      {...others}
      className={classNames(className)}
    />
  );
}

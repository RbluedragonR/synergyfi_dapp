import { Select as AntSelect, SelectProps } from 'antd';
import classNames from 'classnames';

import { ReactComponent as IconDown } from '@/assets/svg/icon_chevron_down.svg';
import { mockOpenDropdown } from '@/constants/mock';

// import './select.less';

export function Select<T>({ children, className, popupClassName, ...props }: SelectProps<T>): JSX.Element {
  return (
    <AntSelect<T>
      open={mockOpenDropdown ? mockOpenDropdown : undefined}
      suffixIcon={<IconDown />}
      {...props}
      className={classNames('syn-select', className)}
      popupClassName={classNames('syn-select-dropdown', popupClassName)}>
      {children}
    </AntSelect>
  );
}

export const { Option } = AntSelect;

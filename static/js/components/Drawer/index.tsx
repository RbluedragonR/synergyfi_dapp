/**
 * @description Component-Drawer
 */
import './index.less';

import { Drawer as AdDrawer, DrawerProps } from 'antd';
import classNames from 'classnames';
import React, { FC } from 'react';

import { ReactComponent as IconCloseLinear } from './assets/icon_close_linear.svg';
interface IPropTypes extends DrawerProps {
  children?: React.ReactNode;
  className?: string;
}
const Drawer: FC<IPropTypes> = function (props) {
  return (
    <AdDrawer
      {...props}
      placement={props.placement || 'bottom'}
      height={props.height || 'auto'}
      closeIcon={<IconCloseLinear className={classNames('syn-drawer-close')} />}
      //   style={{ top: isShowUserModal ? 64 : 0, contentVisibility: isShowUserModal ? 'auto' : 'hidden' }}
      rootClassName={classNames('syn-drawer', props.className)}>
      {props.children}
    </AdDrawer>
  );
};

export default Drawer;

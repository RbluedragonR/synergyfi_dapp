/**
 * @description Component-MobileHeader
 */
import './index.less';

import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { useTheme } from '@/features/global/hooks';
import Logo from '@/layout/Header/Logo';
import Web3Status from '@/layout/Header/Web3Status';

import IpBlocker from '@/components/IpBlocker';
import NetworkSwitchDrawer from './NetworkSwitchDrawer';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const MobileHeader: FC<IPropTypes> = function () {
  const { dataTheme } = useTheme();
  return (
    <>
      {/* <Suspense>{<TopNotice />}</Suspense> */}
      <IpBlocker />
      <div className="syn-mobile-header">
        <Link id="logo" className="logo" to="/">
          <Logo dataTheme={dataTheme} />
        </Link>
        <div className="syn-mobile-header-right">
          <NetworkSwitchDrawer />
          <Web3Status />
        </div>
      </div>
    </>
  );
};

export default MobileHeader;

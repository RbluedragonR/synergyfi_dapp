import './index.less';

import { Layout as AntLayout, App } from 'antd';
import classNames from 'classnames';
import React, { FC, useMemo } from 'react';
// import Container from '@/components/Container';
import { useLocation } from 'react-router-dom';

import { Default, Mobile, useMediaQueryDevice } from '@/components/MediaQuery';
import { FULL_WIDTH_ROUTES } from '@/constants';
import { useAnnouncementConfig } from '@/features/global/hooks';
import { useIsEarnPage } from '@/hooks';
import MobileFooter from '@/pages/mobile/MobileFooter';
import MobileHeader from '@/pages/mobile/MobileHeader';

// import Footer from './Footer';
import { RouteBasePath } from '@/pages/routers';
import Footer from './Footer';
import Header from './Header';
import Main from './main';

interface IProps {
  children?: React.ReactNode;
}

const LayoutComponent: FC<IProps> = function ({ children }) {
  const { deviceType } = useMediaQueryDevice();
  const location = useLocation();
  const currentRoute = location.pathname.split('/')[1];
  const announcementConfig = useAnnouncementConfig();
  const isEarnPage = useIsEarnPage();
  const hideMobileFooterHeader = useMemo(
    () => location.pathname.includes(RouteBasePath.earn) || location.pathname.includes(RouteBasePath.trade),
    [location.pathname],
  );
  return (
    <App>
      <AntLayout
        className={classNames(
          `app-layout ${deviceType} ${FULL_WIDTH_ROUTES.includes(currentRoute) && 'full-width'} ${
            announcementConfig ? 'has-announcement' : ''
          }`,
          { new: currentRoute === 'odyssey' },
        )}>
        <Default>
          <Header />
        </Default>
        <Mobile>
          <>{!hideMobileFooterHeader && <MobileHeader />}</>
        </Mobile>
        <Main>
          <div>
            <div className={classNames('layout_container', isEarnPage && 'no-padding-top')}>{children}</div>
          </div>
        </Main>
        <Mobile>
          <>{!hideMobileFooterHeader && <MobileFooter />}</>
        </Mobile>
        <Footer />
      </AntLayout>
    </App>
  );
};

export default LayoutComponent;

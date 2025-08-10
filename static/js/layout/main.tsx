import './main.less';

// import { useHideMobileFooter } from '@/features/mobile/hooks';
// import WhiteListMask from '@/pages/components/WhitelistMask';
import { Layout as AntLayout } from 'antd';
import cls from 'classnames';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useIsPlainBgPage, useIsShowReferralBgPage } from '@/hooks';
import bgReferral from '@/pages/Referral/assets/affiliates_bg_2560.png';

const { Content } = AntLayout;

export default function Main({ children }: { children: JSX.Element }): JSX.Element {
  const { deviceType } = useMediaQueryDevice();
  const isPlainBg = useIsPlainBgPage();
  const isShowReferralBg = useIsShowReferralBgPage();
  // const hideFooter = useHideMobileFooter();
  return (
    <Content
      id="pageLayout"
      className={cls(`main-container syn-scrollbar  ${deviceType}  ${false ? 'hide-footer' : ''}`)}>
      {/* <WhiteListMask /> */}
      {/* {!isPlainBg && !isMobile && (
        <div className="main-bg">
          <img loading="lazy" src={theme.dataTheme === THEME_ENUM.DARK ? bgMeshDark : bgMesh} />
        </div>
      )} */}
      {isShowReferralBg && (
        <div className="referral-bg">
          <img loading="lazy" src={bgReferral} />
        </div>
      )}
      <div className={cls('main-body-wrap', isPlainBg && 'full-width')}>
        <div className="main-body">{children}</div>
      </div>
    </Content>
  );
}

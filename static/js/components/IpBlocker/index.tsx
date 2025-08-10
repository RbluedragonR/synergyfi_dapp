/**
 * @description Component-IpBlockedModal
 */
import { useIsIpBlocked } from '@/features/global/hooks';
import './index.less';

import classNames from 'classnames';
import { FC } from 'react';
import { Trans } from 'react-i18next';
import { useMediaQueryDevice } from '../MediaQuery';
import { ReactComponent as BlockIcon } from './assets/icon_ip_blcok.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const IpBlocker: FC<IPropTypes> = function ({}) {
  const { isMobile, deviceType } = useMediaQueryDevice();
  const ipBlocked = useIsIpBlocked();
  if (!ipBlocked) {
    return null;
  }
  return (
    <div className={classNames('syn-ip-blocker-banner', deviceType)}>
      {!isMobile && <BlockIcon />}
      <div className="syn-ip-blocker-banner-right">
        <Trans
          i18nKey={'common.ipBlocker.topNotice'}
          components={{
            a: <a />,
          }}
        />
      </div>
    </div>
    // <Modal
    //   title={<LogoIcon className="syn-ip-blocker-logo" />}
    //   className="syn-ip-blocker"
    //   open={modalOpen}
    //   onCancel={() => toggleModal()}>
    //   <div className="syn-ip-blocker-container">
    //     <div className="syn-ip-blocker-p1">{t('common.ipBlocker.p1')}</div>
    //     <div className="syn-ip-blocker-p2">{t('common.ipBlocker.p2')}</div>
    //     <div className="syn-ip-blocker-p3">{t('common.ipBlocker.p3')}</div>
    //   </div>
    // </Modal>
  );
};

export default IpBlocker;

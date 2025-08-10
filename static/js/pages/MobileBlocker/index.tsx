/**
 * @description Component-MobileBlocker
 */
import './index.less';

import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useTheme } from '@/features/global/hooks';
import Logo from '@/layout/Header/Logo';

import blocker from './assets/moblie_blocker.png';
interface IPropTypes {
  className?: string;
}
const MobileBlocker: FC<IPropTypes> = function () {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <div className="syn-mobile-blocker">
      <div className="syn-mobile-blocker-img">
        <img loading="lazy" src={blocker} />
      </div>

      <div className="syn-mobile-blocker-desc">
        <div className="syn-mobile-blocker-desc-title">{t('common.blocker.title')}</div>
        <div className="syn-mobile-blocker-desc-subtitle">
          <div>{t('common.blocker.subtitle1')}</div>
          <div>
            <Trans i18nKey={'common.blocker.subtitle2'} components={{ a: <a /> }} />
          </div>
        </div>
      </div>
      <a href="https://www.synfutures.com/" className="syn-mobile-blocker-logo">
        <Logo dataTheme={theme.dataTheme} />
      </a>
    </div>
  );
};

export default MobileBlocker;

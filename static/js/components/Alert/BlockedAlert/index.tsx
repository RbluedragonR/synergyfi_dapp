import { useIsBlacklistedFromStore } from '@/features/user/hooks';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import iconPath from '../assets/icon_error_tri_white.svg';
import './index.less';
type TWarningAlert = ComponentProps<'div'>;
export default function BlockedAlert({ className, ...others }: TWarningAlert): JSX.Element {
  const { t } = useTranslation();
  const isBlacklist = useIsBlacklistedFromStore();
  if (isBlacklist) {
    return (
      <div className={classNames('syn-warning-alert', className)} {...others}>
        <img src={iconPath} />
        <span>{t('common.blockedWarning')}</span>
      </div>
    );
  } else {
    return <></>;
  }
}

/**
 * @description Component-TVLWarningToaster
 */
import './index.less';

import { ReactComponent as WarningIcon } from '@/assets/svg/icon_warning_yellow.svg';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TVLWarningToaster: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();

  return (
    <>
      <div className="syn-t-vLWarning-toaster">
        <WarningIcon />
        <div className="syn-t-vLWarning-toaster-middle">{t('common.market.tvlWarning')}</div>
      </div>
    </>
  );
};

export default TVLWarningToaster;

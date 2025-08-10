/**
 * @description Component-TGPEnded
 */
import './index.less';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as EndIcon } from '@/pages/TGP/assets/svg/icon_ended_48.svg';
interface IPropTypes {
  className?: string;
}
const TGPEnded: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  return (
    <div className="syn-tgp-ended">
      <EndIcon />
      <div className="syn-tgp-ended-content">
        <div className="syn-tgp-ended-content-title">{t('tgp.endTitle')}</div>
        <div className="syn-tgp-ended-content-subtitle">{t('tgp.endSubtitle')}</div>
      </div>
    </div>
  );
};

export default TGPEnded;

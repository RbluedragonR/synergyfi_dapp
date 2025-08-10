/**
 * @description Component-OysterAmm
 */
import './index.less';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as OysterIcon } from '@/assets/svg/icon_oyster_amm.svg';
import { ReactComponent as OysterIconD } from '@/assets/svg/icon_oyster_amm_d.svg';
import { THEME_ENUM } from '@/constants';
import { useTheme } from '@/features/global/hooks';
interface IPropTypes {
  className?: string;
}
const OysterAmm: FC<IPropTypes> = function () {
  const { t } = useTranslation();
  const { dataTheme } = useTheme();
  return (
    <div className="syn-oyster-amm">
      {t('common.earn.poweredBy')}
      {dataTheme === THEME_ENUM.DARK ? <OysterIconD /> : <OysterIcon />}

      <span className="syn-earn-card-oyster-title">{t('common.earn.oysterAmm')}</span>
    </div>
  );
};

export default OysterAmm;

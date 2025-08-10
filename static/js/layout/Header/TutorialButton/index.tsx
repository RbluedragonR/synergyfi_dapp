/**
 * @description Component-TutotialButton
 */
import './index.less';

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { THEME_ENUM } from '@/constants';
import { FAQ_LINKS } from '@/constants/links';
import { useTheme } from '@/features/global/hooks';

import { ReactComponent as IconT } from './assets/icon_nav_tutorial.svg';
import { ReactComponent as IconTD } from './assets/icon_nav_tutorial_d.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TutorialButton: FC<IPropTypes> = function () {
  const { t } = useTranslation();
  const { dataTheme } = useTheme();
  return (
    <a href={FAQ_LINKS.TUTORIAL_FAQ} target="_blank" type="ghost" rel="noreferrer" className="syn-tutorial-button">
      {dataTheme === THEME_ENUM.DARK ? <IconTD /> : <IconT />}
      {t('common.tutorials')}
    </a>
  );
};

export default TutorialButton;

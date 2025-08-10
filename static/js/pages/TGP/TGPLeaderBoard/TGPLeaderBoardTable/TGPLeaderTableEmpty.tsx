/**
 * @description Component-TGPLeaderTableEmpty
 */
import './index.less';

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as EmptyIcon } from '@/pages/TGP/assets/svg/icon_empty_24.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPLeaderTableEmpty: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  return (
    <div className="syn-t-gPLeader-board-table-empty">
      <EmptyIcon />
      {t('tgp.noRecord')}
    </div>
  );
};

export default TGPLeaderTableEmpty;

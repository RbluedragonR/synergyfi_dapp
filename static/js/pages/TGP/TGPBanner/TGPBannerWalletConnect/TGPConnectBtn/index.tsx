/**
 * @description Component-TGPConnectBtn
 */
import './index.less';

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  isConnect: boolean;
  onClick: () => void;
}
const TGPConnectBtn: FC<IPropTypes> = function ({ isConnect, onClick }) {
  const { t } = useTranslation();
  return (
    <button className="syn-tgp-connect-btn" onClick={onClick}>
      {' '}
      {isConnect ? t('tgp.banner.agreeRules') : t('common.connectWal')}
    </button>
  );
};

export default TGPConnectBtn;

/**
 * @description Component-SettingsDrawer
 */
import './index.less';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as LabelIcon } from '@/assets/svg/label_rebate.svg';
import Drawer from '@/components/Drawer';

interface IPropTypes {
  className?: string;
  onClose: (close: boolean) => void;
  open: boolean;
}
const LimitDisabledDrawer: FC<IPropTypes> = function ({ onClose, open }) {
  const { t } = useTranslation();

  return (
    <>
      <Drawer
        open={open}
        title={
          <div className="syn-limit-disabled-drawer-title">
            <span>{t('common.limit')}</span>
            <LabelIcon className="syn-trade-form-mobile-tab-label" />
          </div>
        }
        className="syn-limit-disabled-drawer reverse-header"
        placement="bottom"
        onClose={() => onClose(false)}
        destroyOnClose
        height={'auto'}>
        {t('common.tradePage.limitDisabled')}
      </Drawer>
    </>
  );
};

export default LimitDisabledDrawer;

/**
 * @description Component-SettingsDrawer
 */
import './index.less';

import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import Drawer from '@/components/Drawer';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { GlobalFormSetting } from '@/pages/components/GlobalFormSettings';

import { ReactComponent as SettingsIcon } from './assets/icon_setting_linear.svg';
interface IPropTypes {
  className?: string;
}
const SettingsDrawer: FC<IPropTypes> = function () {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { isMobile } = useMediaQueryDevice();

  return (
    <>
      <Button
        icon={<SettingsIcon />}
        className="syn-trade-details-drawer-btn"
        onClick={() => setOpen(true)}
        type="text">
        {t('mobile.settings')}
      </Button>
      <Drawer
        open={open}
        title={t('mobile.settings')}
        className="syn-settings-drawer reverse-header"
        placement="bottom"
        onClose={() => setOpen(false)}
        destroyOnClose
        height={'auto'}>
        <GlobalFormSetting
          isMobile={isMobile}
          onSave={() => {
            setOpen(false);
          }}
        />
      </Drawer>
    </>
  );
};

export default SettingsDrawer;

import Drawer from '@/components/Drawer';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useSpotState } from '@/features/spot/store';
import { GlobalFormSetting } from '@/pages/components/GlobalFormSettings';
import { useTranslation } from 'react-i18next';
import './index.less';

export default function SpotMobileSettings() {
  const { settingsOpen, setSettingsOpen } = useSpotState();
  const { isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();
  return (
    <>
      {isMobile && settingsOpen && (
        <Drawer
          title={t('common.setting')}
          open={settingsOpen}
          onClose={() => {
            setSettingsOpen(false);
          }}
          destroyOnClose={true}
          className="syn-spot-settings-drawer">
          <GlobalFormSetting
            isMobile={true}
            isSpot={true}
            onSave={() => {
              // Add any additional logic after settings are saved
              setSettingsOpen(false);
            }}
          />
        </Drawer>
      )}
    </>
  );
}

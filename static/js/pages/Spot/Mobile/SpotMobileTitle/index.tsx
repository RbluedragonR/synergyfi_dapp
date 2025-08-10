import { useSwapRefresh } from '@/features/spot/hooks';
import { useSpotState } from '@/features/spot/store';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SpotMobileSettings from './SpotMobileSettings';
import { GraphSvg, RefreshSvg, SettingSvg } from './assets';
import './index.less';

export default function SpotMobileTitle() {
  const { t } = useTranslation();
  const { mobileGraphOpen, setMobileGraphOpen, setSettingsOpen } = useSpotState();
  const { handleRefresh } = useSwapRefresh();
  useEffect(() => {
    return () => {
      setSettingsOpen(false);
      setMobileGraphOpen(false);
    };
  }, [setSettingsOpen, setMobileGraphOpen]);
  return (
    <div className="syn-spot-title">
      <div className="syn-spot-title-left">{t('common.swap')}</div>
      <div className="syn-spot-title-right">
        <span className="syn-spot-title-right-item" onClick={() => setMobileGraphOpen(!mobileGraphOpen)}>
          <GraphSvg isOpen={mobileGraphOpen} />
        </span>
        <span className="syn-spot-title-right-item" onClick={handleRefresh}>
          <RefreshSvg />
        </span>
        <span className="syn-spot-title-right-item" onClick={() => setSettingsOpen(true)}>
          <SettingSvg />
        </span>
      </div>
      <SpotMobileSettings />
    </div>
  );
}

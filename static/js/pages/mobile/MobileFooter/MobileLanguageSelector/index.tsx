/**
 * @description Component-MobileLanguageSelector
 */
import './index.less';

import _ from 'lodash';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as IconCheck } from '@/assets/svg/icon_check_linear.svg';
import { ReactComponent as IconLeft } from '@/assets/svg/icon_chevron_left.svg';
import Drawer from '@/components/Drawer';
import { useLangConfigs } from '@/components/LanguageSelector';
import { LANGUAGE_KEY } from '@/constants';
import i18n from '@/i18n';

interface IPropTypes {
  open: boolean;
  className?: string;
  onClose: () => void;
  onLanguageSelect: () => void;
}
const MobileLanguageSelector: FC<IPropTypes> = function ({ open, onClose, onLanguageSelect }) {
  const { t } = useTranslation();
  const langConfigs = useLangConfigs();
  return (
    <Drawer
      open={open}
      title={
        <div onClick={onClose} className="syn-mobile-language-selector-title">
          <IconLeft width={16} height={16} /> {t('common.dropdownMenu.language')}
        </div>
      }
      closeIcon={false}
      className="syn-mobile-language-selector reverse-header"
      onClose={onClose}>
      {_.values(langConfigs)?.map((langConfig) => (
        <div
          onClick={async () => {
            await i18n.changeLanguage(langConfig.enShortName);
            localStorage.setItem(LANGUAGE_KEY, langConfig.enShortName);
            onLanguageSelect();
          }}
          key={langConfig.enShortName}
          className="syn-mobile-language-selector-item">
          <div key={langConfig.enShortName} className="syn-mobile-language-selector-item-left">
            {langConfig && (
              <img
                loading="lazy"
                width={24}
                height={24}
                src={langConfig.src}
                className="syn-language-img"
                alt="Select Language"
              />
            )}
            {langConfig?.name}
          </div>
          {i18n.language === langConfig.enShortName && <IconCheck />}
        </div>
      ))}
    </Drawer>
  );
};

export default MobileLanguageSelector;

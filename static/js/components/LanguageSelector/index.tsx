import './index.less';

import { Menu, MenuProps } from 'antd';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { AVAILABLE_LANGS, LANGUAGE_KEY } from '@/constants';

import { ReactComponent as IconCheckedCircle } from './assets/icon_check_circle.svg';
import iconEn from './assets/icon_lang_en.svg';
import iconEs from './assets/icon_lang_es.svg';
import iconFr from './assets/icon_lang_fr.svg';
import iconJp from './assets/icon_lang_jp.svg';
// import iconKr from './assets/icon_lang_kr.svg';
import classNames from 'classnames';
import Dropdown from '../Dropdown';
import iconTh from './assets/icon_lang_th.svg';
import iconTr from './assets/icon_lang_tr.svg';
import iconVi from './assets/icon_lang_vn.svg';

const { SubMenu } = Menu;

export function useLangConfigs(): {
  [key: string]: { src: string; name: string; enName: string; enShortName: string };
} {
  const langIconMap = useMemo(
    () => ({
      [AVAILABLE_LANGS.ENGLISH]: { src: iconEn, name: 'English', enName: 'ENGLISH', enShortName: 'en' },
      [AVAILABLE_LANGS.TURKEY]: { src: iconTr, name: 'Türkçe', enName: 'TURKEY', enShortName: 'tr' },
      // [AVAILABLE_LANGS.KOREAN]: { src: iconKr, name: '한국어', enName: 'VIETNAMESE', enShortName: 'kr' },
      [AVAILABLE_LANGS.VIETNAMESE]: { src: iconVi, name: 'Tiếng Việt', enName: 'KOREAN', enShortName: 'vi' },
      [AVAILABLE_LANGS.Spanish]: { src: iconEs, name: 'Español', enName: 'Spanish', enShortName: 'es' },
      [AVAILABLE_LANGS.French]: { src: iconFr, name: 'Français', enName: 'French', enShortName: 'fr' },
      [AVAILABLE_LANGS.Japanese]: { src: iconJp, name: '日本語', enName: 'Japanese', enShortName: 'ja' },
      [AVAILABLE_LANGS.Thai]: { src: iconTh, name: 'ภาษาไทย', enName: 'Thai', enShortName: 'th' },
    }),
    [],
  );
  return langIconMap;
}

function LanguageSelector(): JSX.Element | null {
  const { i18n } = useTranslation();
  const langConfigs = useLangConfigs();
  const [selectedKey, setSelectedKey] = useState(AVAILABLE_LANGS.ENGLISH);
  const dropdownOptions: MenuProps['items'] = useMemo(
    () =>
      _.values(langConfigs).map((langConfig, i: number) => {
        const langItem = langConfig;
        return {
          label: (
            <div className={classNames('syn-lang-item', { selected: selectedKey === langItem.enShortName })} key={i}>
              {langItem && <img loading="lazy" src={langItem.src} className="syn-language-img" alt="Select Language" />}
              <div className="syn-language-label">{langItem.name}</div>
            </div>
          ),
          key: langConfig.enShortName,
        };
      }),
    [langConfigs, selectedKey],
  );
  const selectLang = useCallback(
    async (lang: string) => {
      await i18n.changeLanguage(lang);
      localStorage.setItem(LANGUAGE_KEY, lang);
      setSelectedKey(lang as AVAILABLE_LANGS);
    },
    [i18n],
  );
  useEffect(() => {
    setSelectedKey((localStorage.getItem(LANGUAGE_KEY) as AVAILABLE_LANGS) || AVAILABLE_LANGS.ENGLISH);
  }, []);

  return (
    <>
      <Dropdown
        className={'syn-language-select'}
        overlayClassName="syn-language__dropdown"
        placement="bottomRight"
        align={{ offset: [0, 16] }}
        menu={{
          items: dropdownOptions,
          onClick: (info: { key: string }) => {
            selectLang(info.key);
          },
        }}>
        <div className="syn-lang-item-selected">{selectedKey}</div>
      </Dropdown>
    </>
  );
}

export function MobileLangSubMenu(): JSX.Element {
  const { deviceType, isMobile } = useMediaQueryDevice();
  const { t, i18n } = useTranslation();
  const langConfigs = useLangConfigs();
  return (
    <SubMenu
      className={isMobile ? 'block' : 'hide'}
      popupClassName={`header-menu-popup ${deviceType}`}
      key="languages"
      onTitleClick={() => {
        // gtag('event', 'mobile_click_language', {});
      }}
      title={
        <div className="header-menu-popup-languages">
          {t('common.header.languages')}
          <div className="header-menu-popup-languages-right">
            <img
              alt={`synfutures language  ${i18n.language}`}
              src={_.get(langConfigs, [i18n.language, 'src'], iconEn)}
            />
            <span className="header-menu-popup-languages-short">{i18n.language.toUpperCase() || 'EN'}</span>
          </div>
        </div>
      }>
      {_.values(langConfigs).map((langConfig) => {
        const langItem = langConfig;
        return (
          <Menu.Item key={langConfig.enShortName}>
            <div
              className={`header-menu-popup-languages-item ${
                i18n.language === langConfig.enShortName ? 'selected' : ''
              }`}>
              <div className="header-menu-popup-languages-item-left">
                <img alt={langItem.name} src={langItem?.src} />
                <span>{langItem.name}</span>
              </div>
              <IconCheckedCircle />
            </div>
          </Menu.Item>
        );
      })}
    </SubMenu>
  );
}

export default LanguageSelector;

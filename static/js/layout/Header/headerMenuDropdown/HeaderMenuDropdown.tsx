/**
 * @description Component-HeaderMenuDropdown
 */
import './HeaderMenuDropdown.less';

import classNames from 'classnames';
import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

// import { Link } from 'react-router-dom';
import { TGPIcon } from '@/assets/svg';
import { ReactComponent as IconAnalysis } from '@/assets/svg/icon_more_analytics.svg';
import { ReactComponent as IconGithub } from '@/assets/svg/icon_more_github.svg';
import { Button } from '@/components/Button';
import { FAQ_LINKS, INFO_LINK } from '@/constants/links';
import { useTheme } from '@/features/global/hooks';
import { useGa } from '@/hooks/useGa';
import { GaCategory } from '@/utils/analytics';
import { ReactComponent as IconLink } from './assets/icon_acct_new.svg';
import { ReactComponent as IconChevron } from './assets/icon_chevron_d_dark.svg';
import { ReactComponent as IconAcademy } from './assets/icon_more_academy.svg';
import { ReactComponent as IconMoreFoundation } from './assets/icon_more_foundation.svg';

// import { ReactComponent as IconCampaign } from './assets/icon_more_campaigns.svg';
import Dropdown from '@/components/Dropdown';
import SocialList from '@/components/List/SocialList';
import { CHAIN_ID } from '@/constants/chain';
import { useChainId } from '@/hooks/web3/useChain';
import { ReactComponent as IconDocs } from './assets/icon_more_docs.svg';
import { ReactComponent as IconFaq } from './assets/icon_more_faq.svg';
import { ReactComponent as IconWhitepaper } from './assets/icon_more_whitepaper.svg';

const HeaderMenuDropdown: FC = function () {
  const [visible, setVisible] = useState(false);
  const chainId = useChainId();
  const gaEvent = useGa();
  const { t } = useTranslation();
  const onMenuClick = useCallback(
    (menuKey: string) => {
      gaEvent({ category: GaCategory.HEADER, action: `Community-Click on${menuKey}` });
      setVisible(false);
    },
    [gaEvent, setVisible],
  );
  const theme = useTheme();
  const menu = (
    <div className={classNames('syn-header-menu-dropdown_menu', theme.dataTheme)}>
      <div className="syn-header-menu-dropdown_menu-top">
        <a
          href={`https://synfutures.foundation/#/airdrop`}
          onClick={() => onMenuClick('airdrop')}
          target="_blank"
          rel="noreferrer"
          className="syn-header-menu-dropdown_menu-top-row">
          <span className="syn-header-menu-dropdown_menu-top-row-left">
            <IconMoreFoundation />
            {t('header.menu.airdrop')}{' '}
          </span>
          <IconLink className="syn-header-menu-dropdown_menu-top-row-right" />
        </a>
        {/* TODO: temp hide for new theme */}
        {chainId === CHAIN_ID.BLAST && process.env.REACT_APP_SHOW_TGP === 'true' && (
          <a
            href={'/#/tgp'}
            onClick={() => onMenuClick('tgp')}
            rel="noreferrer"
            className="syn-header-menu-dropdown_menu-top-row">
            <span className="syn-header-menu-dropdown_menu-top-row-left">
              <TGPIcon />
              {t('header.menu.tgp')}{' '}
            </span>
            <IconLink className="syn-header-menu-dropdown_menu-top-row-right" />
          </a>
        )}
        <a
          href={`${INFO_LINK}/${theme.dataTheme}`}
          onClick={() => onMenuClick('analysis')}
          target="_blank"
          rel="noreferrer"
          className="syn-header-menu-dropdown_menu-top-row">
          <span className="syn-header-menu-dropdown_menu-top-row-left">
            <IconAnalysis />
            {t('common.dropdownMenu.analysis')}{' '}
          </span>
          <IconLink className="syn-header-menu-dropdown_menu-top-row-right" />
        </a>
        {/* <a
          href="https://academy.synfutures.com/"
          onClick={() => onMenuClick('academy')}
          target="_blank"
          rel="noreferrer"
          className="syn-header-menu-dropdown_menu-top-row">
          <span className="syn-header-menu-dropdown_menu-top-row-left">
            <IconAcademy />
            {t('common.dropdownMenu.academy')}{' '}
          </span>
          <IconLink className="syn-header-menu-dropdown_menu-top-row-right" />
        </a> */}
        <a
          href="https://knowledgehub.synfutures.com"
          onClick={() => onMenuClick('blog')}
          target="_blank"
          rel="noreferrer"
          className="syn-header-menu-dropdown_menu-top-row">
          <span className="syn-header-menu-dropdown_menu-top-row-left">
            <IconAcademy />
            {t('common.dropdownMenu.blog')}{' '}
          </span>
          <IconLink className="syn-header-menu-dropdown_menu-top-row-right" />
        </a>
        <a
          href={FAQ_LINKS.FAQ}
          onClick={() => onMenuClick('FAQ')}
          target="_blank"
          rel="noreferrer"
          className="syn-header-menu-dropdown_menu-top-row">
          <span className="syn-header-menu-dropdown_menu-top-row-left">
            <IconFaq />
            {t('common.dropdownMenu.faq')}{' '}
          </span>
          <IconLink className="syn-header-menu-dropdown_menu-top-row-right" />
        </a>
        <a
          href="https://docs.synfutures.com"
          onClick={() => onMenuClick('docs')}
          target="_blank"
          rel="noreferrer"
          className="syn-header-menu-dropdown_menu-top-row">
          <span className="syn-header-menu-dropdown_menu-top-row-left">
            <IconDocs /> {t('common.dropdownMenu.docs')}
          </span>
          <IconLink className="syn-header-menu-dropdown_menu-top-row-right" />
        </a>
        <a
          href="https://www.synfutures.com/v3-whitepaper.pdf"
          onClick={() => onMenuClick('Whitepaper')}
          target="_blank"
          rel="noreferrer"
          className="syn-header-menu-dropdown_menu-top-row">
          <span className="syn-header-menu-dropdown_menu-top-row-left">
            <IconWhitepaper /> {t('common.dropdownMenu.whitepaper')}
          </span>
          <IconLink className="syn-header-menu-dropdown_menu-top-row-right" />
        </a>
        <a
          href="https://github.com/SynFutures/"
          onClick={() => onMenuClick('Github')}
          target="_blank"
          rel="noreferrer"
          className="syn-header-menu-dropdown_menu-top-row">
          <span className="syn-header-menu-dropdown_menu-top-row-left">
            <IconGithub /> {t('common.dropdownMenu.github')}
          </span>
          <IconLink className="syn-header-menu-dropdown_menu-top-row-right" />
        </a>
      </div>
      <div className="syn-header-menu-dropdown_menu-bottom">
        <div className="syn-header-menu-dropdown_menu-bottom-title">{t('common.dropdownMenu.community')}</div>
        <SocialList />
      </div>
    </div>
  );
  return (
    <div className="syn-header-menu-dropdown">
      <Dropdown
        placement="bottom"
        className="syn-header-menu-dropdown"
        dropdownRender={() => {
          return menu;
        }}
        onOpenChange={setVisible}
        align={{ offset: [0, 16] }}>
        <Button type="link" className="syn-header-menu-dropdown-btn">
          <span style={{ display: 'flex' }}>
            {t('common.more')}
            <span className={classNames('syn-header-menu-dropdown-icon', visible ? 'rotate' : '')}>
              <IconChevron />
            </span>
          </span>
        </Button>
      </Dropdown>
    </div>
  );
};

export default React.memo(HeaderMenuDropdown);

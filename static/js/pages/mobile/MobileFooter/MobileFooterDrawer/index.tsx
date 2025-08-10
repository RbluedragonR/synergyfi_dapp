/**
 * @description Component-MobileFooterDrawer
 */
import './index.less';

import { DrawerProps } from 'antd';
import classNames from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as IconRight } from '@/assets/svg/icon_chevron.svg';
import { ReactComponent as IconDiscord } from '@/assets/svg/icon_discord.svg';
import { ReactComponent as IconMedium } from '@/assets/svg/icon_medium.svg';
// import { ReactComponent as IconLang } from '@/assets/svg/icon_more_lang.svg';
import { ReactComponent as IconTelegram } from '@/assets/svg/icon_telegram.svg';
import { ReactComponent as IconTwitter } from '@/assets/svg/icon_twitter.svg';
import { ReactComponent as IconYoutube } from '@/assets/svg/icon_youtube.svg';
import Drawer from '@/components/Drawer';
import { GlobalModalType } from '@/constants';
import { CHAIN_ID, DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { FAQ_LINKS } from '@/constants/links';
import { useAccountWrap, useTheme, useToggleModal } from '@/features/global/hooks';
import ClearCacheBtn from '@/features/user/UserAddressModal/ClearCacheBtn';
import { useMintToken } from '@/hooks/useTestnet';
import { isTestnet } from '@/utils/chain';

import { CampaignIcon } from '@/assets/svg';
import SwitchTheme from '@/layout/Header/SwitchTheme';
import { ReactComponent as IconMint } from './assets/icon_acct_mint_linear.svg';
import { ReactComponent as IconAcademy } from './assets/icon_more_academy.svg';
import { ReactComponent as IconDocs } from './assets/icon_more_docs.svg';
import { ReactComponent as IconFaq } from './assets/icon_more_faq.svg';
import { ReactComponent as IconGithub } from './assets/icon_more_github.svg';
import { ReactComponent as IconMoreTutorial } from './assets/icon_more_tutorial.svg';
import { ReactComponent as IconWhitepaper } from './assets/icon_more_whitepaper.svg';
interface IPropTypes {
  children?: React.ReactNode;
  drawerProps?: DrawerProps;
  onClose: (res: boolean) => void;
  onMenuClick: (menuKey: string) => void;
  chainId: CHAIN_ID | undefined;
  openFooter: boolean;
  openLanguageDrawer: () => void;
  // mobileFooter: JSX.Element;
}
const ExtraDrawer: FC<IPropTypes> = function ({
  drawerProps,
  onClose: onClose,
  onMenuClick,
  chainId,
  openFooter,
  children,
}) {
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  const userWrap = useAccountWrap();
  const { dataTheme } = useTheme();
  const { t } = useTranslation();
  const { onClickMintToken, tokenInfo } = useMintToken(chainId);

  // const footerDrawerHeight = useMemo(() => {
  //   return isTestnet(chainId) ? 504 : 450;
  // }, [chainId]);
  return (
    <Drawer
      placement={'bottom'}
      closable={false}
      maskClosable={true}
      className={'mobile-footer-drawer'}
      onClose={() => {
        onClose(false);
      }}
      {...drawerProps}
      height={'auto'}
      open={openFooter}
      key={'footer-drawer'}>
      {children}
      <div className={'mobile-footer-body'}>
        <div className={'mobile-footer-links'}>
          <a href={`/#/campaign`} rel="noreferrer" onClick={() => onMenuClick('campaign')}>
            <span className={'mobile-footer-link-left'}>
              <CampaignIcon />
              {t('common.campaign')}
            </span>
            <span className={'mobile-footer-link-right'}>
              <IconRight />
            </span>
          </a>

          {chainId && (isTestnet(chainId) || DAPP_CHAIN_CONFIGS[chainId]?.network.mockTokenConfig) && tokenInfo && (
            <a
              onClick={async () => {
                if (userWrap) onClickMintToken();
                else toggleWalletModal();
                onMenuClick('mint');
                onClose(false);
              }}>
              <span className={'mobile-footer-link-left'}>
                <IconMint />
                {t('header.menu.Mint')}
                {` ` + tokenInfo?.symbol}
              </span>
              <span className={'mobile-footer-link-right'}>
                <IconRight />
              </span>
            </a>
          )}
          <a href={FAQ_LINKS.TUTORIAL_FAQ} target="_blank" rel="noreferrer" onClick={() => onMenuClick('tutorials')}>
            <span className={'mobile-footer-link-left'}>
              <IconMoreTutorial />
              {t('header.menu.Tutorials')}
            </span>
            <span className={'mobile-footer-link-right'}>
              <IconRight />
            </span>
          </a>

          <a href={FAQ_LINKS.FAQ} onClick={() => onMenuClick('faq')} target="_blank" rel="noreferrer">
            <span className={'mobile-footer-link-left'}>
              <IconFaq />
              {t('common.dropdownMenu.faq')}{' '}
            </span>
            <span className={'mobile-footer-link-right'}>
              <IconRight />
            </span>
          </a>
          <a href="https://docs.synfutures.com" onClick={() => onMenuClick('docs')} target="_blank" rel="noreferrer">
            <span className={'mobile-footer-link-left'}>
              {' '}
              <IconDocs /> {t('common.dropdownMenu.docs')}
            </span>
            <span className={'mobile-footer-link-right'}>
              <IconRight />
            </span>
          </a>
          <a
            href="https://www.synfutures.com/v3-whitepaper.pdf"
            onClick={() => onMenuClick('whitepaper')}
            target="_blank"
            rel="noreferrer">
            <span className={'mobile-footer-link-left'}>
              {' '}
              <IconWhitepaper /> {t('common.dropdownMenu.whitepaper')}
            </span>
            <span className={'mobile-footer-link-right'}>
              <IconRight />
            </span>
          </a>
          <a
            href="https://github.com/SynFutures/"
            onClick={() => onMenuClick('github')}
            target="_blank"
            rel="noreferrer">
            <span className={'mobile-footer-link-left'}>
              {' '}
              <IconGithub /> {t('common.dropdownMenu.github')}
            </span>
            <span className={'mobile-footer-link-right'}>
              <IconRight />
            </span>
          </a>
          <a
            href="https://academy.synfutures.com/ "
            onClick={() => onMenuClick('academy')}
            target="_blank"
            rel="noreferrer">
            <span className={'mobile-footer-link-left'}>
              <IconAcademy />
              {t('common.dropdownMenu.academy')}{' '}
            </span>
            <span className={'mobile-footer-link-right'}>
              <IconRight />
            </span>
          </a>
          {/* <a onClick={() => openLanguageDrawer()}>
            <span className={'mobile-footer-link-left'}>
              <IconLang />
              {t('common.dropdownMenu.language')}{' '}
            </span>
            <span className={'mobile-footer-link-right'}>
              {i18n.language} <IconRight />
            </span>
          </a> */}
        </div>
        <div className="mobile-footer-row">
          <div>
            <ClearCacheBtn />
          </div>
          <div className="mobile-footer-theme">
            <span className={'mobile-footer-link-left'}> {t('common.mobileFooter.theme')}</span>
            <SwitchTheme />
          </div>
        </div>
        <div className={classNames('mobile-footer-community', dataTheme)}>
          <div className={'mobile-footer-community-socials'}>
            <a
              href="https://twitter.com/SynFuturesDefi"
              onClick={() => onMenuClick('twitter')}
              target="_blank"
              rel="noreferrer">
              <IconTwitter />
            </a>
            <a
              href="https://synfutures.medium.com/"
              onClick={() => onMenuClick('medium')}
              target="_blank"
              className={'medium'}
              rel="noreferrer">
              <IconMedium />
            </a>
            <a
              href="https://discord.com/invite/SynergyFi"
              onClick={() => onMenuClick('discord')}
              target="_blank"
              rel="noreferrer">
              <IconDiscord />
            </a>
            <a
              href="https://www.youtube.com/channel/UCRHA7TThDHr7hGxtvM5_3vQ"
              onClick={() => onMenuClick('youtube')}
              target="_blank"
              rel="noreferrer">
              <IconYoutube />
            </a>
            <a
              href="https://t.me/synfutures_Defi"
              onClick={() => onMenuClick('telegram')}
              target="_blank"
              rel="noreferrer">
              <IconTelegram />
            </a>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ExtraDrawer;

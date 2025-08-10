/**
 * @description Component-TGPCommunity
 */
import './index.less';

import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/features/global/hooks';
import classNames from 'classnames';
import { ReactComponent as IconDiscord } from './assets/icon_social_discord.svg';
import { ReactComponent as IconMedium } from './assets/icon_social_medium.svg';
import { ReactComponent as IconTelegram } from './assets/icon_social_telegram.svg';
import { ReactComponent as IconTwitter } from './assets/icon_social_twitter.svg';
import { ReactComponent as IconYoutube } from './assets/icon_social_youtube.svg';
interface IPropTypes {
  className?: string;
}
const TGPCommunity: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const onMenuClick = useCallback((menuKey: string) => {
    console.log('🚀 ~ menuKey:', menuKey);
    // gaEvent({ category: GaCategory.HEADER, action: `Community-Click on${menuKey}` });
  }, []);
  return (
    <div className={classNames('syn-tgp-community', theme.dataTheme)}>
      <div className="syn-tgp-community-title">{t('tgp.community.title')}</div>
      <div className="syn-tgp-community-socials">
        <a
          href="https://twitter.com/SynFuturesDefi"
          onClick={() => onMenuClick('Twitter')}
          target="_blank"
          rel="noreferrer"
          className="syn-tgp-community-social">
          <IconTwitter />
        </a>
        <a
          href="https://medium.com/synfutures "
          onClick={() => onMenuClick('Medium')}
          target="_blank"
          rel="noreferrer"
          className="syn-tgp-community-social medium">
          <IconMedium />
        </a>
        <a
          href="https://discord.gg/SynergyFi"
          onClick={() => onMenuClick('Discord')}
          target="_blank"
          rel="noreferrer"
          className="syn-tgp-community-social">
          <IconDiscord />
        </a>
        <a
          href="https://www.youtube.com/channel/UCRHA7TThDHr7hGxtvM5_3vQ"
          onClick={() => onMenuClick('Youtube')}
          target="_blank"
          rel="noreferrer"
          className="syn-tgp-community-social">
          <IconYoutube />
        </a>
        <a
          href="https://t.me/synfutures_Defi"
          onClick={() => onMenuClick('Telegram')}
          target="_blank"
          rel="noreferrer"
          className="syn-tgp-community-social">
          <IconTelegram />
        </a>
      </div>
    </div>
  );
};

export default TGPCommunity;

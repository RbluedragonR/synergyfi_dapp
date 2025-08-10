import { SOCIAL_LINKS } from './links';

import { ReactComponent as IconDiscord } from '@/assets/svg/icon_discord.svg';
import { ReactComponent as IconTelegram } from '@/assets/svg/icon_telegram.svg';
import { ReactComponent as IconTwitter } from '@/assets/svg/icon_twitter.svg';
import { ReactComponent as IconYoutube } from '@/assets/svg/icon_youtube.svg';
type TSocialInfo = {
  icon: JSX.Element;
  href: string;
};

export enum SocialId {
  TWITTER = 'TWITTER',
  // MEDIUM = 'MEDIUM',
  DISCORD = 'DISCORD',
  YOUTUBE = 'YOUTUBE',
  TELEGRAM = 'TELEGRAM',
}
export const socialInfos: { [id in SocialId]: TSocialInfo } = {
  [SocialId.TWITTER]: {
    icon: <IconTwitter />,
    href: SOCIAL_LINKS.TWITTER,
  },
  // [SocialId.MEDIUM]: {
  //   icon: <IconMedium />,
  //   href: 'https://medium.com/synfutures',
  // },
  [SocialId.DISCORD]: {
    icon: <IconDiscord />,
    href: SOCIAL_LINKS.DISCORD,
  },
  [SocialId.YOUTUBE]: {
    icon: <IconYoutube />,
    href: 'https://www.youtube.com/channel/UCRHA7TThDHr7hGxtvM5_3vQ',
  },
  [SocialId.TELEGRAM]: {
    icon: <IconTelegram />,
    href: SOCIAL_LINKS.TELEGRAM,
  },
};

import { FARCASTER_SHARE_LINK } from '@/constants/links';
import { TWITTER_SHARE_LINK } from '@/constants/odyssey';

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const tweet = ({ text, url }: { text?: string; url?: string }) => {
  window.open(
    `${TWITTER_SHARE_LINK}${text ? encodeURIComponent(text) : ''}&url=${url ? encodeURIComponent(url) : ''}`,
    '_blank',
  );
};

export const cast = ({ text, url }: { text?: string; url?: string }) => {
  window.open(
    `${FARCASTER_SHARE_LINK}${text ? encodeURIComponent(text) : ''}&embeds[]=${url ? encodeURIComponent(url) : ''}`,
    '_blank',
  );
};
export type TSynAddressShareIdMaps = {
  [userAddress in string]?: { shareId: string; timestamp: number };
};

export const telegramShare = ({ text, url }: { text?: string; url?: string }) => {
  window.open(
    `https://t.me/share/url?url=${url ? encodeURIComponent(url) : ''}&text=${text ? encodeURIComponent(text) : ''}`,
    '_blank',
  );
};

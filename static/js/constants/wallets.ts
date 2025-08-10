import { getWalletConfigSetting } from '@/configs';
import { getBitKeepDeepLinkUrl } from '@/connectors/bitKeep';
import { getCoinbaseDeepLinkUrl } from '@/connectors/coinbase';
import { getMetamaskDeepLinkUrl } from '@/connectors/metaMask';
import { getOKXDeepLinkUrl } from '@/connectors/okx';
import { getPhantomDeepLinkUrl } from '@/connectors/phantom';
import { getTrustDeepLinkUrl } from '@/connectors/trust';
import { ISocialWalletInfo, IWeb3WalletInfo, WalletType } from '@/types/wallet';
import { isMobile } from 'react-device-detect';

export const WALLET_CONFIGS = getWalletConfigSetting();

export const SUPPORTED_WALLETS: { [key: string]: IWeb3WalletInfo } = {
  [WalletType.METAMASK]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.METAMASK],
    id: isMobile
      ? WALLET_CONFIGS.walletConfig[WalletType.METAMASK].idMobile || WALLET_CONFIGS.walletConfig[WalletType.METAMASK].id
      : WALLET_CONFIGS.walletConfig[WalletType.METAMASK].id,
    isSocialWallet: false,
    mobileDeepLink: getMetamaskDeepLinkUrl(),
  },
  [WalletType.WALLET_CONNECT]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.WALLET_CONNECT],
    isSocialWallet: false,
  },
  [WalletType.COINBASE]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.COINBASE],
    mobileDeepLink: getCoinbaseDeepLinkUrl(),
    isSocialWallet: false,
  },
  [WalletType.BINANCE]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.BINANCE],
    isSocialWallet: false,
  },
  [WalletType.OKX]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.OKX],
    mobileDeepLink: getOKXDeepLinkUrl(),
    isSocialWallet: false,
  },
  [WalletType.COIN_98]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.COIN_98],
    isSocialWallet: false,
  },
  [WalletType.BIT_KEEP]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.BIT_KEEP],
    mobileDeepLink: getBitKeepDeepLinkUrl(),
    isSocialWallet: false,
  },
  [WalletType.TRUST]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.TRUST],
    isSocialWallet: false,
    mobileDeepLink: getTrustDeepLinkUrl(),
  },
  [WalletType.BURRITO]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.BURRITO],
    isSocialWallet: false,
  },
  [WalletType.RABBY]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.RABBY],
    isSocialWallet: false,
  },
  [WalletType.PHANTOM]: {
    ...WALLET_CONFIGS.walletConfig[WalletType.PHANTOM],
    isSocialWallet: false,
    mobileDeepLink: getPhantomDeepLinkUrl(),
  },
};

export const SOCIAL_WALLETS: { [key: string]: ISocialWalletInfo } = WALLET_CONFIGS.socialWallets.reduce(
  (acc, walletType) => {
    acc[walletType] = {
      ...WALLET_CONFIGS.walletConfig[walletType],
      isSocialWallet: true,
    };
    return acc;
  },
  {} as { [key: string]: ISocialWalletInfo },
);

export const TRENDING_WALLET = WalletType.OKX;
export const DEFAULT_CONNECT_WALLET = WalletType.METAMASK;

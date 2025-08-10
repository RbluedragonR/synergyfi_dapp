import { Connector } from 'wagmi';

export enum WalletType {
  METAMASK = 'metaMask',
  BIT_KEEP = 'bitget',
  COIN_98 = 'coin98',
  WALLET_CONNECT = 'walletConnect',
  OKX = 'okx',
  TRUST = 'trust',
  BINANCE = 'binance',
  BURRITO = 'burrito',
  COINBASE = 'coinbase',
  PRIVY = 'privy',
  RABBY = 'rabby',
  PHANTOM = 'phantom', // Add Phantom wallet type
}

export interface IWeb3WalletInfo extends IWalletConfigInfo {
  connector?: Connector;
  isSocialWallet?: false;
  hideInstalled?: true;
}

export interface ISocialWalletInfo extends IWalletConfigInfo {
  isSocialWallet: true;
}

export type IWalletInfo =
  | (IWalletConfigInfo & {
      isSocialWallet: true;
    })
  | (IWeb3WalletInfo & {
      isSocialWallet?: false;
    });

export interface IWalletConfigInfo {
  id: string;
  idMobile?: string;
  type: WalletType;
  rdns?: string; // for inject wallet
  isSocialWallet?: boolean;
  name: string;
  icon: string;
  iconDark?: string;
  mobile?: true;
  mobileOnly?: true;
  mobileDeepLink?: string;
  downloadLink?: string;
  supportChainIds?: number[]; // adapt for walletConnect and binance wallet
}

export interface IWalletConfigSetting {
  walletConfig: {
    [walletType: string]: IWalletConfigInfo;
  };

  supportedWallets: string[];
  socialWallets: string[];
  trendingWallets: string[];
}
export enum WALLET_CONNECT_STATUS {
  UN_CONNECT = 'UnConnect',
  WRONG_NETWORK = 'WrongNetwork',
  CONNECTED = 'Connected',
}

export interface IOnChainReferralCodeConfig {
  platform: {
    [platform: string]: number;
  };
  wallet: {
    [wallet: string]: number;
  };
}

import { getWalletConfigSetting } from '@/configs';
import { WalletType } from '@/types/wallet';

const configs = getWalletConfigSetting();
export const supportChainIds = configs.walletConfig[WalletType.COINBASE].supportChainIds || [];

export function getCoinbaseDeepLinkUrl(): string {
  const dappUrl = document.URL;
  const encodedDappUrl = encodeURIComponent(dappUrl);

  const encodedUrl = 'https://go.cb-w.com/dapp?cb_url=' + encodedDappUrl;
  return encodedUrl;
}

import { coinbaseWallet } from 'wagmi/connectors';

export const coinbaseWalletConnectorFN = coinbaseWallet({ appName: '"SynergyFi"', reloadOnDisconnect: false });

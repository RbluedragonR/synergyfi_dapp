import { getWalletConfigSetting } from '@/configs';
import { WalletType } from '@/types/wallet';
import { injected } from 'wagmi/connectors';

const configs = getWalletConfigSetting();
const okxWalletConfig = configs.walletConfig[WalletType.OKX];

export function getOKXDeepLinkUrl(): string {
  const dappUrl = document.URL;
  const encodedDappUrl = encodeURIComponent(dappUrl);
  const deepLink = 'okx://wallet/dapp/url?dappUrl=' + encodedDappUrl;

  const encodedUrl = 'https://www.okx.com/download?deeplink=' + encodeURIComponent(deepLink);
  return encodedUrl;
}

export const okxConnectorFN = injected({
  target() {
    return {
      id: okxWalletConfig.id,
      name: okxWalletConfig.name,
      icon: okxWalletConfig.icon,
      provider: () => {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isOkxWallet = (ethereum: any) => {
            return !!ethereum?.isOkxWallet;
          };

          if (isOkxWallet(window.ethereum)) {
            return window.ethereum;
          }

          if (window.ethereum?.providers) return window.ethereum.providers.find(isOkxWallet) ?? null;
          return window['okxwallet'] ?? null;
        }
      },
    };
  },
});

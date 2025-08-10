import { getWalletConfigSetting } from '@/configs';
import { WalletType } from '@/types/wallet';
import { injected } from 'wagmi/connectors';

const configs = getWalletConfigSetting();
const walletConfig = configs.walletConfig[WalletType.METAMASK];

export function getMetamaskDeepLinkUrl(): string {
  const dappUrl = document.location.hostname;

  const metamaskAppDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;

  return metamaskAppDeepLink;
}

export const metamaskConnectorFN = injected({
  target() {
    return {
      id: walletConfig.id,
      name: walletConfig.name,
      icon: walletConfig.icon,
      provider: () => {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isWallet = (ethereum: any) => {
            return !!ethereum?.isMetaMask;
          };

          if (isWallet(window.ethereum)) {
            return window.ethereum;
          }

          if (window.ethereum?.providers) return window.ethereum.providers.find(isWallet) ?? null;
          return window.ethereum ?? null;
        }
      },
    };
  },
});

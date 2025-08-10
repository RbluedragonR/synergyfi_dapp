import { getWalletConfigSetting } from '@/configs';
import { WalletType } from '@/types/wallet';
import { injected } from 'wagmi/connectors';

const configs = getWalletConfigSetting();
const walletConfig = configs.walletConfig[WalletType.BIT_KEEP];

export const bitkeepConnectorFN = injected({
  target() {
    return {
      id: walletConfig.id,
      name: walletConfig.name,
      icon: walletConfig.icon,
      provider: () => {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isWallet = (ethereum: any) => {
            return !!ethereum?.isBitKeep;
          };

          if (isWallet(window?.bitkeep)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return window?.bitkeep?.ethereum as any;
          }

          // if (window.ethereum?.providers) return window.ethereum.providers.find(isWallet) ?? null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (window?.bitkeep?.ethereum as any) ?? null;
        }
      },
    };
  },
});

export function getBitKeepDeepLinkUrl(): string {
  const dappUrl = document.URL;
  const encodedDappUrl = encodeURIComponent(dappUrl);

  const encodedUrl = 'https://bkcode.vip?action=dapp&url=' + encodedDappUrl;
  return encodedUrl;
}

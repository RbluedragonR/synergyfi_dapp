import { getWalletConfigSetting } from '@/configs';
import { DEFAULT_CHAIN_ID } from '@/constants/chain';
import { WalletType } from '@/types/wallet';

import { injected } from 'wagmi/connectors';

const configs = getWalletConfigSetting();
const walletConfig = configs.walletConfig[WalletType.TRUST];

export function getTrustDeepLinkUrl(): string {
  const dappUrl = document.URL;
  const encodedDappUrl = encodeURIComponent(dappUrl);
  const defaultChainId = DEFAULT_CHAIN_ID;

  const encodedUrl = `https://link.trustwallet.com/open_url?coin_id=${defaultChainId}&url=${encodedDappUrl}`;
  return encodedUrl;
}

export const trustConnectorFN = injected({
  target() {
    return {
      id: walletConfig.id,
      name: walletConfig.name,
      icon: walletConfig.icon,
      provider: () => {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isTrustWallet = (ethereum: any) => {
            // Identify if Trust Wallet injected provider is present.
            const trustWallet = !!ethereum.isTrust;

            return trustWallet;
          };

          const injectedProviderExist = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

          if (!injectedProviderExist) {
            return null;
          }

          if (isTrustWallet(window.ethereum)) {
            return window.ethereum;
          }

          if (window.ethereum?.providers) {
            return window.ethereum.providers.find(isTrustWallet) ?? null;
          }

          return window['trustwallet'] ?? null;
        }
      },
    };
  },
});

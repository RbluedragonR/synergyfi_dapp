import { getWalletConfigSetting } from '@/configs';
import { WalletType } from '@/types/wallet';
import { walletConnect } from '@wagmi/connectors';

const configs = getWalletConfigSetting();

export const walletConnectSupportChains = configs.walletConfig[WalletType.WALLET_CONNECT].supportChainIds || [];

const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '';

export const walletConnectConnectorFN = walletConnect({
  projectId,
  showQrModal: true,
  qrModalOptions: {
    themeVariables: {
      '--wcm-z-index': '9999',
    },
  },
});

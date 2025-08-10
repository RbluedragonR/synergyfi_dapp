import { getWalletConfigSetting } from '@/configs';
import { WalletType } from '@/types/wallet';
import { getWagmiConnectorV2 } from '@binance/w3w-wagmi-connector-v2';

const configs = getWalletConfigSetting();
export const binanceSupportChainIds = configs.walletConfig[WalletType.BINANCE].supportChainIds || [];

export const binanceConnectorFN = getWagmiConnectorV2();

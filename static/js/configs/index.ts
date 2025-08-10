//coingecko api doc
// https://www.coingecko.com/zh/api/documentation

// CoinGecko API Token List
// https://docs.google.com/spreadsheets/d/1wTTuxXt8n9q7C4NDXqQpI3wpKu1_5bGVmP9Xz0XGSyU/edit?usp=sharing

// supported_vs_currencies
// https://api.coingecko.com/api/v3/simple/supported_vs_currencies
import _ from 'lodash';

import { CoingeckoMapping } from '@/types/coingecko';
import { IOdysseyDappConfig } from '@/types/odyssey';
import { IOracleInfoMap } from '@/types/pair';
import { ITGPDappConfig } from '@/types/tgp';

import { IOnChainReferralCodeConfig, IWalletConfigSetting } from '@/types/wallet';
import * as coingeckoConfig from './coingecko.json';
import odysseyConfig from './odyssey.json';
import * as onChainReferralConfig from './onChainReferral.json';
import * as oracleConfig from './oracle.json';
import * as tgpConfig from './tgp.json';
import * as walletConfig from './wallets.json';

function getCoingeckoMappingConfig(): CoingeckoMapping[] {
  return coingeckoConfig as CoingeckoMapping[];
}

function getCoingeckoMap(): { [symbol: string]: CoingeckoMapping } {
  const coingeckoConfig = getCoingeckoMappingConfig();
  return _.keyBy(coingeckoConfig, 'symbol');
}

const coingeckoSymbolMap = getCoingeckoMap();

/**
 * token symbol mapping to coingecko
 * @param coinSymbol symbol
 * @returns
 */
function getCoingeckoMappingBySymbol(coinSymbol: string): CoingeckoMapping | undefined {
  if (coingeckoSymbolMap[coinSymbol]) {
    return coingeckoSymbolMap[coinSymbol];
  }
  return undefined;
}

export { coingeckoConfig, coingeckoSymbolMap, getCoingeckoMappingBySymbol };

export function getOracleConfig(): IOracleInfoMap {
  return oracleConfig as IOracleInfoMap;
}

export function getOdysseyConfigWithoutEarnOoPointPairs() {
  return odysseyConfig as IOdysseyDappConfig;
}
export function getOdysseyConfig(chainsEarnOoPointPairs: {
  [chainId in string]?: { pairSymbol: string; boost: number }[];
}) {
  const odysseyConfigWithChainsEarnOoPointPairs = {
    ..._.cloneDeep(odysseyConfig),
    chainConfig: Object.entries(odysseyConfig.chainConfig).reduce((prev, [strChainId, config]) => {
      return {
        ...prev,
        [strChainId]: { ...config, earnOoPointPairs: chainsEarnOoPointPairs[strChainId] },
      };
    }, {} as IOdysseyDappConfig['chainConfig']),
  };
  return odysseyConfigWithChainsEarnOoPointPairs as IOdysseyDappConfig;
}

export function getTGPConfig(): ITGPDappConfig {
  const config = tgpConfig as ITGPDappConfig;
  return {
    ...config,
    isShowComingSoon: process.env.REACT_APP_IS_SHOW_COMING_SOON === 'true' || config.isShowComingSoon,
  };
}

export function getWalletConfigSetting(): IWalletConfigSetting {
  return walletConfig as IWalletConfigSetting;
}

export function getOnChainReferralConfig(): IOnChainReferralCodeConfig {
  return onChainReferralConfig as IOnChainReferralCodeConfig;
}

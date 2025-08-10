import { IVaultChainConfig, IVaultConfig } from '@/types/vault';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import _ from 'lodash';
import * as vaultConfig from '../../configs/vault.json';

export const colWidths = [150, 100, 110, 120, 120];
type TVaultStageInfo = {
  color: string;
  bgColor: string;
  i18nId: string;
};

export const vaultStageInfos: {
  [id in Stage]: TVaultStageInfo;
} = {
  [Stage.INVALID]: {
    color: '#3D4F5C',
    bgColor: 'rgba(61, 79, 92, 0.20)',
    i18nId: 'launchpad.invalid',
  },
  [Stage.LIVE]: {
    color: '#14B84B',
    bgColor: 'rgba(20, 184, 75, 0.20)',
    i18nId: 'launchpad.live',
  },
  [Stage.SUSPENDED]: {
    color: '#FFAA00',
    bgColor: '#FFAA0033',
    i18nId: 'launchpad.suspend',
  },
  [Stage.UPCOMING]: {
    color: '#00BFBF',
    bgColor: 'rgba(0, 191, 191, 0.20)',
    i18nId: 'launchpad.upcoming',
  },
};

export enum VaultActionId {
  'deposit' = 'DEPOSIT',
  'withdrawal' = 'WITHDRAW',
  'depositFor' = 'DEPOSITFOR',
}

type TVaultActionInfo = {
  i18nId: string;
};

export const vaultActionInfos: {
  [id in VaultActionId]: TVaultActionInfo;
} = {
  [VaultActionId['deposit']]: {
    i18nId: 'launchpad.vaultDeposit',
  },
  [VaultActionId['withdrawal']]: {
    i18nId: 'launchpad.vaultWithdrawal',
  },
  [VaultActionId['depositFor']]: {
    i18nId: 'launchpad.vaultDeposit',
  },
};

let vaultConfigSingle = {} as IVaultConfig;

export function getVaultConfig(): IVaultConfig {
  if (vaultConfigSingle.chainConfig) {
    return vaultConfigSingle;
  }
  const config = vaultConfig;

  const chainConfig = _.reduce(
    config.chainConfig,
    (res, curr) => {
      const chainId = curr.chainId;

      res[chainId] = {
        ...curr,
        chainId,
        graphAddr: curr.graphAddr,
      };
      return res;
    },
    {} as {
      [chainId: number]: IVaultChainConfig;
    },
  );
  vaultConfigSingle = {
    ...config,
    chainConfig,
  } as IVaultConfig;
  return vaultConfigSingle;
}

export const LEGAL_DISCLAIMER = 'https://docs.synfutures.com/oyster-amm/perp-launchpad/legal-disclaimer';
export { vaultConfig };

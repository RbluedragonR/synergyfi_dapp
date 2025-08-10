import './index.less';

import classnames from 'classnames';

import { THEME_ENUM } from '@/constants';
import { useTheme } from '@/features/global/hooks';
import { WalletType } from '@/types/wallet';

import React from 'react';
import { useWalletConfig } from '../hook';

export default function WalletBrand({
  type,
  hideName,
  extraDesc,
}: {
  type: WalletType;
  hideName?: boolean;
  extraDesc?: React.ReactNode;
}): JSX.Element | null {
  const walletConfig = useWalletConfig(type);
  const { dataTheme } = useTheme();
  if (!walletConfig) return null;
  return (
    <div className={classnames('wallet-brand')}>
      <img
        loading="lazy"
        src={(dataTheme === THEME_ENUM.DARK && walletConfig?.iconDark) || walletConfig?.icon}
        alt={walletConfig.name}></img>
      {!hideName && (
        <span>
          {walletConfig.name}
          {extraDesc && <span>{extraDesc}</span>}
        </span>
      )}
    </div>
  );
}

/**
 * @description Component-AssetPair
 */
import { IVaultInfo } from '@/types/vault';
import './index.less';

import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  vaultInfo?: IVaultInfo;
}
const AssetPair: FC<IPropTypes> = function ({ vaultInfo }) {
  return vaultInfo ? (
    <a
      onClick={(e) => e.stopPropagation()}
      href={vaultInfo.assetPairLink}
      target="_blank"
      rel="noreferrer"
      className="syn-asset-pair">
      {vaultInfo.assetPair}
    </a>
  ) : null;
};

export default AssetPair;

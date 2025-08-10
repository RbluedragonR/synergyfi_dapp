/**
 * @description Component-VaultProjectName
 */
import './index.less';

import TokenLogo from '@/components/TokenLogo';
import { useVaultInfos } from '@/features/vault/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import MarketTag from '@/pages/Market/MarketTag';
import _ from 'lodash';
import { FC, useMemo } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  nameOnly?: boolean;
  vaultAddr: string;
  vaultName?: string;
}
const VaultProjectName: FC<IPropTypes> = function ({ vaultAddr, nameOnly, vaultName }) {
  const chainId = useChainId();
  const userAddr = useUserAddr();

  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  const vaultInfo = useMemo(() => _.get(vaultInfos, [vaultAddr]), [vaultAddr, vaultInfos]);
  return nameOnly ? (
    <>{vaultInfo?.name}</>
  ) : (
    <div className="syn-vault-project-name">
      <TokenLogo size={40} showChainIcon={true} chainId={chainId} token={vaultInfo?.tokenInfo} />
      <div className="syn-vault-project-name-right">
        {vaultInfo?.name || vaultName}
        <div className="syn-vault-project-name-right-bottom">
          <span className="syn-vault-token-name">${vaultInfo?.tokenInfo.symbol}</span>
          {vaultInfo.tags.map((tag, index) => (
            <MarketTag
              key={index}
              tagName={tag.title}
              tooltip={tag.tooltips}
              tagBgColor={tag.bgColor}
              tagColor={tag.textColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VaultProjectName;

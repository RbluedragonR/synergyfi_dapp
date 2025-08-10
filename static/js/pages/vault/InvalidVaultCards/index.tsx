/**
 * @description Component-InvalidVaultCards
 */
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import './index.less';

import InvalidVaultCard from '@/components/Card/LaunchPadCard/InvalidVaultCard';
import { useWrappedVaults } from '@/features/vault/hook';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import { FC, useMemo } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const InvalidVaultCards: FC<IPropTypes> = function ({}) {
  const userAddr = useUserAddr();
  const chainId = useChainId();
  const vaults = useWrappedVaults(chainId, userAddr);
  const invalidVaults = useMemo(() => {
    return vaults.filter((v) => v.stageForUi === Stage.INVALID && v.getUserDeposit(userAddr).gt(0));
    // return _.take(vaults, 1).filter((v) => v.getUserDeposit(userAddr).gt(0));
  }, [userAddr, vaults]);
  return (
    <div className="syn-invalid-vault-cards">
      {invalidVaults.map((v) => (
        <InvalidVaultCard key={v.vaultAddress} vault={v} />
      ))}
    </div>
  );
};

export default InvalidVaultCards;

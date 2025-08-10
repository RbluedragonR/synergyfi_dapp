/**
 * @description Component-InvalidVaultCard
 */
import { WrappedVault } from '@/entities/WrappedVault';
import VaultMetaCard from '../VaultCard/VaultMetaCard';
import './index.less';

import { Button } from '@/components/Button';
import TokenLogo from '@/components/TokenLogo';
import { useVaultInfos } from '@/features/vault/hook';
import useVaultWithdrawInput from '@/hooks/vault/useWithdrawInput';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import _ from 'lodash';
import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  vault: WrappedVault;
}
const InvalidVaultCard: FC<IPropTypes> = function ({ vault }) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  const { handleWithdraw, isWithdrawing } = useVaultWithdrawInput(vault, userAddr || '');

  return (
    <div className="syn-invalid-vault-card syn-vault-card">
      <div className="syn-invalid-vault-card-title">
        <div className="syn-invalid-vault-card-title-left">
          <TokenLogo size={20} token={vault.quoteToken} />
          <Trans
            i18nKey={'launchpad.cardInvalid'}
            components={{
              span: <span />,
            }}
            values={{ project: _.get(vaultInfos, [vault.vaultAddress])?.name }}
          />
        </div>
        <Button loading={isWithdrawing} onClick={() => handleWithdraw(vault.getUserDeposit(userAddr))}>
          {t('launchpad.withdraw')}
        </Button>
      </div>
      <VaultMetaCard showTvl={false} vault={vault} />
    </div>
  );
};

export default InvalidVaultCard;

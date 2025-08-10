import YourDepositsCard from '@/components/Card/LaunchPadCard/YourDepositsCard';
import VaultGlobalEffect from '@/features/vault/GlobalEffect';
import { useVaultRouteSelectVault } from '@/hooks/vault/useVaultRouter';
import classNames from 'classnames';
import InvalidVaultCards from './InvalidVaultCards';
import LegalDisclaimer from './LegalDisclaimer';
import VaultBanner from './VaultBanner';
import VaultList from './VaultList';
import './index.less';
export default function VaultPage() {
  useVaultRouteSelectVault();

  return (
    <div className="syn-launchpad syn-scrollbar">
      <VaultBanner />
      <LegalDisclaimer />
      <div className="syn-launchpad-content">
        <div className={classNames('syn-launchpad-content-left-wrapper', 'syn-scrollbar')}>
          <div className="syn-launchpad-content-left">
            <VaultList />
          </div>
        </div>

        <div className={classNames('syn-launchpad-content-right-wrapper', 'syn-scrollbar')}>
          <div className="syn-launchpad-content-right">
            <YourDepositsCard />
            <InvalidVaultCards />
          </div>
        </div>
      </div>

      <VaultGlobalEffect />
    </div>
  );
}

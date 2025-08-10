import { ExplorerIcon } from '@/assets/svg';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import TokenLogo from '@/components/TokenLogo';
import { WrappedVault } from '@/entities/WrappedVault';
import { useChainId, useEtherscanLink } from '@/hooks/web3/useChain';
import VaultProjectName from '@/pages/vault/VaultProjectName';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import VaultStatusText from '../VaultStatusText';
import './index.less';
type TTokenVaultTextProps = ComponentProps<'div'> & {
  tokenLogoProps: ComponentProps<typeof TokenLogo>;
  isLinkToExplorer?: boolean;
  vault?: WrappedVault;
  isShownPairs?: boolean;
  isShownPrice?: boolean;
  vaultStage?: {
    isShownStage?: boolean;
    vaultStage?: Stage;
  };
};

export default function TokenVaultText({
  tokenLogoProps,
  className,
  onClick,
  vaultStage,
  vault,
  isLinkToExplorer = false,
  isShownPrice = true,
  ...others
}: TTokenVaultTextProps) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const getEtherscanLink = useEtherscanLink();
  const handleClickEtherscanLink = () => {
    window.open(vault?.vaultAddress && getEtherscanLink(vault?.vaultAddress, 'address'));
  };

  return (
    <div
      onClick={(e) => {
        onClick?.(e);
        isLinkToExplorer && handleClickEtherscanLink();
      }}
      className={classNames('syn-token-vault-text', isLinkToExplorer && 'link-to-explorer', className)}
      {...others}>
      <TokenLogo {...tokenLogoProps} chainId={chainId} showChainIcon={true} />
      <div className="syn-token-vault-text-content">
        <div className="syn-token-vault-text-details">
          <span className="syn-token-vault-text-name">
            <span className="syn-token-vault-text-symbol">
              {vault && <VaultProjectName nameOnly={true} vaultAddr={vault.vaultAddress} />}
            </span>
          </span>
          {isLinkToExplorer && <ExplorerIcon color="var(--theme-text)" />}
          {vaultStage?.isShownStage && vaultStage.vaultStage && (
            <VaultStatusText vaultStage={vaultStage.vaultStage} type="tag" />
          )}
        </div>
        {vault && isShownPrice && (
          <div className="syn-token-vault-text-price">
            {vault.quoteToken.symbol} {t('common.price')}
            <span className="syn-token-vault-text-price-value-usd">
              $
              <EmptyDataWrap isLoading={vault.quoteToken.price === undefined}>
                {vault.quoteToken.price?.formatPriceNumberWithTooltip()}
              </EmptyDataWrap>
              &nbsp;
            </span>
            <span className="syn-token-vault-text-price-value-precent">
              {vault.quoteToken.price_change_percentage_24h?.formatPercentage({
                hundredfold: true,
                colorShader: true,
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

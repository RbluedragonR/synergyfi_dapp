/**
 * @description Component-VaultInfoCard
 */
import { useTranslation } from 'react-i18next';
import './index.less';

import { ExternalLink } from '@/components/Link';
import TokenVaultText from '@/components/Text/TokenVaultText';
import { WrappedVault } from '@/entities/WrappedVault';
import { useVaultInfo } from '@/features/vault/hook';
import { useChainId } from '@/hooks/web3/useChain';
import classNames from 'classnames';
import { ComponentProps, FC, useEffect, useMemo, useRef, useState } from 'react';
import { ReactComponent as IconDiscord } from './assets/icon_sc_discord.svg';
import { ReactComponent as IconFarcaster } from './assets/icon_sc_farcaster.svg';
import { ReactComponent as IconInstagram } from './assets/icon_sc_instagram.svg';
import { ReactComponent as IconTelegram } from './assets/icon_sc_telegram.svg';
import { ReactComponent as IconTwitter } from './assets/icon_sc_twitter.svg';
import { ReactComponent as IconWebsite } from './assets/icon_sc_website.svg';
import { ReactComponent as IconYoutube } from './assets/icon_sc_youtube.svg';

type VaultCardProps = ComponentProps<'div'> & { vault: WrappedVault };

const VaultInfoCard: FC<VaultCardProps> = function ({ vault, className, ...others }) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const vaultInfo = useVaultInfo(chainId, vault?.vaultAddress);

  const [isShowMore, setIsShowMore] = useState(false);

  const [showTrigger, setShowTrigger] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = 16;
      const maxHeight = lineHeight * 3;
      setShowTrigger(contentRef.current.scrollHeight > maxHeight);
    }
  }, [vaultInfo?.describe]);

  const isShowSocials = useMemo(() => {
    return (
      vaultInfo?.website ||
      vaultInfo?.twitter ||
      vaultInfo?.discord ||
      vaultInfo?.youtube ||
      vaultInfo?.telegram ||
      vaultInfo?.instagram ||
      vaultInfo?.farcaster
    );
  }, [
    vaultInfo?.discord,
    vaultInfo?.farcaster,
    vaultInfo?.instagram,
    vaultInfo?.telegram,
    vaultInfo?.twitter,
    vaultInfo?.website,
    vaultInfo?.youtube,
  ]);
  return (
    <div {...others} className={classNames(className, 'syn-vault-info-card')}>
      <div className="syn-vault-info-card-title">
        <div className="syn-vault-info-card-title-left">
          <TokenVaultText
            vault={vault}
            tokenLogoProps={{ token: vault.quoteToken, size: 48 }}
            isLinkToExplorer
            vaultStage={{
              isShownStage: true,
              vaultStage: vault.stageForUi,
            }}
          />
        </div>
      </div>
      <div>
        {vaultInfo?.describe && (
          <div className="syn-vault-info-card-desc">
            <div className="syn-vault-info-card-desc-content">
              <div className={classNames('read-more', isShowMore && 'expanded', showTrigger && 'show-trigger')}>
                <div className="content" ref={contentRef}>
                  <div>{vaultInfo?.describe}</div>
                </div>
                {showTrigger && (
                  <span className="trigger" onClick={() => setIsShowMore(!isShowMore)}>
                    {isShowMore ? t('launchpad.vaultInfo.less') : t('launchpad.vaultInfo.more')}...
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {isShowSocials && (
          <div className="syn-vault-info-card-socials">
            {vaultInfo?.website && (
              <ExternalLink className="vault-social-link" href={vaultInfo?.website} title="Website">
                <IconWebsite />
              </ExternalLink>
            )}
            {vaultInfo?.twitter && (
              <ExternalLink className="vault-social-link" href={vaultInfo.twitter} title="Twitter">
                <IconTwitter />
              </ExternalLink>
            )}
            {vaultInfo?.discord && (
              <ExternalLink className="vault-social-link" href={vaultInfo.discord} title="Discord">
                <IconDiscord />
              </ExternalLink>
            )}
            {vaultInfo?.youtube && (
              <ExternalLink className="vault-social-link" href={vaultInfo.youtube} title="Youtube">
                <IconYoutube />
              </ExternalLink>
            )}
            {vaultInfo?.telegram && (
              <ExternalLink className="vault-social-link" href={vaultInfo.telegram} title="Telegram">
                <IconTelegram />
              </ExternalLink>
            )}
            {vaultInfo?.instagram && (
              <ExternalLink className="vault-social-link" href={vaultInfo.instagram} title="Instagram">
                <IconInstagram />
              </ExternalLink>
            )}
            {vaultInfo?.farcaster && (
              <ExternalLink className="vault-social-link" href={vaultInfo.farcaster} title="Farcaster">
                <IconFarcaster />
              </ExternalLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultInfoCard;

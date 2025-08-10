/**
 * @description Component-PairNotInWhitelist
 */
import { CardWrapper } from '@/components/CardWrapper';
import { THEME_ENUM } from '@/constants';
import TradeEarnTabs from '@/pages/components/Tabs/TradeEarnTabs';
import './index.less';

import { Button } from '@/components/Button';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { WrappedPair } from '@/entities/WrappedPair';
import { useTheme } from '@/features/global/hooks';
import { useVaultInfos } from '@/features/vault/hook';
import { getVaultLink } from '@/hooks/vault/useVaultRouter';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { CreativePair } from '@/types/pair';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MailIcon from './assets/icon_mj_mail.png';
import Remove from './assets/remove.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  isNewPair: boolean;
  currentPair: WrappedPair | CreativePair | undefined;
}
const PairNotInWhitelist: FC<IPropTypes> = function ({ isNewPair, currentPair }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { vaultInfos: vaults } = useVaultInfos(chainId, userAddr);
  const { isMobile } = useMediaQueryDevice();
  const navigate = useNavigate();

  const vault = useMemo(() => {
    if (!vaults) return undefined;
    return Object.values(vaults)?.find(
      (v) =>
        v?.status !== Stage.INVALID &&
        v.tokenInfo.address.toLowerCase() === currentPair?.rootInstrument.quoteToken.address.toLocaleLowerCase(),
    );
  }, [currentPair?.rootInstrument.quoteToken.address, vaults]);
  const vaultLink = useMemo(
    () => getVaultLink({ chainId, vaultAddress: vault?.vaultAddress }),
    [chainId, vault?.vaultAddress],
  );
  return (
    <CardWrapper
      extraHeader={
        !isMobile && (
          <div className="syn-trade-form-earn-header">
            <TradeEarnTabs disableTrade={isNewPair} isTrade={false} pairSymbol={currentPair?.symbol} />
          </div>
        )
      }
      className="syn-earn-area syn-pair-not-in-whitelist"
      footer={
        vault ? (
          <Button type="primary" block target="_blank" onClick={() => !!vaultLink && navigate(vaultLink)}>
            {t('common.earn.depositToVault')}
          </Button>
        ) : (
          <Button type="primary" block href="mailto:info@synfutures.com">
            {t('common.contactUs')}
          </Button>
        )
      }>
      <div className="syn-earn-area-container">
        <div className="syn-earn-area syn-pair-not-in-whitelist-header">
          {vault && (
            <>
              {t('common.earn.whiteListTitleDot')} <a href="mailto:info@synfutures.com">{t('common.contactUs')}</a>
            </>
          )}
        </div>
        {vault ? <img src={Remove} /> : <img src={theme.dataTheme === THEME_ENUM.DARK ? MailIcon : MailIcon} />}
        <div className="syn-earn-area-container-titles">
          {vault ? (
            <div className="syn-earn-area-container-titles-sub">
              {t('common.earn.whiteListVaultTitle', { symbol: vault.tokenInfo.symbol })}
            </div>
          ) : (
            <>
              <div className="syn-earn-area-container-titles-up">{t('common.earn.whiteListTitle')}</div>
              <div className="syn-earn-area-container-titles-sub">{t('common.earn.whiteListSubTitle')}</div>
            </>
          )}
        </div>
      </div>
    </CardWrapper>
  );
};

export default PairNotInWhitelist;

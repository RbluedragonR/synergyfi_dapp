import { CrossIcon } from '@/assets/svg';
import { Button } from '@/components/Button';
import Drawer from '@/components/Drawer';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import Modal from '@/components/Modal';
import { CHAIN_ID } from '@/constants/chain';
import { useCombinedPairFromUrl } from '@/features/pair/hook';
import { usePortfolioOperateToken } from '@/features/portfolio/hook';
import { useTokenExchangeModal } from '@/hooks/trade/useTokenExchange';
import { useChainId, useDappChainConfig, useUserAddr } from '@/hooks/web3/useChain';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import noticeSrc from './asset/Notice.png';
import './index.less';
const getTokenExchangeUrl = (chainId: CHAIN_ID, qouteTokenAddress: string) => {
  const tokenExchangeUrls: { [chainId: number]: string } = {
    [CHAIN_ID.BLAST]: 'https://app.thruster.finance/',
    [CHAIN_ID.BASE]: `https://aerodrome.finance/swap?from=eth&to=${qouteTokenAddress.toLowerCase()}`,
  };
  return tokenExchangeUrls[chainId];
};
export const TokenExchangeContent = () => {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const currentPair = useCombinedPairFromUrl(chainId);
  const portfolioSelectedToken = usePortfolioOperateToken(chainId, userAddr);
  const quoteTokenAddress = currentPair?.rootInstrument?.quoteToken?.address || portfolioSelectedToken?.address;
  const dappConfig = useDappChainConfig(chainId);
  const tokenExchangeUrl = useMemo(() => {
    if (quoteTokenAddress && chainId) {
      if (dappConfig?.extraTokenExchange?.[quoteTokenAddress]) {
        return dappConfig.extraTokenExchange[quoteTokenAddress].url;
      }
      return getTokenExchangeUrl(chainId, quoteTokenAddress);
    }
  }, [chainId, dappConfig?.extraTokenExchange, quoteTokenAddress]);
  const { toggleModal } = useTokenExchangeModal();

  const handleClose = useCallback(() => toggleModal(false), [toggleModal]);

  return (
    <div className="syn-token-exchange-content">
      <span className="syn-token-exchange-content-close" style={{ cursor: 'pointer' }} onClick={handleClose}>
        <CrossIcon />
      </span>
      <img className="syn-token-exchange-content-img" src={noticeSrc} />
      <div className="syn-token-exchange-content-text">
        <div className="syn-token-exchange-content-title">
          <Trans
            i18nKey={'modal.tokenExchange.title'}
            components={{
              black: <span className="syn-token-exchange-content-black" />,
              green: <span className="syn-token-exchange-content-green" />,
            }}
          />
        </div>

        <div className="syn-token-exchange-content-description">{t('modal.tokenExchange.description')}</div>
      </div>
      <div className="syn-token-exchange-content-btns">
        <Button className="syn-token-exchange-content-btns-cancel" onClick={handleClose} type="outline">
          {t('common.cancel')}
        </Button>
        <Button href={tokenExchangeUrl} onClick={handleClose} type="primary">
          {t('common.proceed')}
        </Button>
      </div>
    </div>
  );
};
export default function TokenExchangeModal() {
  const { deviceType, isMobile } = useMediaQueryDevice();
  //const { t } = useTranslation();
  const { isOpenModal, toggleModal } = useTokenExchangeModal();

  return isMobile ? (
    <Drawer
      className={classNames('syn-token-exchange-drawer')}
      height={'auto'}
      placement="bottom"
      closable={true}
      zIndex={10000}
      maskClosable={true}
      onClose={() => {
        toggleModal(false);
      }}
      open={isOpenModal}>
      <TokenExchangeContent />
    </Drawer>
  ) : (
    <Modal
      className={classNames('syn-token-exchange-modal', deviceType)}
      centered={true}
      zIndex={10000}
      open={isOpenModal}
      maskClosable={true}
      onCancel={() => {
        toggleModal(false);
      }}
      closable={true}>
      <TokenExchangeContent />
    </Modal>
  );
}

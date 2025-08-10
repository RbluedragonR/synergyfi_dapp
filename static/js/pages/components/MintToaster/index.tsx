/**
 * @description Component-MintToaster
 */
import './index.less';

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalModalType } from '@/constants';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { useAccountWrap, useToggleModal } from '@/features/global/hooks';
import { useMintToken } from '@/hooks/useTestnet';
import { useChainId } from '@/hooks/web3/useChain';
import { isTestnet } from '@/utils/chain';
import { getMobileMint, saveMobileMint } from '@/utils/localstorage';

import { ReactComponent as IconClose } from './assets/icon_close.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const MintToaster: FC<IPropTypes> = function ({}) {
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  const userWrap = useAccountWrap();
  const chainId = useChainId();
  const { t } = useTranslation();

  const { onClickMintToken, tokenInfo } = useMintToken(chainId);
  const [isClosing, setIsClosing] = useState(false);
  const [seconds, setSeconds] = useState(3);

  const visible = useMemo(() => {
    return (
      chainId &&
      userWrap &&
      tokenInfo &&
      (isTestnet(chainId) || DAPP_CHAIN_CONFIGS[chainId].network.mockTokenConfig) &&
      !getMobileMint(chainId)
    );
  }, [chainId, tokenInfo, userWrap]);

  const onClose = useCallback(() => {
    //
    setIsClosing(true);
    chainId && saveMobileMint(chainId, true);
  }, [chainId]);

  const onMint = useCallback(async () => {
    if (userWrap) {
      await onClickMintToken();
    } else toggleWalletModal();
  }, [onClickMintToken, toggleWalletModal, userWrap]);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (isClosing && visible) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => !!interval && clearInterval(interval);
  }, [isClosing, seconds, visible]);

  useEffect(() => {
    setSeconds(3);
  }, []);

  if (!visible) {
    return null;
  }
  if (isClosing && seconds <= 0) {
    return null;
  }

  return (
    <div className="syn-mint-toaster">
      <div className="syn-mint-toaster-content">
        <div className="syn-mint-toaster-title" onClick={() => onMint && onMint()}>
          {isClosing
            ? t('mobile.global.mint.closingTitle')
            : t('mobile.global.mint.title', { symbol: tokenInfo?.symbol })}
        </div>
        <div className="syn-mint-toaster-btn" onClick={() => onClose && onClose()}>
          {isClosing ? `${seconds}s` : <IconClose className="syn-mint-toaster-btn-close_icon" />}
        </div>
      </div>
    </div>
  );
};

export default MintToaster;

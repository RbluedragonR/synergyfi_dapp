/**
 * @description Component-SettleModalFooter
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { FETCHING_STATUS } from '@/constants';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { settle } from '@/features/portfolio/actions';
import { useSettlingStatus } from '@/features/portfolio/hook';
import { useAppProvider, useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  settlingPortfolio: WrappedPortfolio | undefined;
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
  onCloseModal?: () => void;
}
const SettleModalFooter: FC<IPropTypes> = function ({ settlingPortfolio, onCloseModal, chainId, userAddr }) {
  const dispatch = useAppDispatch();
  const signer = useWalletSigner();
  const provider = useAppProvider();
  const { t } = useTranslation();
  const sdkContext = useSDK(chainId);
  const settlingStatus = useSettlingStatus(chainId, userAddr);

  const onAfterClickSettle = useCallback(async () => {
    try {
      if (chainId && userAddr && signer && sdkContext && provider && settlingPortfolio) {
        const receipt = await dispatch(
          settle({
            signer,
            provider,
            sdkContext,
            chainId,
            userAddr,
            portfolio: settlingPortfolio,
          }),
        ).unwrap();
        if (receipt) onCloseModal && onCloseModal();
      }
    } catch (e) {
      console.error('🚀 ~ file: SettleModalFooter ~ onAfterClickSettle ~ e', e);
    }
  }, [chainId, userAddr, signer, sdkContext, provider, settlingPortfolio, dispatch, onCloseModal]);

  return (
    <div className="syn-deposit-modal-footer">
      <Button
        block
        type="primary"
        loading={settlingStatus === FETCHING_STATUS.FETCHING || false}
        onClick={onAfterClickSettle}>
        {t('common.settle')}
      </Button>
    </div>
  );
};

export default SettleModalFooter;

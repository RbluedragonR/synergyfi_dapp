/**
 * @description Component-TGPBannerWalletConnect
 */
import './index.less';

import { useDebounceFn } from 'ahooks';
// import { useDebounceFn } from 'ahooks';
import classNames from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { GlobalModalType } from '@/constants';
import { useToggleModal } from '@/features/global/hooks';
import { signTGPMsg } from '@/features/tgp/actions';
import { useAppDispatch } from '@/hooks';
import { useWalletAccount, useWalletSigner } from '@/hooks/web3/useWalletNetwork';

import TGPBannerSteps from '../TGPBannerRight/TGPBannerSteps';
import TGPConnectBtn from './TGPConnectBtn';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  jwtToken: string | undefined;
  isMaster: boolean;
}
const TGPBannerWalletConnect: FC<IPropTypes> = function ({ isMaster }) {
  const userAddr = useWalletAccount();
  const toggleModal = useToggleModal(GlobalModalType.Wallet);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const signer = useWalletSigner();

  const { run: onBtnClick } = useDebounceFn(
    async () => {
      if (userAddr) {
        try {
          if (signer) {
            console.log('🚀 ~ signer:', signer);
            const response = await dispatch(signTGPMsg({ userAddr, isMaster, signer })).unwrap();
            if (response) {
              //   response.data && saveOdysseySignatureToLocalForage(response.data);
            }
          }
        } catch (error) {
          toast.error(
            <div className="syn-notification-content">
              <div className="syn-notification-content-title">{t('odyssey.signUp.step1.error')}</div>
            </div>,
          );
        }
      } else {
        toggleModal(true);
      }
    },
    { wait: 200 },
  );

  return (
    <div className={classNames('syn-tgp-banner-wallet-connect', { master: isMaster })}>
      {!userAddr ? (
        <>
          <div className="syn-tgp-banner-wallet-connect-title">
            <span>{t('tgp.banner.joinNow')}</span>
          </div>
          <div className="syn-tgp-banner-wallet-connect-btn">
            <TGPConnectBtn
              isConnect={!!userAddr}
              onClick={() => {
                onBtnClick();
              }}
            />
          </div>
        </>
      ) : (
        <div className="syn-tgp-banner-wallet-connect-steps">
          <TGPBannerSteps />
        </div>
      )}
    </div>
  );
};

export default TGPBannerWalletConnect;

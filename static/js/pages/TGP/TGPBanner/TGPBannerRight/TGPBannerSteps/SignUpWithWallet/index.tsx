/**
 * @description Component-SignUpWithWallet
 */
import './index.less';

import { useDebounceFn } from 'ahooks';
import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { GlobalModalType } from '@/constants';
import { useToggleModal } from '@/features/global/hooks';
import { signTGPMsg } from '@/features/tgp/actions';
import { useTGPDappConfig } from '@/features/tgp/hooks';
import { useAppDispatch } from '@/hooks';
import { useWalletAccount, useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { ODYSSEY_STEP } from '@/types/odyssey';

// import { saveOdysseyJWTToken, saveOdysseySignatureToLocalForage } from '@/utils/storage';
import ConnectSteps from '../ConnectSteps';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  currentStep: ODYSSEY_STEP;
  isMaster: boolean;
}
const SignUpWithWallet: FC<IPropTypes> = function ({ currentStep, isMaster }) {
  const { t } = useTranslation();

  const toggleModal = useToggleModal(GlobalModalType.Wallet);
  const userAddr = useWalletAccount();
  const dispatch = useAppDispatch();
  const signer = useWalletSigner();
  const tgpConfig = useTGPDappConfig();

  const isCurrent = useMemo(() => {
    return currentStep === ODYSSEY_STEP.INIT;
  }, [currentStep]);
  const isActivated = useMemo(() => {
    return currentStep > ODYSSEY_STEP.INIT;
  }, [currentStep]);

  const { run: onBtnClick } = useDebounceFn(
    async () => {
      if (currentStep !== ODYSSEY_STEP.INIT) return;
      if (userAddr) {
        try {
          if (signer) {
            const response = await dispatch(signTGPMsg({ userAddr, signer, isMaster })).unwrap();
            if (response) {
              // response.data && saveOdysseySignatureToLocalForage(response.data);
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
    <div className="syn-tgp-sign-up-with-wallet">
      <ConnectSteps
        stepNumber="01"
        isActivated={isActivated}
        isCurrent={isCurrent}
        content={
          <div>
            <p>
              <Trans
                i18nKey="tgp.banner.agreeRules"
                components={{
                  a: <a href={tgpConfig.tnc} target="_blank" rel="noreferrer" />,
                }}
              />
            </p>
          </div>
        }
        btnName={userAddr ? t('tgp.banner.agree') : t('odyssey.signUp.Connect')}
        onBtnClick={onBtnClick}
      />
    </div>
  );
};

export default SignUpWithWallet;

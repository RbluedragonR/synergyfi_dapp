/**
 * @description Component-TGPBannerStep
 */
import './index.less';

import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useIsMaster, useTGPCurrentStep } from '@/features/tgp/hooks';
import { useWalletAccount } from '@/hooks/web3/useWalletNetwork';

import SignUpWithWallet from './SignUpWithWallet';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPBannerSteps: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const userAddr = useWalletAccount();
  const currentStep = useTGPCurrentStep(userAddr);
  const isMaster = useIsMaster(userAddr);
  return (
    <div className="syn-tgp-banner-steps-container">
      <div className="syn-tgp-banner-steps-title">
        <span>
          {' '}
          <Trans
            i18nKey="tgp.banner.agreeTitle"
            values={{
              role: isMaster ? t('tgp.Master') : t('tgp.Open'),
            }}
            components={{ b: <b /> }}
          />
        </span>
      </div>
      <div className="syn-tgp-banner-steps">
        <SignUpWithWallet currentStep={currentStep} isMaster={isMaster} />
      </div>
    </div>
  );
};

export default TGPBannerSteps;

/**
 * @description Component-SpotSwap
 */
import './index.less';

import { useSwapRefresh } from '@/features/spot/hooks';
import WalletCardWrapper from '@/pages/components/WalletStatus/WalletCardWrapper';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SpotSwapDetail from './SpotSwapDetail';
import SpotSwapFormContent from './SpotSwapFormContent';
import SwapFooter from './SwapFooter';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}

const SpotSwap: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const { handleRefresh } = useSwapRefresh();
  return (
    <div className="syn-spot-swap">
      <WalletCardWrapper
        mode="modal"
        showCloseIcon={false}
        isSpot={true}
        showRefreshIcon={true}
        onRefreshIonClick={handleRefresh}
        className="syn-spot-swap-form"
        bordered={false}
        title={t('common.spot.swap')}
        footer={<SwapFooter />}>
        <SpotSwapFormContent />
        <SpotSwapDetail />
      </WalletCardWrapper>
    </div>
  );
};

export default SpotSwap;

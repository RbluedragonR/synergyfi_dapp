/**
 * @description Component-ConnectWalletSubCard
 */
import React, { FC } from 'react';

import { WalletModalContent } from '@/features/wallet/WalletModalContent';

import './index.less';

const ConnectWalletSubCard: FC = function () {
  return (
    <div className={'syn-connect-wallet-subCard'}>
      {/* <WalletModalHeader></WalletModalHeader> */}
      <WalletModalContent></WalletModalContent>
    </div>
  );
};

export default React.memo(ConnectWalletSubCard);

/**
 * @description Component-PrivyAccountDetailBtn
 */
import './index.less';

import { FC, useState } from 'react';

import { useWalletType } from '@/features/wallet/hook';
import { WalletType } from '@/types/wallet';
import PrivyAccountDetailModal from '../PrivyAccountDetailModal';
import { ReactComponent as IconAcctPrivyQr } from './assets/icon_acct_privy_qr.svg';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PrivyAccountDetailBtn: FC<IPropTypes> = function ({}) {
  const [isShowModal, setIsShowModal] = useState(false);
  const walletType = useWalletType();

  if (walletType !== WalletType.PRIVY) {
    return null;
  }

  return (
    <>
      <div
        className="syn-privy-account-detail-btn"
        onClick={(e) => {
          setIsShowModal(true);
          e.stopPropagation();
        }}>
        <IconAcctPrivyQr />
      </div>
      <PrivyAccountDetailModal
        open={isShowModal}
        onCancel={() => {
          setIsShowModal(false);
        }}
        onOk={() => {
          setIsShowModal(false);
        }}
      />
    </>
  );
};

export default PrivyAccountDetailBtn;

/**
 * @description Component-PrivyAccountDetailModalConent
 */
import './index.less';

import './index.less';

import classnames from 'classnames';

import Copied from '@/components/Copied';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { usePrivy } from '@privy-io/react-auth';
import { QRCodeSVG } from 'qrcode.react';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePrivyUserInfo, usePrivyWalletAddress } from '../../usePrivyWallet';
import { ReactComponent as IconExport } from './assets/icon_export_16.svg';

export const PrivyAccountDetailModalContent: FC = function () {
  const user = usePrivyUserInfo();
  const { t } = useTranslation();
  const { deviceType } = useMediaQueryDevice();
  const privyAddr = usePrivyWalletAddress();
  const { exportWallet } = usePrivy();
  const privyEmail = useMemo(() => {
    const linkedAccounts = user?.linkedAccounts;
    if (linkedAccounts?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const linkedAccount = linkedAccounts[0] as any;
      return linkedAccount?.address || linkedAccount?.email;
    }
    return user?.email?.address;
  }, [user?.email, user?.linkedAccounts]);

  if (!privyAddr) return null;
  return (
    <div className={classnames('syn-privy-account-detail-modal-content', deviceType)}>
      <div className="syn-privy-account-addrs">
        <h2>{privyEmail}</h2>
        <div className="syn-privy-account-address">
          <span>{privyAddr}</span>
          <Copied
            className="syn-privy-account-address-copy"
            title={t('modal.userAddrModal.userAddr.copyTitle')}
            copiedTitle={t('modal.userAddrModal.userAddr.copiedTitle')}
            copyValue={privyAddr}
          />
        </div>
      </div>
      <div className="syn-privy-account-qrcode">
        <QRCodeSVG
          value={privyAddr}
          size={160}
          bgColor={'#ffffff'}
          fgColor={'#000000'}
          level={'L'}
          includeMargin={false}
        />
      </div>
      <a
        className="syn-privy-account-export-key"
        onClick={() => {
          try {
            exportWallet();
          } catch (error) {
            console.log('🚀 ~ onClick={ ~ error:', error);
          }
        }}>
        <IconExport />
        <span>{'Export Embedded Wallet'}</span>
      </a>
    </div>
  );
};

import './UserAddress.less';

import { useTranslation } from 'react-i18next';

import Copied from '@/components/Copied';
import { ExternalLinkIconWithTooltip } from '@/components/Link';
import { useChainId, useEtherscanLink, useUserAddr } from '@/hooks/web3/useChain';
import { shortenAddress } from '@/utils/address';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import PrivyAccountDetailBtn from '@/connectors/privy/PrivyAccountDetailBtn';
import classNames from 'classnames';
import { StatusIcon } from '../UserAddressStatus/StatusIcon';
import { ReactComponent as IconAcctLink } from './assets/icon_acct_new.svg';

export default function UserAddress(): JSX.Element | null {
  const chainId = useChainId();
  const account = useUserAddr();
  const getEtherscanLink = useEtherscanLink();
  const { t } = useTranslation();
  const { deviceType, isMobile } = useMediaQueryDevice();
  return (
    <div className={classNames('user-address', deviceType)}>
      <div className="user-address__left">
        <StatusIcon size={isMobile ? 16 : 24}></StatusIcon>
        <span> {account && shortenAddress(account, true)} </span>
      </div>
      <div className="user-address__right">
        {account && (
          <Copied
            title={t('modal.userAddrModal.userAddr.copyTitle')}
            copiedTitle={t('modal.userAddrModal.userAddr.copiedTitle')}
            copyValue={account}
          />
        )}
        {chainId && account && (
          <ExternalLinkIconWithTooltip
            type="secondary"
            className="user-address-btn"
            icon={<IconAcctLink />}
            href={chainId && getEtherscanLink(account || '', 'address')}
          />
        )}
        <PrivyAccountDetailBtn />
      </div>
    </div>
  );
}

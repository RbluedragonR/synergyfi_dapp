import './index.less';

import classNames from 'classnames';
import { useMemo } from 'react';

import { Desktop, useMediaQueryDevice } from '@/components/MediaQuery';
import { useSortedTransactionList } from '@/features/transaction/hook';
import PendingTx from '@/features/transaction/PendingTx';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { shortenAddress } from '@/utils/address';

import { StatusIcon } from './StatusIcon';

export default function UserAddressStatus(): JSX.Element | null {
  const { deviceType, isMobile } = useMediaQueryDevice();
  const account = useUserAddr();
  const chainId = useChainId();
  const txList = useSortedTransactionList(chainId, account);
  const pendingTxs = useMemo(() => {
    return txList.filter((tx) => !tx.receipt);
  }, [txList]);
  return (
    <div className={classNames('user-address-status', deviceType)}>
      {!(isMobile && pendingTxs.length) && <StatusIcon size={isMobile ? 24 : 16} />}
      <PendingTx>
        <Desktop>
          <span className="user-address-account">{shortenAddress(account || '', true)}</span>
        </Desktop>
      </PendingTx>
    </div>
  );
}

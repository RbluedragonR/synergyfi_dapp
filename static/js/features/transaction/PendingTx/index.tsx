import './PendingTx.less';

import classNames from 'classnames';
import { useMemo } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { useSortedTransactionList } from '../hook';
import { ReactComponent as IconRefresh } from './assets/icon_refresh_solid.svg';

export default function PendingTx({ children }: { children?: JSX.Element }): JSX.Element | null {
  const chainId = useChainId();
  const { isMobile, deviceType } = useMediaQueryDevice();
  const account = useUserAddr();
  const txList = useSortedTransactionList(chainId, account);
  const pendingTxs = useMemo(() => {
    return txList.filter((tx) => !tx.receipt);
  }, [txList]);
  if (pendingTxs.length < 1) {
    return children || null;
  }
  return (
    <div className={classNames('pending-tx', deviceType)}>
      {!isMobile && <span>{pendingTxs.length} Pending...</span>}
      <IconRefresh className="pending-tx-icon" />
    </div>
  );
}

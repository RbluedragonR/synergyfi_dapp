/**
 * @description Component-TxTimestamp
 */
import { useEtherscanLink } from '@/hooks/web3/useChain';
import './index.less';

import moment from 'moment';
import { FC, useMemo } from 'react';
import { ExternalLink } from '../Link';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  txHash?: string;
  timestamp: string;
}
const TxTimestamp: FC<IPropTypes> = function ({ txHash, timestamp }) {
  const getEtherScanlink = useEtherscanLink();
  const scanLink = useMemo(
    () => (txHash ? getEtherScanlink(txHash, 'transaction') : undefined),
    [getEtherScanlink, txHash],
  );
  return scanLink ? (
    <ExternalLink className="syn-tx-timestamp" href={scanLink}>
      {moment.utc(timestamp).local().format('MM-DD HH:mm:ss')}
    </ExternalLink>
  ) : (
    <span className="syn-tx-timestamp-time-only"> {moment.utc(timestamp).local().format('MM-DD HH:mm:ss')}</span>
  );
};

export default TxTimestamp;

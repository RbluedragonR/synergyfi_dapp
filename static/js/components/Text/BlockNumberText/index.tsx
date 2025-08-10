import { useBlockInfo } from '@/features/socket/hooks';
import { useChainId, useDappChainConfig } from '@/hooks/web3/useChain';
import { formatDate } from '@/utils/timeUtils';
import { Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import './index.less';
export default function BlockNumberText(): JSX.Element {
  const { t } = useTranslation();
  const config = useDappChainConfig();
  const chainId = useChainId();
  const blockStatus = useBlockInfo(chainId);

  return (
    <div className="syn-block-number-text">
      <img className="syn-block-number-text-icon" src={config?.network.icon} />
      <div className="syn-block-number-text-line" />
      {blockStatus ? (
        <>
          {t('common.blockFooter', {
            blockNumber: blockStatus.blockNum,
            timestamp: ` (${formatDate(blockStatus.blockTime * 1000, 'MMM-DD-YYYY LTS')})`,
          })}
        </>
      ) : (
        <>
          {t('common.blockFooter', {
            blockNumber: '',
            timestamp: '',
          })}
          {<Skeleton active={true} paragraph={{ rows: 0 }} />}
        </>
      )}
    </div>
  );
}

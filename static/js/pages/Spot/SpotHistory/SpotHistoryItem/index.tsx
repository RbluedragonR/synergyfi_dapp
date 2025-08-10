/**
 * @description Component-SpotHistoryItem
 */
import { ArrowRightIcon } from '@/assets/svg/icons/arrow';
import './index.less';

import { ExternalLink } from '@/components/Link';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useEtherscanLink } from '@/hooks/web3/useChain';
import { OrderHistory } from '@synfutures/sdks-aggregator-datasource';
import { formatUnits } from 'ethers/lib/utils';
import moment from 'moment';
import { FC } from 'react';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  item: OrderHistory;
}
const SpotHistoryItem: FC<IPropTypes> = function ({ item }) {
  const getEtherscanLink = useEtherscanLink();
  return (
    <div className="syn-spot-history-item">
      <div className="syn-spot-history-item-left">
        <ExternalLink
          href={getEtherscanLink(item.transactionHash, 'transaction')}
          className="syn-spot-history-item-left-time">
          {moment(item.timestamp * 1000).format('MM-DD HH:mm:ss')}
        </ExternalLink>
      </div>
      <div className="syn-spot-history-item-middle">
        {WrappedBigNumber.from(formatUnits(item.fromAmount, item.fromToken.decimals)).formatNumberWithTooltip({
          isShowTBMK: true,
          suffix: item.fromToken.symbol,
          isShowSuffixInTooltip: true,
        })}{' '}
        <ArrowRightIcon />
      </div>
      <div className="syn-spot-history-item-right">
        {WrappedBigNumber.from(formatUnits(item.returnAmount, item.toToken.decimals)).formatNumberWithTooltip({
          isShowTBMK: true,
          suffix: item.toToken.symbol,
          isShowSuffixInTooltip: true,
        })}{' '}
      </div>
    </div>
  );
};

export default SpotHistoryItem;

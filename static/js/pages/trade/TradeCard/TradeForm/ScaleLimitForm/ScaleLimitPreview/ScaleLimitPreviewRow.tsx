/**
 * @description Component-ScaleLimitPreviewRow
 */
import { ISimulationOrder } from '@/types/trade';
import './index.less';

import { IconToolTip } from '@/components/ToolTip';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { WrappedPair } from '@/entities/WrappedPair';
import { ITokenPrice } from '@/features/global/type';
import classNames from 'classnames';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  order: ISimulationOrder;
  orderList: WrappedOrder[] | undefined;
  currentPair?: WrappedPair | undefined;
  tokenPriceInfo: ITokenPrice | undefined;
}
const ScaleLimitPreviewRow: FC<IPropTypes> = function ({ order, orderList, currentPair, tokenPriceInfo }) {
  const isOrdered = useMemo(() => orderList?.some((o) => o.tick === order.tick), [order.tick, orderList]);
  const { t } = useTranslation();
  return (
    <div key={order.tick} className={classNames('syn-scale-limit-preview-table-row', { ordered: isOrdered })}>
      <span>
        {WrappedBigNumber.from(order.limitPrice || 0).formatPriceNumberWithTooltip({})}
        {isOrdered && <IconToolTip title={t('common.tradePage.warningMsg.ordered')} />}
      </span>
      <span>
        {WrappedBigNumber.from(order.size.base).formatNumberWithTooltip({
          suffix: currentPair?.rootInstrument.baseToken.symbol,
        })}
      </span>
      <span>
        {WrappedBigNumber.from(order.margin).formatNumberWithTooltip({
          suffix: currentPair?.rootInstrument.quoteToken.symbol,
        })}
      </span>
      <span>
        {WrappedBigNumber.from(order.tradeValue).formatNumberWithTooltip({
          suffix: currentPair?.rootInstrument.quoteToken.symbol,
        })}
      </span>
      <span>
        {WrappedBigNumber.from(order.minFeeRebate)
          .mul(tokenPriceInfo?.current || 1)
          .formatNumberWithTooltip({
            isShowApproximatelyEqualTo: true,
            prefix: '$',
          })}
      </span>
    </div>
  );
};

export default ScaleLimitPreviewRow;

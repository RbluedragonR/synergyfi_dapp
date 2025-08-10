/**
 * @description Component-LiquidityRemoveTooltip
 */
import './index.less';

import { ITradeHistory } from '@/types/graph';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
interface IPropTypes {
  record: ITradeHistory;
}
const LiquidityRemoveTooltip: FC<IPropTypes> = function ({ record }) {
  const { t } = useTranslation();
  return (
    <span className="syn-liquidity-remove-tooltip">
      {record.isRangeLiquidated
        ? t('tooltip.portfolio.history.tradeHistory.liqRemoved')
        : t(`tooltip.portfolio.history.tradeHistory.liqRemove`)}
    </span>
  );
};

export default LiquidityRemoveTooltip;

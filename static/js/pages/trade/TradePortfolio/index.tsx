/**
 * @description Component-TradePositions
 */
import './index.less';

import Card from '@/components/Card';
import { useIsChosenOrder } from '@/features/trade/hooks';
import { useStaticPinObserver } from '@/hooks/useStickyPin';
import classNames from 'classnames';
import React, { FC, useRef } from 'react';

import EarnLiquidities from '@/pages/earn/EarnLiquidities';
import HistoryWrapper from './HistoryWrapper';
import TradeOpenOrders from './TradeOpenOrders';
// import Transfers from './Transfers';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradePortfolio: FC<IPropTypes> = function ({ className }) {
  const isChosenOrder = useIsChosenOrder();
  const tabsHeaderStickyRef = useRef<HTMLDivElement>(null);

  useStaticPinObserver(tabsHeaderStickyRef);

  return (
    <Card className={classNames(className, 'syn-trade-positions')}>
      <div className="syn-trade-positions-content">
        <TradeOpenOrders isEditing={isChosenOrder} />
        <EarnLiquidities />
        <HistoryWrapper />
      </div>
    </Card>
  );
};

export default TradePortfolio;

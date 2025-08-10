/**
 * @description Component-TradeMobileOrdersTrade
 */
import './index.less';

import _ from 'lodash';
import React, { FC, useMemo } from 'react';

import { getImrStepRatio } from '@/constants/trade';
import { OrderEventListener } from '@/features/pair/EventListener';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useChainId } from '@/hooks/web3/useChain';
import OrderBook from '@/pages/trade/CoinPriceChart/OrderBook';

import TradeFormMobile from '../TradeFormMobile';
import TradeFormMobileMessages from '../TradeFormMobileMessages';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradeMobileOrdersTrade: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const currentPair = useCurrentPairFromUrl(chainId);
  const stepRatio = useMemo(
    () => _.last(getImrStepRatio(currentPair?.rootInstrument.metaFutures.setting.initialMarginRatio)),
    [currentPair],
  );
  return (
    <div className="syn-trade-mobile-orders-trade">
      <div className="syn-trade-mobile-orders-trade-top">
        <OrderBook stepRatio={stepRatio as number} pair={currentPair} chainId={chainId} />
        <TradeFormMobile />
      </div>
      <div className="syn-trade-mobile-orders-trade-bottom">
        <TradeFormMobileMessages />
      </div>

      <OrderEventListener instrument={currentPair?.rootInstrument} />
    </div>
  );
};

export default TradeMobileOrdersTrade;

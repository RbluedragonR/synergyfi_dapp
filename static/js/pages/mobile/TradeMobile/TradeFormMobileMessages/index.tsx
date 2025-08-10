/**
 * @description Component-TradeFormMobileMessages
 */
import './index.less';

import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';

import { GOT_PRICE_ROUNDED } from '@/constants/storage';
import { TRADE_TYPE } from '@/constants/trade';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useLimitSimulation, useMarketSimulation, useTradeType } from '@/features/trade/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useChainId } from '@/hooks/web3/useChain';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { isWrappedNativeToken } from '@/utils/token';

import SettingsDrawer from './SettingsDrawer';
import TradeDetailsDrawer from './TradeDetailsDrawer';
import TradeLimitMessages from './TradeLimitMessages';
import TradeMarginRequiredMobile from './TradeMarginRequiredMobile';
import TradeMarketMessages from './TradeMarketMessages';
import WrapNativeDrawer from './WrapNativeDrawer';

interface IPropTypes {
  className?: string;
}
const TradeFormMobileMessages: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const tradeType = useTradeType(chainId);
  const marketSimulation = useMarketSimulation(chainId);
  const limitSimulation = useLimitSimulation(chainId);

  const currentPair = useCurrentPairFromUrl(chainId);
  const [, setGotPriceRounded] = useState(false);
  const walletConnectStatus = useWalletConnectStatus();

  const simulation = useMemo(
    () => (tradeType === TRADE_TYPE.LIMIT ? limitSimulation : marketSimulation),
    [limitSimulation, marketSimulation, tradeType],
  );
  const isWrappedNative = useMemo(
    () => chainId && isWrappedNativeToken(chainId, currentPair?.rootInstrument.marginToken?.address || ''),
    [chainId, currentPair?.rootInstrument.marginToken?.address],
  );
  useEffect(() => {
    setGotPriceRounded(!!localStorage.getItem(GOT_PRICE_ROUNDED));
  }, []);
  if (walletConnectStatus === WALLET_CONNECT_STATUS.UN_CONNECT && !simulation?.data) {
    return <></>;
  }
  return (
    <div
      className={classNames('syn-trade-form-mobile-messages', {
        hide: !simulation?.data && !isWrappedNative,
      })}>
      {tradeType === TRADE_TYPE.MARKET && <TradeMarketMessages />}
      {tradeType === TRADE_TYPE.LIMIT && <TradeLimitMessages />}
      <div className="syn-trade-form-mobile-messages-bottom">
        <TradeMarginRequiredMobile />
        <div className="syn-trade-form-mobile-messages-btns">
          {simulation?.data && (
            <>
              <TradeDetailsDrawer />
              <SettingsDrawer />
            </>
          )}
          {isWrappedNative && <WrapNativeDrawer />}
        </div>
      </div>
    </div>
  );
};

export default TradeFormMobileMessages;

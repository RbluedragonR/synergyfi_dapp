/**
 * @description Component-TradeMarginRequiredMobile
 */
import './index.less';

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ArrowRight } from '@/assets/svg/arrow-right.svg';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useMainPosition } from '@/features/account/positionHook';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useLimitSimulation, useMarketSimulation, useTradeType } from '@/features/trade/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import AvailableMarginDrawer from '@/pages/components/AvailableMarginDrawer';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradeMarginRequiredMobile: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const tradeType = useTradeType(chainId);
  const marketSimulation = useMarketSimulation(chainId);
  const limitSimulation = useLimitSimulation(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const { t } = useTranslation();
  const walletConnectStatus = useWalletConnectStatus();
  const simulation = useMemo(
    () => (tradeType === TRADE_TYPE.MARKET ? marketSimulation : limitSimulation),
    [limitSimulation, marketSimulation, tradeType],
  );

  return (
    <div className="syn-trade-margin-required-mobile">
      {walletConnectStatus !== WALLET_CONNECT_STATUS.UN_CONNECT && <AvailableMarginDrawer chainId={chainId} />}
      {simulation?.data && (
        <>
          {(currentPosition?.size.eq(0) || limitSimulation?.data) && (
            <dl className="margin">
              <dt>{t('common.marginRequired')}</dt>
              <div className="syn-trade-margin-required-mobile-line"></div>
              <dd>
                {simulation?.data.margin?.formatNumberWithTooltip({
                  suffix: currentPair?.rootInstrument.marginToken?.symbol,
                })}
              </dd>
            </dl>
          )}
          {marketSimulation?.data && !currentPosition?.size.eq(0) && (
            <dl className="margin">
              <dt>{t('common.leverage')}</dt>
              <div className="syn-trade-margin-required-mobile-line"></div>
              <dd>
                {currentPosition?.wrapAttribute('leverageWad').formatLeverageWithTooltip()}
                <ArrowRight />
                {WrappedBigNumber.from(marketSimulation?.data?.leverage || 0)?.formatLeverageWithTooltip()}
              </dd>
            </dl>
          )}
        </>
      )}
    </div>
  );
};

export default TradeMarginRequiredMobile;

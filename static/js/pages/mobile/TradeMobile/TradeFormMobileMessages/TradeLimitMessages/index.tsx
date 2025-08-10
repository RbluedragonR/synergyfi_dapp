/**
 * @description Component-TradeLimitMessages
 */
import './index.less';

import React, { FC, useCallback } from 'react';

import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useWrappedPortfolioByPairId } from '@/features/account/portfolioHook';
import { useCurrentPairByDevice } from '@/features/pair/hook';
import { setTradeFormType } from '@/features/trade/actions';
import { useLimitFormState, useTradeSide } from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import TradeFormAlert from '@/pages/trade/TradeCard/TradeForm/TradeFormAlert';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradeLimitMessages: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const tradeSide = useTradeSide(chainId);
  const sdkContext = useSDK(chainId);
  const limitFormState = useLimitFormState(chainId);
  const dispatch = useAppDispatch();
  const currentPair = useCurrentPairByDevice(chainId);
  const portfolio = useWrappedPortfolioByPairId(chainId, userAddr, currentPair?.id);

  const onNativeTokenDepositClick = useCallback(() => {
    chainId &&
      dispatch(
        setTradeFormType({
          chainId,
          tradeType: TRADE_TYPE.DEPOSIT_NATIVE,
        }),
      );
  }, [chainId, dispatch]);

  const onMaxBalanceClick = useCallback(
    (balance: WrappedBigNumber) => {
      if (chainId && portfolio && sdkContext) {
        console.log('🚀 ~ balance:', balance);
        // TODO: simulate order by margin
        // dispatch(
        //   orderSimulate({
        //     chainId,
        //     sdkContext,
        //     base: toWad(limitFormState.baseAmount || 0),
        //     tradeSide,
        //     limitPrice: limitFormState.alignedPrice,
        //     portfolio,
        //     leverage: undefined,
        //     margin: balance.stringValue,
        //   }),
        // );
      }
    },
    [chainId, dispatch, limitFormState.alignedPrice, limitFormState.baseAmount, portfolio, sdkContext, tradeSide],
  );
  return (
    <div className="syn-trade-limit-messages">
      <TradeFormAlert
        chainId={chainId}
        tradeType={TRADE_TYPE.LIMIT}
        tradeSimulation={undefined}
        marginToken={currentPair?.rootInstrument?.marginToken}
        onMaxBalanceClick={onMaxBalanceClick}
        onNativeTokenDepositClick={onNativeTokenDepositClick}
      />
    </div>
  );
};

export default TradeLimitMessages;

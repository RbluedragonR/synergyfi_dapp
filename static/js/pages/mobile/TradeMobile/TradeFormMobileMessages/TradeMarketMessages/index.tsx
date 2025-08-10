/**
 * @description Component-TradeMarketMessages
 */
import './index.less';

import { Alert } from 'antd';
import React, { FC, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ExternalLink } from '@/components/Link';
import { FAQ_LINKS } from '@/constants/links';
import { ERROR_MSG_IMR } from '@/constants/simulation';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useMainPosition } from '@/features/account/positionHook';
import { useGlobalConfig } from '@/features/global/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { clearMarketTradeSimulation, setTradeFormType, simulateMarketTrade } from '@/features/trade/actions';
import { useMarketFormState, useMarketSimulation, useTradeMaxLeverage, useTradeSide } from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import TradeFormAlert from '@/pages/trade/TradeCard/TradeForm/TradeFormAlert';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  leverageChanged?: (val: string) => void;
}
const TradeMarketMessages: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const simulation = useMarketSimulation(chainId);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const { slippage } = useGlobalConfig(chainId);
  const tradeSide = useTradeSide(chainId);
  const marketFormState = useMarketFormState(chainId);
  const sdkContext = useSDK(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const maxLeverage = useTradeMaxLeverage(currentPair?.maxLeverage);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const isShowLeverageWarning = useMemo(() => {
    return (simulation?.data?.exceedMaxLeverage && !simulation.data.leverage.eq(0)) || false;
  }, [simulation?.data?.exceedMaxLeverage, simulation?.data?.leverage]);
  // const leverageInputAmountStrChanged = useCallback(
  //   async (inputAmountStr: string) => {
  //     leverageChanged && leverageChanged(inputAmountStr);
  //   },
  //   [leverageChanged],
  // );
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
      if (chainId && currentPosition && sdkContext && userAddr) {
        if (WrappedBigNumber.from(marketFormState?.baseAmount).lte(0)) {
          dispatch(clearMarketTradeSimulation({ chainId }));
          return;
        }
        dispatch(
          simulateMarketTrade({
            chainId,
            sdkContext,
            position: currentPosition,
            base: marketFormState.baseAmount,
            tradeSide,
            slippage: Number(slippage),
            userAddr,
            margin: balance.stringValue,
            maxLeverage,
          }),
        );
      }
    },
    [
      chainId,
      currentPosition,
      dispatch,
      marketFormState.baseAmount,
      sdkContext,
      slippage,
      tradeSide,
      userAddr,
      maxLeverage,
    ],
  );
  return (
    <div className="syn-trade-market-messages">
      {simulation?.message === ERROR_MSG_IMR && (
        <Alert
          message={
            <div className="syn-trade-market-form-alert">
              <span>
                {t(simulation?.message || '')}
                {'. '}
              </span>
              {/* <a
                onClick={() => {
                  leverageInputAmountStrChanged(maxLeverage.toString());
                }}>
                {t('common.tradePage.enableLeverage')}
              </a> */}
            </div>
          }
          type="error"
          showIcon
        />
      )}
      {isShowLeverageWarning && (
        <Alert
          message={
            <>
              <Trans
                t={t}
                i18nKey={'common.tradePage.exceedMaxLeverage'}
                values={{
                  leverage: WrappedBigNumber.from(simulation?.data?.leverage || 0).formatLeverageString(),
                }}
                components={{ b: <b /> }}
              />
              {FAQ_LINKS.PNL_FAQ && <ExternalLink href={FAQ_LINKS.PNL_FAQ}>{t('common.learnMore')}</ExternalLink>}
            </>
          }
          type="warning"
          showIcon></Alert>
      )}
      <TradeFormAlert
        chainId={chainId}
        tradeType={TRADE_TYPE.MARKET}
        tradeSimulation={simulation}
        marginToken={currentPair?.rootInstrument?.marginToken}
        onMaxBalanceClick={onMaxBalanceClick}
        onNativeTokenDepositClick={onNativeTokenDepositClick}
      />
    </div>
  );
};

export default TradeMarketMessages;

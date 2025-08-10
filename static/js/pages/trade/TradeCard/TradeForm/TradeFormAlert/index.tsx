/**
 * @description Component-TradeFormAlert
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import I18nTrans from '@/components/I18nTrans';
import { SLIPPAGE_THRESHOLDS } from '@/constants/global';
import { ERROR_MSG_EXCEED_WALLET_BALANCE, ERROR_MSG_IMR } from '@/constants/simulation';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { useAvailableTokenBalance, useTokenBalance } from '@/features/balance/hook';
import { useNativeToken } from '@/features/chain/hook';
import { useGlobalConfig } from '@/features/global/hooks';
import { useCurrentPairByDevice } from '@/features/pair/hook';
import {
  useCanPlaceCrossMarketOrder,
  useCrossMarketSimulation,
  useLimitSimulation,
  useScaleSimulation,
  useSimulationAdditionalFeeUSD,
} from '@/features/trade/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useDappChainConfig } from '@/hooks/web3/useChain';
import { ISimulation } from '@/types/trade';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { isNativeTokenAddr, isWrappedNativeToken } from '@/utils/token';
interface IPropTypes {
  chainId: CHAIN_ID | undefined;
  marginToken: WrappedQuote | undefined;
  tradeType: TRADE_TYPE;
  isClosing?: boolean;
  onMaxBalanceClick?: (balance: WrappedBigNumber) => void;
  onNativeTokenDepositClick?: (balance: WrappedBigNumber) => void;
  tradeSimulation: ISimulation | undefined;
}
const TradeFormAlert: FC<IPropTypes> = function ({
  chainId,
  marginToken,
  tradeType,
  onMaxBalanceClick,
  onNativeTokenDepositClick,
  isClosing,
  tradeSimulation,
}) {
  const { t } = useTranslation();
  const { slippage } = useGlobalConfig(chainId);
  const nativeToken = useNativeToken(chainId);
  const currentPair = useCurrentPairByDevice(chainId);
  const dappConfig = useDappChainConfig(chainId);
  const nativeTokenBalance = useTokenBalance(dappConfig?.nativeToken?.address, dappConfig?.network.chainId, true);
  const availableBalance = useAvailableTokenBalance(marginToken?.address, chainId, true);
  const limitSimulation = useLimitSimulation(chainId);
  const crossMarketSimulation = useCrossMarketSimulation(chainId);
  const scaleLimitSimulation = useScaleSimulation(chainId);
  const canPlaceCrossMarketOrder = useCanPlaceCrossMarketOrder(chainId);

  const simulation = useMemo(() => {
    if (tradeType === TRADE_TYPE.LIMIT) {
      return canPlaceCrossMarketOrder ? crossMarketSimulation : limitSimulation;
    }
    if (tradeType === TRADE_TYPE.SCALE_LIMIT) {
      return scaleLimitSimulation;
    }
    return tradeSimulation;
  }, [
    canPlaceCrossMarketOrder,
    crossMarketSimulation,
    limitSimulation,
    scaleLimitSimulation,
    tradeSimulation,
    tradeType,
  ]);
  const insufficientWalletBalanceMsg = useMemo(() => {
    if (simulation?.message === ERROR_MSG_EXCEED_WALLET_BALANCE.errorData) {
      let maxBalanceTip;
      if (onMaxBalanceClick && availableBalance.gte(simulation.data?.margin || 0)) {
        maxBalanceTip = (
          <a
            className="trade-form-alert-link"
            onClick={() => {
              onMaxBalanceClick && onMaxBalanceClick(availableBalance);
            }}>
            {t('common.useMax')} {availableBalance.formatNumberWithTooltip({ suffix: marginToken?.symbol })}
          </a>
        );
      }
      if (chainId && isWrappedNativeToken(chainId, marginToken?.address || '')) {
        maxBalanceTip = (
          <div>
            <a
              className="trade-form-alert-link"
              onClick={() => {
                onNativeTokenDepositClick && onNativeTokenDepositClick(availableBalance);
              }}>
              {t('common.depositForm.wantSwap', {
                nativeSymbol: nativeToken?.symbol,
                wrapSymbol: marginToken?.symbol,
              })}
            </a>
          </div>
        );
      }

      return (
        <>
          <span>{t(simulation?.message || '')}. </span>
          {maxBalanceTip}
        </>
      );
    }
  }, [
    simulation?.data?.margin,
    simulation?.message,
    onMaxBalanceClick,
    availableBalance,
    chainId,
    marginToken?.address,
    marginToken?.symbol,
    t,
    nativeToken?.symbol,
    onNativeTokenDepositClick,
  ]);

  const errMsg = useMemo(() => {
    if (simulation?.message === ERROR_MSG_EXCEED_WALLET_BALANCE.errorData) {
      return insufficientWalletBalanceMsg;
    }
    if (
      (tradeType === TRADE_TYPE.CLOSE_POSITION || isClosing) &&
      simulation?.message === 'Insufficient margin to open position'
    ) {
      return t('errors.trade.insuffBalToClosePosition');
    }
    return t(simulation?.errorData || simulation?.message || '');
  }, [insufficientWalletBalanceMsg, isClosing, simulation?.errorData, simulation?.message, t, tradeType]);

  // const { isShowVaultChange } = useSimulationBalanceChange(chainId, marginToken);

  const walletConnectStatus = useWalletConnectStatus();

  const needHide = useMemo(() => false, []);

  const isShowSimulateError = useMemo(() => {
    return errMsg && !needHide;
  }, [errMsg, needHide]);

  const additionalFeeUSD = useSimulationAdditionalFeeUSD(tradeSimulation?.data, marginToken?.price);
  const isShowAdditionalFee = useMemo(() => {
    return tradeSimulation?.data?.additionalFee.gt(0);
  }, [tradeSimulation?.data?.additionalFee]);

  // is price impact warning
  const isShowPriceImpactWarning = useMemo(() => {
    return (
      currentPair?.rootInstrument.setting.maintenanceMarginRatio &&
      tradeSimulation?.data?.priceChangeRate?.abs().gte(currentPair?.mmr)
    );
  }, [
    currentPair?.mmr,
    currentPair?.rootInstrument.setting.maintenanceMarginRatio,
    tradeSimulation?.data?.priceChangeRate,
  ]);

  const isShowNativeTokenBalanceWarning = useMemo(() => {
    if (
      walletConnectStatus !== WALLET_CONNECT_STATUS.UN_CONNECT &&
      nativeTokenBalance &&
      isNativeTokenAddr(marginToken?.address || '')
    ) {
      if (nativeTokenBalance.lte(dappConfig?.minNativeTokenKeep || 0)) {
        return true;
      }

      return false;
    }
  }, [walletConnectStatus, nativeTokenBalance, marginToken?.address, dappConfig?.minNativeTokenKeep]);

  const isShowSlippageHighAlert = useMemo(() => {
    return tradeType !== TRADE_TYPE.LIMIT && WrappedBigNumber.from(slippage).gte(SLIPPAGE_THRESHOLDS.HIGH);
  }, [slippage, tradeType]);

  const isShowWarning = useMemo(() => {
    if (isShowSimulateError) return false;

    return (
      isShowPriceImpactWarning || isShowAdditionalFee || isShowNativeTokenBalanceWarning || isShowSlippageHighAlert
    );
  }, [
    isShowAdditionalFee,
    isShowSimulateError,
    isShowNativeTokenBalanceWarning,
    isShowPriceImpactWarning,
    isShowSlippageHighAlert,
  ]);

  const isShowDepositInfo = useMemo(() => {
    const margin = simulation?.data?.marginToDeposit;
    return !simulation?.message && margin && !margin.eq(0);
  }, [simulation?.data?.marginToDeposit, simulation?.message]);

  const depositInfo = useMemo(() => {
    const margin = WrappedBigNumber.from(simulation?.data?.marginToDeposit || 0);
    if (isShowDepositInfo) {
      return (
        <Alert
          message={
            <Trans
              t={t}
              i18nKey={'errors.trade.depositInfo'}
              values={{
                deposit: margin?.abs().formatDisplayNumber(),
                quote: marginToken?.symbol,
              }}
              components={{ b: <b /> }}
            />
          }
          type="info"
          showIcon
        />
      );
    }
  }, [isShowDepositInfo, marginToken?.symbol, simulation?.data?.marginToDeposit, t]);

  // const vaultChangeInfo = useMemo(() => {
  //   const margin = WrappedBigNumber.from(simulation?.data?.margin || 0).min(simulation?.data?.marginToDeposit || 0);
  //   let i18Key = 'errors.trade.depositInfoVault';
  //   if (vaultBalanceAfter && vaultBalanceBefore?.gt(vaultBalanceAfter)) {
  //     i18Key = 'errors.trade.depositInfoVaultOut';
  //   }
  //   if (isShowVaultChange && margin && !margin.eq(0)) {
  //     return (
  //       <Alert
  //         message={
  //           <Trans
  //             t={t}
  //             i18nKey={i18Key}
  //             values={{
  //               deposit: margin?.abs().formatDisplayNumber(),
  //               quote: marginToken?.symbol,
  //             }}
  //             components={{ b: <b /> }}
  //           />
  //         }
  //         type="info"
  //         showIcon
  //       />
  //     );
  //   }
  // }, [
  //   isShowVaultChange,
  //   marginToken?.symbol,
  //   simulation?.data?.margin,
  //   simulation?.data?.marginToDeposit,
  //   t,
  //   vaultBalanceAfter,
  //   vaultBalanceBefore,
  // ]);

  const isShowInfo = useMemo(() => {
    return isShowDepositInfo;
  }, [isShowDepositInfo]);

  if (!isShowSimulateError && !isShowWarning && !isShowInfo) return null;
  return (
    <div className="trade-form-alert">
      {isShowSimulateError && simulation?.message !== ERROR_MSG_IMR ? (
        <Alert message={<I18nTrans msg={errMsg} />} type="error" showIcon></Alert>
      ) : (
        <>
          {isShowPriceImpactWarning && (
            <Alert
              message={
                <Trans
                  t={t}
                  i18nKey="errors.trade.priceImpactWarning"
                  values={{
                    number: currentPair ? currentPair.mmr?.formatPercentageString() : '',
                  }}
                  components={{ b: <b /> }}
                />
              }
              type="warning"
              showIcon></Alert>
          )}
          {isShowAdditionalFee && (
            <Alert
              message={
                <Trans
                  t={t}
                  i18nKey="errors.trade.additionalFeeError"
                  values={{
                    number: additionalFeeUSD.formatDisplayNumber({
                      isShowApproximatelyEqualTo: additionalFeeUSD.gte(0.0001),
                    }),
                  }}
                  components={{ b: <b /> }}
                />
              }
              type="error"
              showIcon></Alert>
          )}
          {isShowNativeTokenBalanceWarning && (
            <Alert
              message={
                <Trans
                  t={t}
                  i18nKey="common.depositForm.alert.needToKeepGas"
                  values={{
                    nativeToken: dappConfig?.nativeToken?.symbol,
                    amount: dappConfig?.minNativeTokenKeep || 0,
                  }}
                  components={{ b: <b /> }}
                />
              }
              type="info"
              showIcon></Alert>
          )}
          {isShowSlippageHighAlert && (
            <Alert
              message={t('common.walletCardWrapper.formSettings.slippage.highWarningTxt')}
              type="warning"
              showIcon></Alert>
          )}
          {isShowDepositInfo && depositInfo}
          {/* {!isShowDepositInfo && isShowVaultChange && vaultChangeInfo} */}
        </>
      )}
    </div>
  );
};

export default React.memo(TradeFormAlert);

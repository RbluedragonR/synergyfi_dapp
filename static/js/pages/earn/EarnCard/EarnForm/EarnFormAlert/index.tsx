/**
 * @description Component-TradeFormAlert
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import I18nTrans from '@/components/I18nTrans';
import { EARN_TYPE } from '@/constants/earn';
import { SLIPPAGE_THRESHOLDS } from '@/constants/global';
import { ERROR_MSG_EXCEED_WALLET_BALANCE } from '@/constants/simulation';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useAvailableTokenBalance, useTokenBalance } from '@/features/balance/hook';
import { useNativeToken } from '@/features/chain/hook';
import { useGlobalConfig } from '@/features/global/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useDappChainConfig } from '@/hooks/web3/useChain';
import { IAddLiquiditySimulation, IRemoveLiquiditySimulation } from '@/types/earn';
import { TokenInfo } from '@/types/token';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { isNativeTokenAddr, isWrappedNativeToken } from '@/utils/token';
interface IPropTypes {
  simulation?: IAddLiquiditySimulation | IRemoveLiquiditySimulation;
  chainId: CHAIN_ID | undefined;
  marginToken: TokenInfo | undefined;
  earnType: EARN_TYPE;
  onMaxBalanceClick?: (balance: WrappedBigNumber) => void;
  onNativeTokenDepositClick?: (balance: WrappedBigNumber) => void;
}
const EarnFormAlert: FC<IPropTypes> = function ({
  simulation,
  chainId,
  marginToken,
  earnType,
  onMaxBalanceClick,
  onNativeTokenDepositClick,
}) {
  const { t } = useTranslation();
  const { slippage } = useGlobalConfig(chainId);
  const nativeToken = useNativeToken(chainId);
  const dappConfig = useDappChainConfig(chainId);
  const nativeTokenBalance = useTokenBalance(dappConfig?.nativeToken?.address, dappConfig?.network.chainId, true);
  const availableBalance = useAvailableTokenBalance(marginToken?.address, chainId, true);
  // const { isShowVaultChange } = useSimulationBalanceChange(chainId, marginToken);
  const errMsg = useMemo(() => {
    if (simulation?.message === ERROR_MSG_EXCEED_WALLET_BALANCE.errorData) {
      let maxBalanceTip;
      const simulationD = earnType === EARN_TYPE.ADD_LIQ ? (simulation as IAddLiquiditySimulation) : undefined;
      if (simulationD) {
        if (onMaxBalanceClick && availableBalance.lt(simulationD?.data?.margin || 0)) {
          maxBalanceTip = (
            <a
              className="earn-form-alert-link"
              onClick={() => {
                onMaxBalanceClick && onMaxBalanceClick(availableBalance);
              }}>
              {t('common.useMax')} {availableBalance.formatNumberWithTooltip({ suffix: marginToken?.symbol })}
            </a>
          );
        }
        if (chainId && isWrappedNativeToken(chainId!, marginToken?.address || '')) {
          maxBalanceTip = (
            <div>
              <a
                className="earn-form-alert-link"
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
      }

      return (
        <>
          <span>{t(simulation?.errorData || simulation?.message || '')}. </span>
          {maxBalanceTip}
        </>
      );
    }

    return t(simulation?.errorData || simulation?.message || '');
  }, [
    availableBalance,
    chainId,
    earnType,
    marginToken?.address,
    marginToken?.symbol,
    nativeToken?.symbol,
    onMaxBalanceClick,
    onNativeTokenDepositClick,
    simulation,
    t,
  ]);

  const addLpSimulation = useMemo(
    () => (earnType === EARN_TYPE.ADD_LIQ ? (simulation as IAddLiquiditySimulation) : undefined),
    [earnType, simulation],
  );

  const walletConnectStatus = useWalletConnectStatus();

  const needHide = useMemo(() => false, []);

  const isShowSimulateError = useMemo(() => {
    return errMsg && !needHide;
  }, [errMsg, needHide]);

  const isShowNativeTokenBalanceWarning = useMemo(() => {
    if (
      walletConnectStatus !== WALLET_CONNECT_STATUS.UN_CONNECT &&
      dappConfig?.network.chainId &&
      nativeTokenBalance &&
      isNativeTokenAddr(marginToken?.address || '')
    ) {
      if (nativeTokenBalance.lte(dappConfig?.minNativeTokenKeep || 0)) {
        return true;
      }

      return false;
    }
  }, [
    walletConnectStatus,
    dappConfig?.network.chainId,
    nativeTokenBalance,
    marginToken?.address,
    dappConfig?.minNativeTokenKeep,
  ]);

  const isShowSlippageHighAlert = useMemo(() => {
    return WrappedBigNumber.from(slippage).gte(SLIPPAGE_THRESHOLDS.HIGH);
  }, [slippage]);

  const isShowWarning = useMemo(() => {
    if (isShowSimulateError) return false;

    return isShowNativeTokenBalanceWarning || isShowSlippageHighAlert;
  }, [isShowSimulateError, isShowNativeTokenBalanceWarning, isShowSlippageHighAlert]);

  const isShowDepositInfo = useMemo(() => {
    return addLpSimulation?.data?.marginToDeposit?.gt(0);
  }, [addLpSimulation?.data?.marginToDeposit]);

  const depositInfo = useMemo(() => {
    if (isShowDepositInfo && !simulation?.message) {
      return (
        <Alert
          message={
            <Trans
              i18nKey="errors.trade.depositInfo"
              values={{
                deposit: addLpSimulation?.data?.marginToDeposit?.abs().formatDisplayNumber(),
                quote: marginToken?.symbol,
              }}
              components={{ b: <b /> }}
            />
          }
          type="info"
          showIcon></Alert>
      );
    }
  }, [isShowDepositInfo, marginToken?.symbol, addLpSimulation?.data?.marginToDeposit, simulation?.message]);

  // const vaultChangeInfo = useMemo(() => {
  //   const margin = WrappedBigNumber.from(addLpSimulation?.data?.margin || 0).min(
  //     addLpSimulation?.data?.marginToDeposit || 0,
  //   );
  //   let i18Key = 'errors.trade.depositInfoVault';
  //   if (vaultBalanceAfter && vaultBalanceBefore?.gt(vaultBalanceAfter)) {
  //     i18Key = 'errors.trade.depositInfoVaultOut';
  //   }
  //   if (isShowVaultChange && margin && !margin.eq(0)) {
  //     return (
  //       <Alert
  //         message={
  //           <Trans
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
  //   addLpSimulation?.data?.margin,
  //   addLpSimulation?.data?.marginToDeposit,
  //   isShowVaultChange,
  //   marginToken?.symbol,
  //   vaultBalanceAfter,
  //   vaultBalanceBefore,
  // ]);

  const isShowInfo = useMemo(() => {
    return isShowDepositInfo;
  }, [isShowDepositInfo]);

  if ((!isShowSimulateError && !isShowWarning && !isShowInfo) || addLpSimulation?.data?.margin.eq(0)) return null;
  return (
    <div className="earn-form-alert">
      {isShowSimulateError ? (
        <Alert message={<I18nTrans msg={errMsg} />} type="error" showIcon></Alert>
      ) : (
        <>
          {isShowNativeTokenBalanceWarning && (
            <Alert
              message={
                <Trans
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

export default React.memo(EarnFormAlert);

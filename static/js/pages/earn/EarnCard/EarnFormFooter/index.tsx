/**
 * @description Component-TradeFormFooter
 */
import './index.less';

import { ZERO } from '@synfutures/sdks-perp';
import { FC, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FETCHING_STATUS, GlobalModalType, SecondGlobalModalType } from '@/constants';
import { EARN_TYPE } from '@/constants/earn';
import { PAIR_PAGE_TYPE } from '@/constants/global';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { useCurrentRange } from '@/features/account/rangeHook';
import { useTokenBalance } from '@/features/balance/hook';
import { addLiquidity, removeLiquidity } from '@/features/earn/action';
import {
  useAddLiquidationSimulation,
  useAddLiquidityFormState,
  useAddLiquidityFormStateStatus,
  useIsAddLiquidityInputRisky,
  useRemoveLiquidationSimulation,
  useRemoveLiquidationSuccess,
  useRemoveLiquidityFormStateStatus,
} from '@/features/earn/hook';
import { useGlobalConfig, useToggleModal, useToggleSecondModal } from '@/features/global/hooks';
import { useCombinedPairFromUrl } from '@/features/pair/hook';
import { useAppProvider, useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
// import { useGa } from '@/hooks/useGa';
import { useSideNavigate } from '@/hooks/useRouterNavigate';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
// import { GaCategory } from '@/utils/analytics';
// import { getDisplayExpiry } from '@/utils/feature';
import HighRiskLiquidityModal from '@/components/Modal/HighRiskLiquidityModal';
import WrappedButton from '@/components/WrappedButton';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { toBN } from '@/utils/numberUtil';
import { ContractReceipt } from 'ethers';
import { useNavigate } from 'react-router-dom';
interface IPropTypes {
  inputAmountStr: string | undefined;
  disableBtn?: boolean;
  isMobile?: boolean;
  earnType: EARN_TYPE;
  clickClose?: () => void;
}
const EarnFormFooter: FC<IPropTypes> = function ({ disableBtn, inputAmountStr, earnType, isMobile, clickClose }) {
  const chainId = useChainId();
  const { pairPageNavigate } = useSideNavigate();
  const currentPair = useCombinedPairFromUrl(chainId);
  const userAddr = useUserAddr();
  const provider = useAppProvider();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toggleTradeSub = useToggleModal(GlobalModalType.MOBILE_TRADE);
  const addLiqFormStatus = useAddLiquidityFormStateStatus(chainId);
  const removeLiqFormStatus = useRemoveLiquidityFormStateStatus(chainId);
  const addLiqFormState = useAddLiquidityFormState(chainId);
  const { isAddLiquidityInputRisky } = useIsAddLiquidityInputRisky();
  const { t } = useTranslation();
  const fetchingStatus = useMemo(
    () => (earnType === EARN_TYPE.ADD_LIQ ? addLiqFormStatus : removeLiqFormStatus),
    [earnType, addLiqFormStatus, removeLiqFormStatus],
  );
  const removeSuccess = useRemoveLiquidationSuccess(chainId, earnType);
  const btnText = useMemo(() => (removeSuccess ? t('common.earn.manageP') : t('common.confirm')), [removeSuccess, t]);
  const sdk = useSDK(chainId);
  const { deadline } = useGlobalConfig(chainId);
  // const gaEvent = useGa();
  const signer = useWalletSigner();
  const range = useCurrentRange(chainId, userAddr);
  const addLiqSimulation = useAddLiquidationSimulation(chainId);
  const removeLiqSimulation = useRemoveLiquidationSimulation(chainId);
  const simulation = useMemo(
    () => (earnType === EARN_TYPE.ADD_LIQ ? addLiqSimulation : removeLiqSimulation),
    [addLiqSimulation, earnType, removeLiqSimulation],
  );
  const toggleHighRiskLiquidityModal = useToggleSecondModal(SecondGlobalModalType.HIGH_RISK_LIQUIDITY);
  const walletBalance = useTokenBalance(currentPair?.rootInstrument?.quoteToken?.address, chainId);

  const walletNoBalance = useMemo(() => {
    if (earnType === EARN_TYPE.ADD_LIQ) {
      return walletBalance.lt(WrappedBigNumber.from(addLiqSimulation?.data?.marginToDeposit || 0));
    }
    return false;
  }, [addLiqSimulation?.data?.marginToDeposit, earnType, walletBalance]);

  const isDisable = useMemo(() => {
    if (walletNoBalance) return true;
    return !!simulation?.message;
  }, [simulation?.message, walletNoBalance]);

  const onClickLiqButton = useCallback(async () => {
    if (removeSuccess) {
      if (isMobile) {
        await navigate('trade');
        toggleTradeSub(true);
      } else {
        pairPageNavigate(currentPair?.symbol || '', PAIR_PAGE_TYPE.TRADE, currentPair?.chainId);
      }
    } else if (chainId && userAddr && signer && sdk && currentPair && deadline && provider) {
      try {
        let result: ContractReceipt | undefined;
        if (!simulation?.data) {
          return;
        }
        if (
          earnType === EARN_TYPE.ADD_LIQ &&
          addLiqFormState?.amount &&
          inputAmountStr &&
          !toBN(inputAmountStr).eq(0)
        ) {
          result = await dispatch(
            addLiquidity({
              chainId,
              userAddr,
              signer,
              sdk: sdk,
              deadline: Number(deadline),
              pair: currentPair,
              provider,
              margin: addLiqFormState?.amount,
            }),
          ).unwrap();
        } else if (range && currentPair instanceof WrappedPair) {
          result = await dispatch(
            removeLiquidity({
              chainId,
              userAddr,
              signer,
              sdkContext: sdk,
              isMobile,
              deadline: Number(deadline),
              pair: currentPair,
              provider,
              range,
            }),
          ).unwrap();
          if (result && result.status === 1) {
            // if remove with no position, close sub page
            if (removeLiqSimulation?.data?.simulationMainPosition?.size?.eq(0)) {
              clickClose && clickClose();
            }
          }
        }

        if (result) {
          // gaEvent({
          //   category: GaCategory.EARN_PAIR_CARD_WRAPPER,
          //   action: `Trade-Click on ${earnType === EARN_TYPE.ADD_LIQ ? 'Add' : 'Remove'}`,
          //   label: {
          //     amount: (earnType === EARN_TYPE.ADD_LIQ ? '' : '-') + inputAmountStr,
          //     pairName: `${currentPair?.rootInstrument.displaySymbol}-${getDisplayExpiry(currentPair?.expiry || 0)}`,
          //     earnType,
          //   },
          // });
          if (earnType === EARN_TYPE.ADD_LIQ) {
            gtag('event', 'add_liquidity_result', {
              add_liquidity_result: result.status === 1 ? 'success' : 'fail', //success, fail
            });
          }
        }
      } catch (e) {
        if (earnType === EARN_TYPE.ADD_LIQ) {
          gtag('event', 'add_liquidity_result', {
            add_liquidity_result: 'fail', //success, fail
          });
        }
        console.log('🚀 ~ file: index.tsx ~ line 106 ~ onClickTradeButton ~ e', e);
      }
    }
  }, [
    removeSuccess,
    chainId,
    userAddr,
    signer,
    sdk,
    currentPair,
    deadline,
    provider,
    isMobile,
    navigate,
    toggleTradeSub,
    pairPageNavigate,
    simulation?.data,
    earnType,
    addLiqFormState?.amount,
    inputAmountStr,
    range,
    dispatch,
    removeLiqSimulation?.data?.simulationMainPosition?.size,
    clickClose,
  ]);

  return (
    <div className={`earn-form__footer ${isMobile && 'mobile'}`}>
      <WrappedButton
        unConnectedText={isMobile ? t('mobile.earnUnConnected') : ''}
        className={`earn-form__btn ${earnType === EARN_TYPE.REMOVE_LIQ ? 'remove-liq' : ''}`}
        loading={fetchingStatus === FETCHING_STATUS.FETCHING}
        disabled={disableBtn || isDisable}
        amount={earnType === EARN_TYPE.ADD_LIQ ? addLiqSimulation?.data?.marginToDeposit?.wadValue || ZERO : ZERO}
        marginToken={currentPair?.rootInstrument.quoteToken}
        afterApproved={() => {
          const isVaildSubmit =
            earnType === EARN_TYPE.ADD_LIQ && addLiqFormState?.amount && inputAmountStr && !toBN(inputAmountStr).eq(0);

          if (isAddLiquidityInputRisky && isVaildSubmit) {
            toggleHighRiskLiquidityModal(true);
            return;
          }
          onClickLiqButton();
        }}>
        {btnText}
      </WrappedButton>
      <HighRiskLiquidityModal onClickLiqButton={onClickLiqButton} />
    </div>
  );
};

export default memo(EarnFormFooter);

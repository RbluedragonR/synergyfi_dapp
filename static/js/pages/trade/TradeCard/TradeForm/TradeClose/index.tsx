/**
 * @description Component-TradeAdjustClose
 */
import './index.less';

import { Side } from '@synfutures/sdks-perp';
import { useDebounceFn } from 'ahooks';
import { Spin } from 'antd';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ArrowRight } from '@/assets/svg/arrow-right.svg';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
// import Card from '@/components/Card';
import { FormInput } from '@/components/FormInput';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { AvailableBalance } from '@/components/ToolTip/AvailableBalanceToolTip';
// import { Message } from '@/components/Message';
import WrappedButton from '@/components/WrappedButton';
import { FETCHING_STATUS, ZERO } from '@/constants';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useMainPosition } from '@/features/account/positionHook';
import { useGlobalConfig, useIsIpBlocked } from '@/features/global/hooks';
import { useCurrentPairByDevice } from '@/features/pair/hook';
import {
  resetClosePositionForm,
  resetFormByChainId,
  setClosePositionFormAmount,
  setPnlShare,
  simulateMarketClosePosition,
  switchToMarketTab,
  trade,
} from '@/features/trade/actions';
import {
  useCloseFormStatus,
  useClosePositionFormState,
  useCloseSimulation,
  useCloseSimulationStatus,
  useMarketFormStateStatus,
  useTradeDrawerType,
  useTradeMaxLeverage,
  useTradeType,
} from '@/features/trade/hooks';
import { useAppProvider, useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useGa } from '@/hooks/useGa';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import PercentageSelector from '@/pages/components/PercentageSelector/PercentageSelector';
import WalletCardWrapper from '@/pages/components/WalletStatus/WalletCardWrapper';
import { GaCategory } from '@/utils/analytics';
import { inputNumChecker, toBN, toWad } from '@/utils/numberUtil';

// import { ReactComponent as CloseIcon } from '../assets/close_icon.svg';
import { usePnlShareNotification } from '@/components/PnlShareNotification';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import TradeEarnTabs from '@/pages/components/Tabs/TradeEarnTabs';
import { IPnlParams } from '@/types/trade';
import { TradeFormDetails } from '../TradeDetail/TradeFormDetails';
import TradeFormAlert from '../TradeFormAlert';
interface IPropTypes {
  onClose?: () => void;
}
const TradeClose: FC<IPropTypes> = function ({ onClose }) {
  const { isMobile, deviceType } = useMediaQueryDevice();
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  // const { priceBasisForPnl } = usePriceBasisForPnl();
  const pnlShare = usePnlShareNotification();
  const userAddr = useUserAddr();
  const provider = useAppProvider();
  const { t } = useTranslation();
  const gaEvent = useGa();
  const closePositionFormState = useClosePositionFormState(chainId);
  const closeFormStatus = useCloseFormStatus(chainId);
  const tradeType = useTradeType(chainId);
  const drawerType = useTradeDrawerType(chainId);
  const ipBlocked = useIsIpBlocked();
  const tradeTypeInDevice = useMemo(() => {
    return isMobile ? drawerType : tradeType;
  }, [drawerType, isMobile, tradeType]);
  const currentPair = useCurrentPairByDevice(chainId);
  const maxLeverage = useTradeMaxLeverage(currentPair?.maxLeverage);
  const sdk = useSDK(chainId);
  const signer = useWalletSigner();
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const { slippage, deadline } = useGlobalConfig(chainId);
  const marketFormStatus = useMarketFormStateStatus(chainId);
  const isLoading = useMemo(
    () => closeFormStatus === FETCHING_STATUS.FETCHING || marketFormStatus === FETCHING_STATUS.FETCHING,
    [closeFormStatus, marketFormStatus],
  );
  const closeSimulation = useCloseSimulation(chainId);
  const closeSimulationStatus = useCloseSimulationStatus(chainId);
  const closeSection = useCallback(() => {
    chainId &&
      dispatch(
        resetFormByChainId({
          chainId,
        }),
      );
  }, [chainId, dispatch]);
  const inputAmountStrChanged = useCallback(
    (inputAmountStr: string) => {
      if (Number(inputAmountStr) > 0 && currentPosition?.wrappedSize) {
        if (currentPosition?.wrappedSize.abs().lt(Number(inputAmountStr))) {
          inputAmountStr = currentPosition?.wrappedSize.abs().toString();
        }
      }

      if (chainId) {
        dispatch(
          setClosePositionFormAmount({
            chainId,
            amount: inputAmountStr,
          }),
        );
      }
    },
    [chainId, currentPosition?.wrappedSize, dispatch],
  );
  const percentageChange = useCallback(
    (percentage: number) => {
      let alignPercent = percentage;
      if (percentage > 100) {
        alignPercent = 100;
      }
      const amount = currentPosition?.wrappedSize.abs().mul(alignPercent).div(100).stringValue;
      console.log('🚀 ~ file: index.tsx:62 ~ amount:', { amount, size: currentPosition?.wrappedSize });
      amount && inputAmountStrChanged(amount);
    },
    [inputAmountStrChanged, currentPosition],
  );
  const percentage = useMemo(() => {
    return inputNumChecker(
      WrappedBigNumber.from(closePositionFormState.amount || 0)
        .div(currentPosition?.wrappedSize || 1)
        .mul(100).stringValue,
      currentPosition?.rootInstrument.marginToken.decimals,
    );
  }, [closePositionFormState.amount, currentPosition]);
  const marginTokenAmount = useMemo(() => {
    return ZERO;
  }, []);

  const tradeSide = useMemo(() => {
    return currentPosition?.side === Side.LONG ? Side.SHORT : Side.LONG;
  }, [currentPosition?.side]);

  const onClickCloseButton = useCallback(async () => {
    if (
      closePositionFormState.amount &&
      !toBN(closePositionFormState.amount).eq(0) &&
      chainId &&
      userAddr &&
      closePositionFormState.amount &&
      signer &&
      sdk &&
      currentPair &&
      tradeSide &&
      provider
    ) {
      // const adjustTradeSide = getAdjustTradeSide(tradeSide, currentPair.isInverse);
      const adjustTradeSide = tradeSide;
      try {
        if (closeSimulation?.data) {
          const positionLeverage = currentPosition?.wrapAttribute('leverageWad');
          const positionSide = Side[currentPosition?.wrappedSide || Side.FLAT].toString();
          const positionAveragePrice = currentPosition?.wrapAttribute('entryPrice');
          const pnlRatio = closeSimulation.data.realized
            .div(closeSimulation.data.estimatedTradeValue || 1)
            .mul(positionLeverage || 1);
          const result = await dispatch(
            trade({
              chainId,
              userAddr,
              signer,
              sdk: sdk,
              pair: currentPair,
              side: adjustTradeSide,
              baseAmount: toWad(closePositionFormState.amount),
              slippage: Number(slippage),
              deadline: Number(deadline),
              tradePrice: closeSimulation?.data?.tradePrice,
              simulation: closeSimulation,
              provider,
            }),
          ).unwrap();
          if (result) {
            dispatch(resetClosePositionForm({ chainId }));
            dispatch(resetFormByChainId({ chainId }));
            dispatch(switchToMarketTab({ chainId }));
            gaEvent({
              category: GaCategory.TRADE_PAIR_CARD_WRAPPER,
              action: `Trade-Click on ${tradeSide === Side.LONG ? 'Buy' : 'Sell'}`,
              label: {
                position: (tradeSide === Side.LONG ? '' : '-') + closePositionFormState.amount,
                pairName: currentPair.symbol,
                side: tradeSide === Side.LONG ? 'Buy' : 'Sell',
                tradeType,
              },
            });
            if (result.status === 1 && currentPosition) {
              const pnlParams = {
                chainId,
                tradePrice: WrappedBigNumber.from(closeSimulation?.data?.tradePrice),
                averagePrice: positionAveragePrice,
                pair: currentPair,
                pnl: closeSimulation.data.realized,
                pnlRatio,
                leverage: positionLeverage,
                side: positionSide,
                tx: result?.transactionHash,
              } as IPnlParams;
              dispatch(setPnlShare(pnlParams));
              pnlShare(pnlParams);
            }

            onClose && onClose();
          }
        }
      } catch (e) {
        console.log('🚀 ~ file: index.tsx ~ line 106 ~ onClickTradeButton ~ e', e);
      }
    }
  }, [
    closePositionFormState.amount,
    chainId,
    userAddr,
    signer,
    sdk,
    currentPair,
    tradeSide,
    provider,
    closeSimulation,
    dispatch,
    slippage,
    deadline,
    currentPosition,
    // priceBasisForPnl,
    pnlShare,
    gaEvent,
    tradeType,
    onClose,
  ]);
  const fetchSimulation = useCallback(() => {
    if (chainId && currentPosition && sdk && userAddr) {
      // const adjustTradeSide = getAdjustTradeSide(tradeSide, currentPair?.isInverse || false);
      const adjustTradeSide = tradeSide;
      // if the position size is 0, we don't need to simulate
      if (currentPosition.size.eq(0)) {
        return;
      }

      dispatch(
        simulateMarketClosePosition({
          chainId,
          sdkContext: sdk,
          base: closePositionFormState.amount,
          position: currentPosition,
          tradeSide: adjustTradeSide,
          slippage: Number(slippage),
          userAddr,
          maxLeverage,
        }),
      );
    }
  }, [
    chainId,
    currentPosition,
    sdk,
    userAddr,
    tradeSide,
    dispatch,
    closePositionFormState.amount,
    slippage,
    maxLeverage,
  ]);
  const { run: simulateTradeDebounced } = useDebounceFn(
    () => {
      fetchSimulation();
    },
    { wait: 500 },
  );
  useEffect(() => {
    tradeTypeInDevice === TRADE_TYPE.CLOSE_POSITION && simulateTradeDebounced();
  }, [
    closePositionFormState.amount,
    simulateTradeDebounced,
    tradeSide,
    currentPair?.fairPrice._hex,
    tradeTypeInDevice,
  ]);
  useEffect(() => {
    percentageChange(100);
    // no deps
  }, []);
  return (
    <WalletCardWrapper
      mode={isMobile ? undefined : 'modal'}
      clickClose={closeSection}
      title={isMobile ? '' : t(`common.closeP`)}
      className={classNames('syn-trade-close', deviceType)}
      extraHeader={
        !isMobile && (
          <div className="syn-trade-form-extra-header">
            <TradeEarnTabs isTrade pairSymbol={currentPair?.symbol} />
          </div>
        )
      }
      footer={
        <WrappedButton
          type="primary"
          amount={marginTokenAmount}
          block={true}
          loading={isLoading}
          disabled={!!closeSimulation?.message || closeSimulation?.data?.additionalFee.gt(0) || ipBlocked}
          marginToken={currentPair?.rootInstrument.marginToken}
          afterApproved={onClickCloseButton}>
          {t('common.close')} {closeSimulation?.data ? `@ ` : ''}{' '}
          {closeSimulation?.data
            ? WrappedBigNumber.from(closeSimulation.data.tradePrice).formatPriceNumberWithTooltip()
            : ''}
        </WrappedButton>
      }>
      <div className="syn-trade-close-content">
        <div className="syn-trade-close-content-title">{t('common.size')}</div>
        <FormInput
          disabled={isLoading}
          inputProps={{
            type: 'text',
            pattern: '^[0-9]*[.,]?[0-9]*$',
            inputMode: 'decimal',
            autoComplete: 'off',
            autoCorrect: 'off',
            onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
            step: 1e18,
          }}
          className="trade-form-content-input"
          inputAmountStr={closePositionFormState.amount || ''}
          inputAmountStrChanged={inputAmountStrChanged}
          suffix={currentPair?.rootInstrument.baseToken.symbol}
        />
        <PercentageSelector disabled={isLoading} value={Number(percentage || 0)} onChange={percentageChange} />
        <AvailableBalance />
      </div>
      {isMobile && (
        <div className="syn-trade-close-leverage">
          <dl>
            <dt>{t('common.leverage')}</dt>
            <div className="syn-trade-adjust-detail-line"></div>
            <dd>
              <EmptyDataWrap isLoading={!currentPosition?.leverageWad}>
                {!closeSimulation?.data
                  ? currentPosition?.wrapAttribute('leverageWad').formatLeverageWithTooltip()
                  : ''}
                {closeSimulation?.data && (
                  <>
                    {currentPosition?.wrapAttribute('leverageWad').formatLeverageWithTooltip()}
                    <ArrowRight />
                    {WrappedBigNumber.from(
                      closeSimulation.data.simulationMainPosition.leverageWad,
                    )?.formatLeverageWithTooltip()}
                  </>
                )}
              </EmptyDataWrap>
            </dd>
          </dl>
        </div>
      )}
      {closeSimulation?.data && (
        <Spin spinning={closeSimulationStatus === FETCHING_STATUS.FETCHING}>
          <TradeFormDetails
            simulation={closeSimulation?.data}
            marginToken={currentPair?.rootInstrument.marginToken}
            isLoading={false}
            detailToggle={isMobile}
            chainId={chainId}
            fairPrice={currentPair?.wrapAttribute('fairPrice')}
          />
        </Spin>
      )}
      <TradeFormAlert
        chainId={chainId}
        tradeType={TRADE_TYPE.CLOSE_POSITION}
        tradeSimulation={closeSimulation}
        marginToken={currentPair?.rootInstrument?.marginToken}></TradeFormAlert>
      {/* {closeSimulation?.message && <Message msg={t(closeSimulation?.message || '')} status="warning" />} */}
    </WalletCardWrapper>
  );
};

export default TradeClose;

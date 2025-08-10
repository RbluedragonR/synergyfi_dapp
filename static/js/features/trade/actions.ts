import { toBN } from '@derivation-tech/context';
import { ContractReceipt } from '@ethersproject/contracts';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { BigNumber } from 'ethers';
import _ from 'lodash';

import { FETCHING_STATUS, OPERATION_TX_TYPE } from '@/constants';
import { TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';
import {
  ERROR_MSG_EXCEED_WALLET_BALANCE,
  ERROR_MSG_FAIR_FAR_FROM_MARK,
  ERROR_MSG_LIMIT_PRICE_FAR_FROM_MARK,
  ERROR_MSG_ORDER_OCCUPIED,
  ERROR_MSG_SIZE_TO_TICK_IS_TRIVIAL,
} from '@/constants/simulation';
import { INVALID_PRICE, LEVERAGE_ADJUST_TYPE, MANAGE_SIDE, TRADE_TYPE } from '@/constants/trade';
import { PriceBasisForPnl } from '@/constants/trade/priceBasisForPnl';
import { WrappedBigNumber, WrappedBigNumberLike } from '@/entities/WrappedBigNumber';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { WrappedPair } from '@/entities/WrappedPair';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { WrappedPosition } from '@/entities/WrappedPosition';
import {
  AdjustMarginByLeverageState,
  IAdjustMarginSimulation,
  ICrossMarketOrderData,
  ICrossMarketOrderSimulation,
  IMarketFormState,
  IOrderSimulation,
  IOrderSimulationData,
  IPnlParams,
  IScaleFormState,
  IScaledOrderSimulation,
  IScaledOrderSimulationData,
  ISimulation,
  ISimulationData,
  ISimulationOrder,
  MarginAdjustMethod,
} from '@/types/trade';
import { IParsedTemplate } from '@/types/transaction';
import { getMappedRevertReason, parsedEthersError } from '@/utils/error';
import { parseSendingTxMessageMapping } from '@/utils/notification';
import { formatEther, toWad } from '@/utils/numberUtil';
import { showProperDateString } from '@/utils/timeUtils';
import { addedDeadline, perToTenThousands } from '@/utils/trade';

import { QUERY_KEYS } from '@/constants/query';
import SentryService from '@/entities/SentryService';
import { queryClient } from '@/pages/App';
import { IMetaOrder } from '@/types/account';
import { IGateBalanceInfo } from '@/types/balance';
import { calcMarginToDeposit } from '@/utils/position';
import { Context } from '@derivation-tech/context';
import {
  BatchOrderSizeDistribution,
  InstrumentInfo,
  Quotation,
  Side,
  SimulateTradeResult,
  TickMath,
  ZERO,
} from '@synfutures/sdks-perp';
import { FundingChartInterval, KlineInterval } from '@synfutures/sdks-perp-datasource';
import { getPortfolioFromChain } from '../account/actions';
import { fetchGateBalanceAction, fetchTokenBalanceAction } from '../balance/actions';
import { useGlobalStore } from '../global/stores';
import { PollingHistoryId } from '../global/type';
import { simulatePointsByLimitTrade } from '../odyssey/actions';
import { AppState } from '../store';
import { sendTransaction } from '../transaction/actions';
import { checkTokenAllowance } from '../user/actions';

export const resetFormByChainId = createAction<{ chainId: number }>('trade/resetFormByChainId');
export const setMarketFormState = createAction<IMarketFormState>('trade/setMarketFormState');
export const setCurrentFutures = createAction<{ chainId: number; futures: InstrumentInfo }>('trade/setCurrentFuture');
export const setCurrentPair = createAction<{ chainId: number; pair: WrappedPair }>('trade/setCurrentPair');
export const clearMarketTradeSimulation = createAction<{ chainId: number }>('trade/clearMarketTradeSimulation');

export const resetAdjustMarginForm = createAction<{ chainId: number }>('trade/resetAdjustMarginForm');
export const resetClosePositionForm = createAction<{ chainId: number }>('trade/resetClosePositionForm');
export const setPairChartDuration = createAction<{ chainId: number; chartDuration: KlineInterval }>(
  'trade/setPairChartDuration',
);
export const setFundingChartDuration = createAction<{ chainId: number; chartDuration: FundingChartInterval }>(
  'trade/setFundingChartDuration',
);
export const setPairStepRatio = createAction<{ chainId: number; stepRatio: number }>('trade/setPairStepRatio');
export const setIsTurnOnCrossMarket = createAction<{ chainId: number; isTurnOnCrossMarket: boolean }>(
  'trade/setIsTurnOnCrossMarket',
);
export const setPairLeverageSwitchChecked = createAction<{
  chainId: number;
  checked: boolean;
  userAddr: string;
  pairId: string;
}>('trade/setPairLeverageSwitchChecked');

export const switchToMarketTab = createAction<{ chainId: number }>('trade/switchToMarketTab');

// market and adjust leverage form
export const setTradeFormLeverage = createAction<{
  chainId: number;
  leverage: string | undefined;
}>('trade/setTradeFormLeverage');
export const setTradeFormLeverageAndMargin = createAction<{
  chainId: number;
  leverage: string | undefined;
  marginAmount: string | undefined;
}>('trade/setTradeFormLeverageAndMargin');

export const setTradeFormType = createAction<{
  chainId: number;
  tradeType: TRADE_TYPE;
}>('tradeForm/setTradeFormType');

export const setPriceBasisForPnl = createAction<{
  priceBasisForPnl: PriceBasisForPnl;
}>('tradeForm/setPriceBasisForPnl');

export const setTradeDrawerType = createAction<{
  chainId: number;
  tradeType: TRADE_TYPE | undefined;
}>('tradeForm/setTradeDrawerType');

// market and limit order form
export const setTradeFormSide = createAction<{
  chainId: number;
  tradeSide: Side;
}>('tradeForm/setTradeFormSide');

// market and limit order form
export const setTradeFormAmount = createAction<{
  chainId: number;
  baseAmount?: string;
  quoteAmount?: string;
  marginAmount?: string;
  leverageAdjustType?: LEVERAGE_ADJUST_TYPE;
}>('tradeForm/setTradeFormAmount');
export const setScaleFormAmount = createAction<{
  chainId: number;
  baseAmount?: string;
  quoteAmount?: string;
  orderCount?: number;
  stepRatio?: number;
  sizeDistribution?: BatchOrderSizeDistribution;
}>('tradeForm/setScaleFormAmount');

// close position form
export const setClosePositionFormAmount = createAction<{
  chainId: number;
  amount: string;
}>('tradeForm/setClosePositionFormAmount');

// adjust margin form
export const setAdjustMarginMethod = createAction<MarginAdjustMethod>('tradeForm/setAdjustMarginMethod');
export const setAdjustMarginSide = createAction<{ method: MarginAdjustMethod; side: MANAGE_SIDE }>(
  'tradeForm/setAdjustMarginSide',
);

// adjust margin  form
export const setAdjustMarginByLeverageState = createAction<
  {
    chainId: number;
  } & Partial<AdjustMarginByLeverageState>
>('tradeForm/setAdjustMarginByLeverageState');

export const setAdjustMarginFormAmount = createAction<{
  chainId: number;
  amount: string;
  transferIn?: boolean;
  marginToDeposit?: string;
}>('tradeForm/setAdjustMarginFormAmount');
// adjust margin simulation
export const setAdjustMarginSimulation = createAction<{
  chainId: number;
  transferAmount: BigNumber;
  marginToDepositWad: BigNumber;
  leverageWad: BigNumber;
}>('tradeForm/setAdjustMarginSimulation');

// market and limit order form
export const setTradeFormMargin = createAction<{
  chainId: number;
  marginAmount: string;
}>('tradeForm/setTradeFormMargin');

// limit order form only
export const setLimitPrice = createAction<{
  chainId: number;
  limitPrice: string;
  alignedPrice?: string;
  fromOrderBook?: boolean;
}>('tradeForm/setLimitPrice');
export const setScaleLimitPrice = createAction<{
  chainId: number;
  lowerPrice?: string;
  alignedLowerPrice?: string;
  lowerTick?: number;
  upperPrice?: string;
  alignedUpperPrice?: string;
  upperTick?: number;
  stepRatio?: number;
}>('tradeForm/setScaleLimitPrice');

// update limitState from orderbook
export const updateLimitPriceFromOrderBook = createAction<{
  limitState: {
    chainId: number;
    limitPrice: string;
    alignedPrice: string;
    tradeSide: Side;
  };
  formType: TRADE_TYPE;
}>('tradeForm/updateLimitPriceFromOrderBook');

// adjust margin form only
export const setTransferAmount = createAction<{
  chainId: number;
  transferIn?: string;
  transferOut?: string;
}>('tradeForm/setTransferAmount');

// cancel order and cancel TPSL form
export const selectOrderToCancel = createAction<{
  chainId: number;
  userAddr: string;
  ids: string[];
}>('tradeForm/selectOrderOrTpslToCancel');

// trade

export const updateSimulateError = createAction<{
  type: TRADE_TYPE;
  chainId: number;
  errMessage: string;
}>('tradeForm/updateSimulateError');

export const setIsChosenOrder = createAction<{ chainId: number; isChosenOrder: boolean }>('trade/setIsChosenOrder');
export const setPnlShare = createAction<IPnlParams>('trade/setPnlShare');

export const simulateMarketTrade = createAsyncThunk(
  'tradeForm/simulate',
  async (
    {
      chainId,
      sdkContext,
      base,
      tradeSide,
      position,
      leverage,
      slippage,
      margin,
      maxLeverage = TRADE_LEVERAGE_THRESHOLDS.MAX,
      userAddr,
    }: {
      chainId: number;
      position: WrappedPosition | undefined;
      sdkContext: Context | undefined;
      base?: string | undefined;
      margin?: string;
      leverage?: string;
      tradeSide: Side;
      slippage: number;
      userAddr: string;
      maxLeverage: number;
      onlyCallFuncMode?: boolean;
    },
    { getState, dispatch },
  ): Promise<ISimulation | undefined> => {
    try {
      let leverageWad = leverage ? toWad(leverage) : undefined;
      if (leverageWad?.gte(toWad(maxLeverage))) {
        leverageWad = toWad(maxLeverage - TRADE_LEVERAGE_THRESHOLDS.ACTUAL_MAX_STEP);
      }
      const {
        balance: { chainBalanceMap },
        trade: { chainMarketFormState },
      } = getState() as AppState;
      base = base || _.get(chainMarketFormState, [chainId, 'baseAmount']);
      if (sdkContext && position && base) {
        if (toBN(base || 0).eq(0) || (leverageWad && leverageWad.eq(0))) {
          return;
        }
        if (position && base) {
          const baseWrap = WrappedBigNumber.from(base);
          if (
            tradeSide !== position.side &&
            baseWrap.notEq(0) &&
            baseWrap.eq(WrappedBigNumber.from(position.size).abs())
          ) {
            dispatch(
              simulateMarketClosePosition({
                chainId,
                position,
                sdkContext,
                base,
                tradeSide,
                slippage,
                userAddr,
                maxLeverage,
              }),
            );
            return;
          }
        }
        const marginWad = margin ? toWad(margin) : undefined;

        // const adjustTradeSide = getAdjustTradeSide(tradeSide, position.rootPair.isInverse);
        const adjustTradeSide = tradeSide;

        // recheck the base  after async inquire
        const {
          trade: { chainMarketFormState },
        } = getState() as AppState;
        base = base || _.get(chainMarketFormState, [chainId, 'baseAmount']);
        if (toBN(base || 0).eq(0) || (leverageWad && leverageWad.eq(0))) {
          return;
        }

        let simulation: SimulateTradeResult;
        if (marginWad) {
          simulation = await sdkContext.perp.simulate.simulateMarketOrderByMargin({
            // instrument: position.rootInstrument,
            side: adjustTradeSide,

            size: { base: toWad(base) },
            slippage: perToTenThousands(slippage),
            tradeInfo: position,
            margin: marginWad,
          });
        } else {
          simulation = await sdkContext.perp.simulate.simulateMarketOrderByLeverage({
            // instrument: position.rootInstrument,
            leverage: leverageWad || toWad(0),
            side: tradeSide,

            size: { base: toWad(base) },
            slippage: perToTenThousands(slippage),
            tradeInfo: position,
          });
        }

        console.log(
          `😀simulation result: [${position.rootPair.symbol}],[exceedMaxLeverage:${simulation.exceedMaxLeverage}]`,
          simulation,
          {
            position,
            leverage,
            margin,
            base,
            tradeSide,
            slippage,
          },
        );

        const gateBalanceList = queryClient.getQueryData<IGateBalanceInfo[] | null>(
          QUERY_KEYS.BALANCE.GATE(chainId, userAddr),
        );
        const gateBalanceInfo = (gateBalanceList || [])?.find(
          (balance) => balance.address === position.rootInstrument.quoteToken.address,
        );

        const simulationResult: ISimulation = {
          chainId,
          data: {
            origin: simulation,
            ...simulation,
            simulationMainPosition: new WrappedPosition(
              {
                ...simulation.postPosition,
                id: position.rootPortfolio.id,
                instrumentId: position.rootInstrument.id,
                pairId: position.rootPair.id,
                accountId: position.rootPortfolio.rootAccount.id,
                portfolioId: position.rootPortfolio.id,
                blockInfo: position.rootPortfolio.blockInfo,
                expiry: position.rootPortfolio.expiry,
                traderAddr: position.rootPortfolio.traderAddr,
                instrumentAddr: position.rootInstrument.instrumentAddr,
              },
              position.rootPortfolio,
            ),
            tradePrice: WrappedBigNumber.from(simulation.tradePrice),
            limitTick: simulation.limitTick,
            limitPrice: WrappedBigNumber.from(TickMath.getWadAtTick(simulation.limitTick)),
            priceChangeRate: WrappedBigNumber.from(simulation.priceImpact),
            marginToDeposit: calcMarginToDeposit(simulation.margin, gateBalanceInfo?.balance || 0),
            additionalFee: WrappedBigNumber.from(simulation.stabilityFee),
            estimatedTradeValue: WrappedBigNumber.from(simulation.tradeValue),
            tradingFee: WrappedBigNumber.from(simulation.tradingFee),
            // margin may be input
            margin: WrappedBigNumber.from(simulation.marginChanged),
            realized: WrappedBigNumber.from(simulation.realized),
            minTradeValue: WrappedBigNumber.from(position.rootInstrument.minTradeValue),
            leverage: WrappedBigNumber.from(simulation.leverage),
            exceedMaxLeverage:
              simulation.exceedMaxLeverage && WrappedBigNumber.from(simulation.leverage).lt(leverage || 0),
          },
        };
        if (position.rootPair.isInverse && simulationResult?.data) {
          // simulationResult.data.tradePrice = toReciprocalNumber(simulationResult.data.tradePrice);
          // simulationResult.data.limitPrice = toReciprocalNumber(simulationResult.data.limitPrice);
          // simulationResult.data.priceChangeRate = simulationResult.data.priceChangeRate.mul(-1);
          // simulationResult.data.limitTradeValue = toReciprocalNumber(simulationResult.data.limitTradeValue);
        }
        // clear simulation display and show error
        if (simulationResult.data?.additionalFee.gt(0)) {
          simulationResult.message = 'errors.trade.additionalFeeError';
          simulationResult.data = undefined;
          return simulationResult;
        }
        // check if the margin is not enough
        if (userAddr && simulationResult.data?.marginToDeposit?.gt(0)) {
          const rootInstrument = position.rootInstrument;
          const balance = _.get(chainBalanceMap, [chainId, userAddr, rootInstrument.quoteToken.address]);
          if (balance) {
            if (simulationResult.data.marginToDeposit.gt(balance.balance)) {
              simulationResult.message = ERROR_MSG_EXCEED_WALLET_BALANCE.errorMsg;
              simulationResult.errorData = ERROR_MSG_EXCEED_WALLET_BALANCE.errorData;
            }
          }
        }

        return simulationResult;
      }
      return;
    } catch (e) {
      SentryService.captureException(
        e,
        {
          name: 'action:tradeForm/simulate',
          chainId,
          base,
          tradeSide,
          position: position?.toJSON(),
          leverage,
          slippage,
          margin,
          maxLeverage,
          userAddr,
        },
        'info',
      );
      console.error('🚀 simulate error', e);
      const parsedError = parsedEthersError(e);
      const errorMsg = parsedError?.errorMsg || _.get(e, ['reason']) || _.get(e, ['message']);
      return { chainId, message: parsedError?.errorData || errorMsg, errorData: parsedError?.errorData };
    }
  },
);

export const simulateMarketClosePosition = createAsyncThunk(
  'tradeForm/simulateMarketClosePosition',
  async (
    {
      chainId,
      sdkContext,
      base,
      tradeSide,
      position,
      slippage,
      userAddr,
    }: {
      chainId: number;
      position: WrappedPosition | undefined;
      sdkContext: Context | undefined;
      base?: string | undefined;
      tradeSide: Side;
      slippage: number;
      userAddr: string;
      maxLeverage: number;
      onlyCallFuncMode?: boolean;
    },
    { getState },
  ): Promise<ISimulation | undefined> => {
    try {
      const {
        balance: { chainBalanceMap },
        trade: { chainMarketFormState },
      } = getState() as AppState;
      base = base || _.get(chainMarketFormState, [chainId, 'baseAmount']);
      if (sdkContext && position && base) {
        // recheck the base  after async inquire
        const {
          trade: { chainMarketFormState },
        } = getState() as AppState;
        base = base || _.get(chainMarketFormState, [chainId, 'baseAmount']);

        const simulation: SimulateTradeResult = await sdkContext.perp.simulate.simulateClose({
          instrument: position.rootInstrument,

          size: { base: toWad(base) },
          slippage: perToTenThousands(slippage),
          tradeInfo: position,
        });

        console.log(
          `😀simulation result: [${position.rootPair.symbol}],[exceedMaxLeverage:${simulation.exceedMaxLeverage}]`,
          simulation,
          {
            position,
            base,
            tradeSide,
            slippage,
          },
        );

        const gateBalanceList = queryClient.getQueryData<IGateBalanceInfo[] | null>(
          QUERY_KEYS.BALANCE.GATE(chainId, userAddr),
        );
        const gateBalanceInfo = (gateBalanceList || [])?.find(
          (balance) => balance.address === position.rootInstrument.quoteToken.address,
        );

        const simulationResult: ISimulation = {
          chainId,
          data: {
            origin: simulation,
            ...simulation,
            simulationMainPosition: new WrappedPosition(
              {
                ...simulation.postPosition,
                id: position.rootPortfolio.id,
                instrumentId: position.rootInstrument.id,
                pairId: position.rootPair.id,
                accountId: position.rootPortfolio.rootAccount.id,
                portfolioId: position.rootPortfolio.id,
                blockInfo: position.rootPortfolio.blockInfo,
                expiry: position.rootPortfolio.expiry,
                traderAddr: position.rootPortfolio.traderAddr,
                instrumentAddr: position.rootInstrument.instrumentAddr,
              },
              position.rootPortfolio,
            ),
            tradePrice: WrappedBigNumber.from(simulation.tradePrice),
            limitTick: simulation.limitTick,
            limitPrice: WrappedBigNumber.from(TickMath.getWadAtTick(simulation.limitTick)),
            priceChangeRate: WrappedBigNumber.from(simulation.priceImpact),
            marginToDeposit: calcMarginToDeposit(simulation.margin, gateBalanceInfo?.balance || 0),
            additionalFee: WrappedBigNumber.from(simulation.stabilityFee),
            estimatedTradeValue: WrappedBigNumber.from(simulation.tradeValue),
            tradingFee: WrappedBigNumber.from(simulation.tradingFee),
            // margin may be input
            margin: WrappedBigNumber.from(simulation.marginChanged),
            realized: WrappedBigNumber.from(simulation.realized),
            minTradeValue: WrappedBigNumber.from(position.rootInstrument.minTradeValue),
            leverage: WrappedBigNumber.from(simulation.leverage),
            exceedMaxLeverage: false,
          },
        };
        if (position.rootPair.isInverse && simulationResult?.data) {
          // simulationResult.data.tradePrice = toReciprocalNumber(simulationResult.data.tradePrice);
          // simulationResult.data.limitPrice = toReciprocalNumber(simulationResult.data.limitPrice);
          // simulationResult.data.priceChangeRate = simulationResult.data.priceChangeRate.mul(-1);
          // simulationResult.data.limitTradeValue = toReciprocalNumber(simulationResult.data.limitTradeValue);
        }

        // check if the margin is not enough
        if (userAddr && simulationResult.data?.marginToDeposit?.gt(0)) {
          const rootInstrument = position.rootInstrument;
          const balance = _.get(chainBalanceMap, [chainId, userAddr, rootInstrument.quoteToken.address]);
          if (balance) {
            if (simulationResult.data.marginToDeposit.gt(balance.balance)) {
              simulationResult.message = ERROR_MSG_EXCEED_WALLET_BALANCE.errorMsg;
              simulationResult.errorData = ERROR_MSG_EXCEED_WALLET_BALANCE.errorData;
            }
          }
        }

        return simulationResult;
      }
      return;
    } catch (e) {
      SentryService.captureException(
        e,
        {
          name: 'action:tradeForm/simulateMarketClosePosition',
          chainId,
          base,
          tradeSide,
          position: position?.toJSON(),
          slippage,
          userAddr,
        },
        'info',
      );

      console.error('🚀 simulate error', e);
      const parsedError = parsedEthersError(e);
      const errorMsg = parsedError?.errorMsg || _.get(e, ['reason']) || _.get(e, ['message']);
      return { chainId, message: parsedError?.errorData || errorMsg, errorData: parsedError?.errorData };
    }
  },
);

export const trade = createAsyncThunk(
  'tradeForm/trade',
  async (
    {
      signer,
      chainId,
      userAddr,
      sdk: sdk,
      pair,
      baseAmount,
      side,
      slippage,
      deadline,
      provider,
      tradePrice,
      simulation,
    }: {
      chainId: number;
      userAddr: string;
      signer: JsonRpcSigner;
      sdk: Context;
      pair: WrappedPair;
      side: Side;
      baseAmount: BigNumber;
      slippage: number;
      deadline: number;
      simulation?: ISimulation;
      provider?: JsonRpcProvider;
      tradePrice: WrappedBigNumber;
    },
    { dispatch, getState },
  ): Promise<ContractReceipt | undefined> => {
    try {
      if (!simulation || !simulation?.data) return;
      // const adjustTradeSide = getAdjustTradeSide(side, pair.isInverse);
      const adjustTradeSide = side;
      const result = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record(
              'tx',
              `Try to send [${OPERATION_TX_TYPE.TRADE}] operation tx for pair [${pair.symbol}]`,
              undefined,
              {
                signer,
                expiry: pair.expiry,
                pair: pair,
                futures: pair.rootInstrument,
                amount: formatEther(baseAmount),
                margin: formatEther(simulation?.data?.margin?.wadValue),
                slippage: perToTenThousands(slippage),
                deadline: addedDeadline(deadline),
                side: side,
                tradePrice,
                simulation,
              },
            );
            const {
              global: { onChainReferralCode },
            } = getState() as AppState;
            const referralCode = onChainReferralCode?.referralCode || '';

            const populatedTx = await sdk.perp.instrument.placeMarketOrder(
              {
                instrumentAddr: pair.rootInstrument.instrumentAddr,
                expiry: pair.expiry,
                side: adjustTradeSide,
                baseSize: baseAmount,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
                margin: simulation?.data?.origin.margin!,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
                limitTick: simulation?.data?.origin.limitTick!,
                deadline: addedDeadline(deadline),
                referralCode,
              },
              { from: userAddr },
            );
            return signer.sendTransaction(populatedTx);
          },

          chainId,
          userAddr,
          txParams: {
            type: OPERATION_TX_TYPE.TRADE,
            instrument: {
              baseSymbol: pair.rootInstrument.baseToken.symbol,
              quoteSymbol: pair.rootInstrument.quoteToken.symbol,
              isInverse: pair.rootInstrument.isInverse,
            },
            sendingTemplate: parseSendingTxMessageMapping[OPERATION_TX_TYPE.TRADE]!(
              baseAmount,
              side,
              simulation?.data?.limitPrice || WrappedBigNumber.ZERO,
              pair.rootInstrument.baseToken.symbol,
              pair.rootInstrument.isInverse,
            ),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      if (result?.status) {
        dispatch(
          getPortfolioFromChain({
            chainId,
            userAddr,
            blockNumber: result.blockNumber,
            instrumentAddr: pair.rootInstrument.instrumentAddr,
            expiry: pair.expiry,
          }),
        );
        // need update balance
        if (simulation?.data?.margin?.notEq(0)) {
          if (simulation.data.marginToDeposit.gt(0)) {
            dispatch(
              checkTokenAllowance({
                userAddress: userAddr,
                chainId,
                marginToken: pair.rootInstrument.quoteToken,
                block: result.blockNumber,
                sdk: sdk,
              }),
            );
            dispatch(
              fetchTokenBalanceAction({
                chainId,
                userAddr,
                token: pair.rootInstrument.quoteToken,
                block: result.blockNumber,
              }),
            );
          }
          dispatch(
            fetchGateBalanceAction({
              chainId,
              userAddr,
              tokens: [pair.rootInstrument.quoteToken],
              block: result.blockNumber,
            }),
          );
        }
      }
      if (result?.transactionHash) {
        const { setPollingHistoryTx } = useGlobalStore.getState();
        setPollingHistoryTx({
          userAddress: userAddr,
          chainId,
          pollingHistoryId: PollingHistoryId.trade,
          tx: result.transactionHash,
        });
      }
      return result;
    } catch (e) {
      SentryService.captureException(e, {
        name: 'action:tradeForm/trade',
        chainId,
        userAddr,
        pair: pair?.toJSON(),
        baseAmount: baseAmount?.toJSON(),
        side,
        slippage,
        deadline,
        tradePrice: tradePrice?.stringValue,
      });
      console.error('trade error', e);
      throw e;
    }
  },
);

export const placeLimitOrder = createAsyncThunk(
  'tradeForm/limitOrder',
  async (
    {
      signer,
      chainId,
      userAddr,
      sdkContext,
      pair,
      deadline,
      simulation,
      provider,
      side,
    }: {
      chainId: number;
      userAddr: string;
      signer: JsonRpcSigner;
      pair: WrappedPair;
      sdkContext: Context;
      deadline: number;
      simulation: IOrderSimulationData;
      provider?: JsonRpcProvider;
      side: Side;
    },
    { dispatch, getState },
  ): Promise<ContractReceipt | undefined> => {
    try {
      const adjustTradeSide = side; // getAdjustTradeSide(side, pair.isInverse);
      const result = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record(
              'tx',
              `Try to send [${OPERATION_TX_TYPE.PLACE_ORDER}] operation tx for pair [${
                pair.rootInstrument.symbol
              }-${showProperDateString({ expiry: pair.expiry, format: 'MMDD' })}]`,
              undefined,
              {
                signer,
                expiry: pair.expiry,
                pair: pair,
                futures: pair.rootInstrument,
                size: simulation.size,
                balance: formatEther(simulation.margin.wadValue),
                leverage: formatEther(simulation.leverage),
                deadline: addedDeadline(deadline),
              },
            );
            const {
              global: { onChainReferralCode },
            } = getState() as AppState;
            const referralCode = onChainReferralCode?.referralCode || '';
            const populatedTx = await sdkContext.perp.instrument.placeLimitOrder(
              {
                instrumentAddr: pair.instrumentAddr,
                expiry: pair.expiry,
                tick: simulation.tickNumber,
                baseSize: simulation.size.base,
                margin: simulation.margin.wadValue,
                side: adjustTradeSide,
                deadline: addedDeadline(deadline),
                referralCode,
              },
              { from: userAddr },
            );

            return signer.sendTransaction(populatedTx);
          },

          chainId,
          userAddr,
          txParams: {
            type: OPERATION_TX_TYPE.PLACE_ORDER,
            instrument: {
              baseSymbol: pair.rootInstrument.baseToken.symbol,
              quoteSymbol: pair.rootInstrument.quoteToken.symbol,
              isInverse: pair.rootInstrument.isInverse,
            },
            sendingTemplate: parseSendingTxMessageMapping[OPERATION_TX_TYPE.PLACE_ORDER]!(
              pair.rootInstrument.baseToken.symbol,
              simulation.tickNumber,
              simulation.size.base,
              pair.rootInstrument.isInverse,
              side,
            ),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      if (result?.status) {
        dispatch(
          getPortfolioFromChain({
            chainId,
            userAddr,
            blockNumber: result.blockNumber,
            instrumentAddr: pair.rootInstrument.instrumentAddr,
            expiry: pair.expiry,
          }),
        );
        // need update balance
        if (simulation?.margin?.gt(0)) {
          if (simulation.marginToDeposit.gt(0)) {
            dispatch(
              checkTokenAllowance({
                userAddress: userAddr,
                chainId,
                marginToken: pair.rootInstrument.quoteToken,
                block: result.blockNumber,
                sdk: sdkContext,
              }),
            );
            dispatch(
              fetchTokenBalanceAction({
                chainId,
                userAddr,
                token: pair.rootInstrument.quoteToken,
                block: result.blockNumber,
              }),
            );
          }
          if (!simulation?.margin.eq(simulation?.marginToDeposit)) {
            dispatch(
              fetchGateBalanceAction({
                chainId,
                userAddr,
                tokens: [pair.rootInstrument.quoteToken],
                block: result.blockNumber,
              }),
            );
          }
        }
      }
      return result;
    } catch (e) {
      SentryService.captureException(e, {
        name: 'action:tradeForm/limitOrder',
        chainId,
        userAddr,
        pair: pair?.toJSON(),
        deadline,
        side,
      });
      console.log('🚀 ~ file: actions.ts:125 ~ e:', e);
      throw e;
    }
  },
);

export const getLimitAlignPriceWad = createAsyncThunk(
  'tradeForm/getLimitAlignPriceWad',
  async ({
    sdkContext,
    limitPrice,
    instrumentAddr,
  }: {
    limitPrice: WrappedBigNumberLike;
    instrumentAddr: string;
    sdkContext: Context;
    isInverse: boolean;
  }): Promise<
    | {
        tick: number;
        originPrice: WrappedBigNumber;
        adjustPrice: WrappedBigNumber;
      }
    | undefined
  > => {
    const originPrice = WrappedBigNumber.from(limitPrice);
    if (originPrice.lte(0)) {
      return;
    }
    const result = await sdkContext?.perp?.calc.alignPriceToTick(
      instrumentAddr,
      originPrice.wadValue, //getAdjustTradePrice(originPrice, isInverse).wadValue,
    );
    return {
      ...result,
      originPrice: WrappedBigNumber.from(result.price),
      // adjustPrice: getAdjustTradePrice(result.price, isInverse),
      adjustPrice: WrappedBigNumber.from(result.price),
    };
  },
);

export const orderSimulate = createAsyncThunk(
  'tradeForm/orderSimulate',
  async (
    {
      sdkContext,
      portfolio,
      base,
      limitPrice,
      tradeSide,
      leverage,
      chainId,
    }: {
      chainId: number;
      limitPrice: string | undefined;
      portfolio: WrappedPortfolio | undefined;
      sdkContext: Context;
      base: BigNumber;
      leverage?: BigNumber;
      tradeSide: Side;
      onlyCallFuncMode?: boolean;
    },
    { getState, dispatch },
  ): Promise<IOrderSimulation | undefined> => {
    try {
      const {
        account: { chainMetaOrder },
        balance: { chainBalanceMap },
        trade: { chainLimitFormStatus },
      } = getState() as AppState;
      const limitFormStatus = _.get(chainLimitFormStatus, [chainId]);
      if (
        limitPrice &&
        !portfolio?.rootPair.wrapAttribute('fairPrice').eq(limitPrice) &&
        !base.eq(0) &&
        !(leverage && leverage.eq(0)) &&
        // when a placing order happens the portfolio may update before the placeLimitOrder fullfil,
        // this is to prevent resimulation in such situation
        limitFormStatus !== FETCHING_STATUS.FETCHING
      ) {
        if (portfolio) {
          const rootInstrument = portfolio.rootInstrument;
          const limitRes = await dispatch(
            getLimitAlignPriceWad({
              sdkContext,
              isInverse: rootInstrument.isInverse,
              limitPrice,
              instrumentAddr: portfolio.rootInstrument.instrumentAddr,
            }),
          ).unwrap();
          if (!limitRes) return;
          const { tick: tickNumber } = limitRes;
          const userAddr = portfolio.traderAddr;
          // use chainMetaOrder for best accuracy
          const orderList = _.values(
            _.pickBy(
              _.get(chainMetaOrder, [chainId || '', userAddr || '', 'list']),
              (metaOrder) => metaOrder.pairId === portfolio.rootPair.id,
            ),
          );
          if (orderList.length) {
            // orderList
            const placedOrder = orderList.find((order: IMetaOrder) => order.tick === tickNumber);

            if (placedOrder) {
              return { message: ERROR_MSG_ORDER_OCCUPIED.errorMsg, errorData: ERROR_MSG_ORDER_OCCUPIED.errorData };
            }
          }

          if (!leverage) return;

          const result = await sdkContext.perp.simulate.simulateLimitOrder({
            instrument: rootInstrument,
            leverage: leverage,
            side: tradeSide,
            size: { base: base },
            tradeInfo: portfolio,
            priceInfo: toWad(limitPrice),
          });
          const estimatedTradeValue = WrappedBigNumber.from(TickMath.getWadAtTick(tickNumber)).mul(base);

          const gateBalanceList = queryClient.getQueryData<IGateBalanceInfo[] | null>(
            QUERY_KEYS.BALANCE.GATE(chainId, userAddr),
          );
          const gateBalanceInfo = (gateBalanceList || [])?.find(
            (balance) => balance.address === rootInstrument.quoteToken.address,
          );

          const simulateResult: IOrderSimulation = {
            data: {
              origin: result,
              ...result,
              tickNumber,
              limitPrice: WrappedBigNumber.from(
                await sdkContext.perp.calc.getWadAtTick(portfolio.instrumentAddr, tickNumber),
              ),
              marginToDeposit: calcMarginToDeposit(result.margin, gateBalanceInfo?.balance || 0),
              margin: WrappedBigNumber.from(result.margin),
              minFeeRebate: WrappedBigNumber.from(result.minFeeRebate),
              estimatedTradeValue: estimatedTradeValue,
              leverage: result.leverage,
              minOrderValue: rootInstrument.minOrderValue,
              baseSize: result.size.base,
            },
          };

          // check if the margin is not enough
          if (userAddr && simulateResult.data?.marginToDeposit?.gt(0)) {
            const balance = _.get(chainBalanceMap, [chainId, userAddr, rootInstrument.quoteToken.address]);
            if (balance) {
              if (simulateResult.data.marginToDeposit.gt(balance.balance)) {
                simulateResult.message = ERROR_MSG_EXCEED_WALLET_BALANCE.errorMsg;
                simulateResult.errorData = ERROR_MSG_EXCEED_WALLET_BALANCE.errorData;
              }
            }
          }
          console.log('🚀 ~ simulate points:', {
            chainId,
            tick: tickNumber,
            base,
            quote: rootInstrument.quoteToken,
            pair: portfolio.rootPair,
            userAddr: portfolio.traderAddr.toLowerCase(),
          });
          // simulate points for odyssey
          dispatch(
            simulatePointsByLimitTrade({
              chainId,
              tick: tickNumber,
              base,
              quote: rootInstrument.quoteToken,
              pair: portfolio.rootPair,
              userAddr: portfolio.traderAddr.toLowerCase(),
            }),
          );

          return simulateResult;
        }
      }
      return undefined;
    } catch (e) {
      SentryService.captureException(
        e,
        {
          name: 'action:tradeForm/orderSimulate',
          base: JSON.stringify(base),
          limitPrice,
          tradeSide,
          leverage,
          chainId,
        },
        'info',
      );
      console.log('🚀 orderSimulate error', e);
      const parsedError = parsedEthersError(e);
      const errorMsg = parsedError?.errorMsg || _.get(e, ['reason']) || _.get(e, ['message']);
      console.log('🚀 ~ file: actions.ts:546 ~ errorMsg:', errorMsg, parsedError);
      if (errorMsg.startsWith(ERROR_MSG_FAIR_FAR_FROM_MARK)) {
        return { message: getMappedRevertReason('0xe732e534'), errorData: parsedError?.errorData };
      }
      if (errorMsg.startsWith(ERROR_MSG_LIMIT_PRICE_FAR_FROM_MARK) || errorMsg.includes(INVALID_PRICE)) {
        return;
      }
      return { message: errorMsg, errorData: parsedError?.errorData };
    }
  },
);

export const adjustMargin = createAsyncThunk(
  'tradeForm/adjustPositionMargin',
  async (
    {
      sdkContext,
      chainId,
      userAddr,
      signer,
      pair,
      transferIn,
      deadline,
      margin,
      provider,
    }: {
      chainId: number;
      userAddr: string;
      sdkContext: Context;
      signer: JsonRpcSigner;
      transferIn: boolean;
      pair: WrappedPair;
      deadline: number;
      margin: BigNumber;
      provider: JsonRpcProvider;
    },
    { dispatch, getState },
  ): Promise<ContractReceipt | undefined> => {
    try {
      const {
        trade: { chainAdjustMarginSimulation },
      } = getState() as AppState;
      const simulation = _.get(chainAdjustMarginSimulation, [chainId]);
      const result = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record(
              'tx',
              `Try to send [${OPERATION_TX_TYPE.ADJUST_MARGIN}] operation tx for pair [${
                pair.rootInstrument.symbol
              }-${showProperDateString({ expiry: pair.expiry, format: 'MMDD' })}]`,
              undefined,
              {
                signer,
                expiry: pair.expiry,
                pair: pair,
                futures: pair.rootInstrument,
                transferIn,
                margin: formatEther(margin),
                deadline: addedDeadline(deadline),
              },
            );
            const {
              global: { onChainReferralCode },
            } = getState() as AppState;
            const referralCode = onChainReferralCode?.referralCode || '';
            const populatedTx = await sdkContext.perp.instrument.adjustMargin(
              {
                instrumentAddr: pair.rootInstrument.instrumentAddr,
                expiry: pair.expiry,
                margin: margin,
                transferIn: transferIn,
                deadline: addedDeadline(deadline),
                referralCode,
              },
              { from: userAddr },
            );

            return signer.sendTransaction(populatedTx);
          },

          chainId,
          userAddr,
          txParams: {
            type: OPERATION_TX_TYPE.ADJUST_MARGIN,
            instrument: {
              baseSymbol: pair.rootInstrument.baseToken.symbol,
              quoteSymbol: pair.rootInstrument.quoteToken.symbol,
              isInverse: pair.rootInstrument.isInverse,
            },
            sendingTemplate: parseSendingTxMessageMapping[OPERATION_TX_TYPE.ADJUST_MARGIN]!(
              margin,
              transferIn,
              pair.rootInstrument.quoteToken.symbol,
            ),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      if (result?.status) {
        dispatch(
          getPortfolioFromChain({
            chainId,
            userAddr,
            blockNumber: result.blockNumber,
            instrumentAddr: pair.rootInstrument.instrumentAddr,
            expiry: pair.expiry,
          }),
        );
        // need update balance
        if (margin.gt(0)) {
          if (
            simulation?.data?.marginToDepositWad &&
            WrappedBigNumber.from(simulation?.data?.marginToDepositWad).gt(0)
          ) {
            dispatch(
              checkTokenAllowance({
                userAddress: userAddr,
                chainId,
                marginToken: pair.rootInstrument.quoteToken,
                block: result.blockNumber,
                sdk: sdkContext,
              }),
            );
            dispatch(
              fetchTokenBalanceAction({
                chainId,
                userAddr,
                token: pair.rootInstrument.quoteToken,
                block: result.blockNumber,
              }),
            );
          }
          if (simulation?.data?.marginToDepositWad && !margin.eq(simulation?.data?.marginToDepositWad || 0)) {
            dispatch(
              fetchGateBalanceAction({
                chainId,
                userAddr,
                tokens: [pair.rootInstrument.quoteToken],
                block: result.blockNumber,
              }),
            );
          }
        }
        // reset form after success
        dispatch(resetAdjustMarginForm({ chainId }));
        dispatch(switchToMarketTab({ chainId }));
      }
      if (result?.transactionHash) {
        const { setPollingHistoryTx } = useGlobalStore.getState();
        setPollingHistoryTx({
          chainId,
          userAddress: userAddr,
          pollingHistoryId: PollingHistoryId.transfer,
          tx: result?.transactionHash,
        });
      }
      return result;
    } catch (e) {
      SentryService.captureException(e, {
        name: 'tradeForm/adjustPositionMargin',
        chainId,
        userAddr,
        pair: pair?.toJSON(),
        transferIn,
        deadline,
        margin: JSON.stringify(margin),
      });

      console.log('🚀 ~ file: actions.ts:125 ~ e:', e);
      throw e;
    }
  },
);

export const cancelTradeOrders = createAsyncThunk(
  'tradeForm/cancelTradeOrders',
  async (
    {
      sdkContext,
      chainId,
      signer,
      orders,
      userAddr,
      portfolio,
      deadline,
      provider,
    }: {
      chainId: number;
      sdkContext: Context;
      signer: JsonRpcSigner;
      userAddr: string;
      orders: WrappedOrder[];
      portfolio: WrappedPortfolio;
      deadline: number;
      provider: JsonRpcProvider;
      bulkCancel?: boolean;
    },
    { dispatch },
  ): Promise<ContractReceipt | undefined> => {
    try {
      const pair = portfolio.rootPair;
      let sendingTemplate: IParsedTemplate | undefined = undefined;
      if (orders.length === 1) {
        sendingTemplate = parseSendingTxMessageMapping[OPERATION_TX_TYPE.CANCEL_ORDER]!(orders[0].tick, pair.isInverse);
      } else if (orders.length > 1) {
        const result: IParsedTemplate = { descTemplate: '', templateArgs: {} };
        result.descTemplate = 'notification.cancelOrder.multiInfo';
        result.templateArgs = {
          orderNumber: orders.length.toString(),
        };
        sendingTemplate = result;
      }
      const result = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record(
              'tx',
              `Try to send [${OPERATION_TX_TYPE.CANCEL_ORDER}] operation tx for pair [${portfolio.rootInstrument.symbol}`,
              undefined,
              {
                signer,
                portfolio,
                orders,
                deadline: addedDeadline(deadline),
              },
            );

            const populatedTx = await sdkContext.perp.instrument.batchCancelLimitOrder(
              {
                instrumentAddr: pair.rootInstrument.instrumentAddr,
                expiry: pair.expiry,
                orderTicks: orders.map((order) => order.tick),
                deadline: addedDeadline(deadline),
              },
              { from: userAddr },
            );
            return signer.sendTransaction(populatedTx);
          },

          chainId,
          userAddr,
          txParams: {
            type: OPERATION_TX_TYPE.CANCEL_ORDER,
            instrument: {
              baseSymbol: pair.rootInstrument.baseToken.symbol,
              quoteSymbol: pair.rootInstrument.quoteToken.symbol,
              isInverse: pair.rootInstrument.isInverse,
            },
            sendingTemplate: sendingTemplate,
          },
          wssProvider: provider,
        }),
      ).unwrap();
      if (result?.status) {
        dispatch(
          getPortfolioFromChain({
            chainId,
            userAddr,
            blockNumber: result.blockNumber,
            instrumentAddr: pair.rootInstrument.instrumentAddr,
            expiry: pair.expiry,
          }),
        );
        dispatch(
          fetchGateBalanceAction({
            chainId,
            userAddr,
            tokens: [pair.rootInstrument.quoteToken],
            block: result.blockNumber,
          }),
        );
        if (orders.length) {
          orders.forEach((order) => {
            _.unset(portfolio.orderMap, [order.id]);
          });
        }
      }
      if (result?.transactionHash) {
        const { setPollingHistoryTx } = useGlobalStore.getState();
        setPollingHistoryTx({
          chainId,
          userAddress: userAddr,
          pollingHistoryId: PollingHistoryId.order,
          tx: result?.transactionHash,
        });
      }
      return result;
    } catch (e) {
      SentryService.captureException(e, {
        name: 'tradeForm/cancelTradeOrders',
        chainId,
        orders: orders?.map((order) => order.id),
        userAddr,
        deadline,
      });
      console.log('🚀 ~ file: actions.ts:125 ~ e:', e);
      throw e;
    }
  },
);

export const simulateAdjustMargin = createAsyncThunk(
  'trade/simulateAdjustMargin',
  async ({
    chainId,
    sdkContext,
    pair,
    portfolio,
    leverage,
    transferAmount,
    transferIn,
    slippage,
  }: {
    chainId: number;
    pair: WrappedPair | undefined;
    portfolio: WrappedPortfolio | undefined;
    sdkContext: Context | undefined;
    transferAmount: BigNumber | undefined;
    leverage: BigNumber | undefined;
    transferIn: boolean;
    slippage: number;
  }): Promise<IAdjustMarginSimulation | undefined> => {
    try {
      if (sdkContext && portfolio && pair) {
        if (portfolio.position.balance.eq(0) || transferAmount?.eq(0)) {
          return;
        }

        const gateBalanceList = queryClient.getQueryData<IGateBalanceInfo[] | null>(
          QUERY_KEYS.BALANCE.GATE(chainId, portfolio.traderAddr),
        );
        const gateBalanceInfo = (gateBalanceList || [])?.find(
          (balance) => balance.address === pair.rootInstrument.quoteToken.address,
        );

        if (transferAmount) {
          const simulationRes = await sdkContext?.perp.simulate.simulateAdjustMarginByMargin({
            transferIn,
            tradeInfo: portfolio.position,
            margin: transferAmount,
            slippage: perToTenThousands(slippage),
          });

          const res = {
            chainId,
            data: {
              ...simulationRes,
              simulationMainPosition: new WrappedPosition(
                {
                  ...simulationRes.postPosition,
                  id: portfolio.id,
                  instrumentId: pair.rootInstrument.id,
                  pairId: pair.id,
                  accountId: portfolio.rootAccount.id,
                  portfolioId: portfolio.id,
                  blockInfo: portfolio.blockInfo!,
                },
                portfolio,
              ),
              transferAmount: transferAmount.mul(transferIn ? 1 : -1),
              leverageWad: simulationRes.leverage,
              marginToDepositWad: calcMarginToDeposit(
                transferAmount.mul(transferIn ? 1 : -1),
                gateBalanceInfo?.balance || 0,
              ).wadValue,
            },
          };
          return res;
        } else {
          const simulationRes = await sdkContext?.perp.simulate.simulateAdjustMarginByLeverage({
            leverage: leverage!,
            tradeInfo: portfolio.position,
            slippage: perToTenThousands(slippage),
          });

          const res = {
            chainId,
            data: {
              ...simulationRes,
              simulationMainPosition: new WrappedPosition(
                {
                  ...simulationRes.postPosition,
                  id: portfolio.id,
                  instrumentId: pair.rootInstrument.id,
                  pairId: pair.id,
                  accountId: portfolio.rootAccount.id,
                  portfolioId: portfolio.id,
                  blockInfo: portfolio.blockInfo!,
                },
                portfolio,
              ),
              transferAmount: simulationRes.margin.mul(simulationRes.transferIn ? 1 : -1),
              leverageWad: leverage!,
              marginToDepositWad: calcMarginToDeposit(simulationRes.margin, gateBalanceInfo?.balance || 0).wadValue,
            },
          };

          return res;
        }
      }
      return { chainId };
    } catch (e) {
      SentryService.captureException(
        e,
        {
          name: 'tradeForm/simulateAdjustMargin',
          chainId,
          pair: pair?.toJSON(),
          leverage: JSON.stringify(leverage),
          transferAmount: JSON.stringify(transferAmount),
          transferIn,
          slippage,
        },
        'info',
      );
      console.log('🚀 ~ file: actions.ts:565 ~ e:', e);
      return { chainId, message: _.get(e, ['message']) };
    }
  },
);

export const getBaseOrQuoteAmount = createAsyncThunk(
  'tradeForm/getBaseOrQuoteAmount',
  async (
    {
      sdkContext,
      chainId,
      pair,
      baseAmount,
      quoteAmount,
      tradeSide,
      tradeType,
    }: {
      chainId: number;
      sdkContext: Context | undefined;
      pair: WrappedPair | undefined;
      baseAmount: BigNumber | undefined;
      quoteAmount: BigNumber | undefined;
      tradeSide: Side;
      tradeType: TRADE_TYPE;
    },
    { dispatch, getState },
  ): Promise<{ amount: BigNumber; quotation: Quotation } | undefined> => {
    try {
      if (sdkContext && pair) {
        if (baseAmount?.eq(0) && quoteAmount?.eq(0)) {
          return;
        }
        if (quoteAmount) {
          const res = await sdkContext?.perp?.observer.inquireByQuote(
            pair.instrumentAddr,
            pair.expiry,
            tradeSide,
            quoteAmount || ZERO,
          );
          return {
            amount: res.baseAmount,
            quotation: res.quotation,
          };
        } else if (baseAmount) {
          const res = await sdkContext?.perp?.observer.inquireByBase(
            pair.instrumentAddr,
            pair.expiry,
            tradeSide,
            baseAmount || ZERO,
          );
          return {
            amount: res.quoteAmount,
            quotation: res.quotation,
          };
        }

        const {
          trade: { chainMarketFormState: chainMarketFormState2 },
        } = getState() as AppState;
        const state2 = _.get(chainMarketFormState2, [chainId]);
        console.log('🚀 ~ file: actions.ts:829 ~ state2:', state2);
      }
    } catch (e) {
      const parsedError = parsedEthersError(e);
      if (parsedError) {
        dispatch(
          updateSimulateError({
            type: tradeType,
            errMessage: parsedError?.errorData || parsedError?.errorMsg,
            chainId,
          }),
        );
      }
    }
  },
);

export const simulateBatchPlaceScaledLimitOrder = createAsyncThunk(
  'tradeForm/simulateBatchPlaceScaledLimitOrder',
  async (
    {
      sdkContext,
      portfolio,
      tradeSide,
      chainId,
    }: {
      chainId: number;

      portfolio: WrappedPortfolio | undefined;
      sdkContext: Context;
      tradeSide: Side;
    },
    { getState },
  ): Promise<IScaledOrderSimulation | undefined> => {
    const {
      trade: { chainScaleFormState },
    } = getState() as AppState;
    const scaleLimitFormState = _.get(chainScaleFormState, [chainId]) as IScaleFormState;
    if (!scaleLimitFormState || !scaleLimitFormState.stepRatio || !scaleLimitFormState.lowerTick) {
      return undefined;
    }
    const base = toWad(scaleLimitFormState.baseAmount || 0);
    const sizeDistribution = scaleLimitFormState.sizeDistribution;
    const leverage = scaleLimitFormState.leverage ? toWad(scaleLimitFormState.leverage) : undefined;
    const priceInfo = [];
    let tick = scaleLimitFormState.lowerTick;
    let upperTick = scaleLimitFormState.upperTick;
    if (portfolio?.rootPair.isInverse) {
      const tickFromLower = tick * -1;
      const tickFromUpper = upperTick * -1;
      tick = Math.min(tickFromLower, tickFromUpper);
      upperTick = Math.max(tickFromLower, tickFromLower);
    }
    while (tick <= upperTick) {
      priceInfo.push(tick);
      tick = tick + scaleLimitFormState.stepRatio;
    }
    try {
      if (
        !!priceInfo.length &&
        !portfolio?.rootPair.wrapAttribute('fairPrice').eq(scaleLimitFormState.lowerPrice) &&
        !base.eq(0) &&
        !(leverage && leverage.eq(0))
      ) {
        if (portfolio) {
          const rootInstrument = portfolio.rootInstrument;
          const userAddr = portfolio.traderAddr;
          const {
            balance: { chainBalanceMap },
          } = getState() as AppState;
          const adjustTradeSide = tradeSide; // getAdjustTradeSide(tradeSide, rootInstrument.isInverse);
          if (!leverage) return;

          const gateBalanceList = queryClient.getQueryData<IGateBalanceInfo[] | null>(
            QUERY_KEYS.BALANCE.GATE(chainId, portfolio.traderAddr),
          );
          const gateBalanceInfo = (gateBalanceList || [])?.find(
            (balance) => balance.address === portfolio.rootInstrument.quoteToken.address,
          );

          const result = await sdkContext.perp.simulate.simulateScaledLimitOrder({
            instrument: rootInstrument,
            leverage: leverage,
            side: adjustTradeSide,
            sizeDistribution: sizeDistribution,
            size: {
              base: base,
            },
            priceInfo,
            tradeInfo: portfolio,
          });
          const orders: ISimulationOrder[] = result.orders.filter((o) => !!o) as ISimulationOrder[];
          const totalMargin = orders.reduce((acc, cur) => acc.add(cur?.margin || 0), WrappedBigNumber.ZERO);
          const marginToDeposit = calcMarginToDeposit(totalMargin, gateBalanceInfo?.balance || 0);
          const simulateResult: IScaledOrderSimulation = {
            data: {
              ...result,
              sizeDistribution,
              leverageWad: leverage,
              lowerTick: scaleLimitFormState.lowerTick,
              upperTick: scaleLimitFormState.upperTick,
              upperPrice: scaleLimitFormState.upperPrice,
              lowerPrice: scaleLimitFormState.lowerPrice,
              baseSize: base,
              orders,
              margin: totalMargin,
              marginToDeposit: marginToDeposit,
              minOrderValue: WrappedBigNumber.from(portfolio.rootInstrument.minOrderValue),
              minFeeRebate: orders.reduce((acc, cur) => acc.add(cur.minFeeRebate), ZERO),
              estimatedTradeValue: orders.reduce((acc, cur) => acc.add(cur.tradeValue), WrappedBigNumber.ZERO),
            },
          };

          // check if the margin is not enough
          if (userAddr && simulateResult.data?.marginToDeposit?.gt(0)) {
            const balance = _.get(chainBalanceMap, [chainId, userAddr, rootInstrument.quoteToken.address]);
            if (balance) {
              if (simulateResult.data.marginToDeposit.gt(balance.balance)) {
                simulateResult.message = ERROR_MSG_EXCEED_WALLET_BALANCE.errorMsg;
                simulateResult.errorData = ERROR_MSG_EXCEED_WALLET_BALANCE.errorData;
              }
            }
          }
          return simulateResult;
        }
      }
      return undefined;
    } catch (e) {
      SentryService.captureException(
        e,
        {
          name: 'tradeForm/simulateBatchPlaceScaledLimitOrder',
          tradeSide,
          chainId,
        },
        'info',
      );
      console.log('🚀 scaleOrderSimulate error', e);
      const parsedError = parsedEthersError(e);
      const errorMsg = parsedError?.errorMsg || _.get(e, ['reason']) || _.get(e, ['message']);
      console.log('🚀 ~ file: actions.ts:546 ~ errorMsg:', errorMsg, parsedError);
      if (errorMsg.startsWith(ERROR_MSG_LIMIT_PRICE_FAR_FROM_MARK) || errorMsg.includes(INVALID_PRICE)) {
        return;
      }
      return { message: errorMsg, errorData: parsedError?.errorData };
    }
  },
);

export const batchPlaceScaledLimitOrder = createAsyncThunk(
  'trade/batchPlaceScaledLimitOrder',
  async (
    {
      signer,
      chainId,
      userAddr,
      sdkContext,
      pair,
      deadline,
      simulation,
      provider,
      side,
      leverageWad,
      baseSizeWad,
    }: {
      chainId: number;
      userAddr: string;
      signer: JsonRpcSigner;
      pair: WrappedPair;
      sdkContext: Context;
      deadline: number;
      simulation: IScaledOrderSimulationData;
      provider: JsonRpcProvider;
      side: Side;
      leverageWad: BigNumber;
      baseSizeWad: BigNumber;
    },
    { dispatch, getState },
  ): Promise<ContractReceipt | undefined> => {
    try {
      const adjustTradeSide = side; // getAdjustTradeSide(side, pair.isInverse);
      const ticks: number[] = simulation.orders.map((o) => o.tick);
      const ratios: number[] = simulation.orders.map((o) => o.ratio);
      const orderCount = simulation.orders.length;

      const result = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record(
              'tx',
              `Try to send [${OPERATION_TX_TYPE.PLACE_ORDER}] operation tx for pair [${
                pair.rootInstrument.symbol
              }-${showProperDateString({ expiry: pair.expiry, format: 'MMDD' })}]`,
              undefined,
              {
                signer,
                expiry: pair.expiry,
                pair: pair,
                futures: pair.rootInstrument,
                base: formatEther(baseSizeWad),
                leverage: formatEther(leverageWad),
                deadline: addedDeadline(deadline),
                adjustTradeSide,
              },
            );
            // return await provider.getTransaction(`0x2f3c82087c8ec0b355e9f669e615ce6666b01ff1b1ced3ad792489e74a42085f`);
            const {
              global: { onChainReferralCode },
            } = getState() as AppState;
            const referralCode = onChainReferralCode?.referralCode || '';
            const populatedTx = await sdkContext.perp.instrument.batchPlaceLimitOrder(
              {
                instrumentAddr: pair.instrumentAddr,
                expiry: pair.expiry,
                leverage: leverageWad,
                side: adjustTradeSide,
                baseSize: baseSizeWad,
                ticks: ticks,
                ratios,
                deadline: addedDeadline(deadline),
                referralCode,
              },
              { from: userAddr },
            );
            return signer.sendTransaction(populatedTx);
          },

          chainId,
          userAddr,
          txParams: {
            type: OPERATION_TX_TYPE.BATCH_PLACE_SCALED_ORDER,
            instrument: {
              baseSymbol: pair.rootInstrument.baseToken.symbol,
              quoteSymbol: pair.rootInstrument.quoteToken.symbol,
              isInverse: pair.rootInstrument.isInverse,
            },
            extra: {
              upperPrice: simulation.upperPrice,
              lowerPrice: simulation.lowerPrice,
              side,
              orderCount,
              baseSize: simulation.baseSize,
            },
            sendingTemplate: parseSendingTxMessageMapping[OPERATION_TX_TYPE.BATCH_PLACE_SCALED_ORDER]!(
              pair.rootInstrument.baseToken.symbol,
              simulation.upperPrice,
              simulation.lowerPrice,
              simulation.baseSize,
              pair.rootInstrument.isInverse,
              side,
              orderCount,
            ),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      console.log(`batchPlaceScaledLimitOrder  result`, { result, pair, leverageWad, baseSizeWad, ticks, ratios });

      if (result?.status) {
        dispatch(
          getPortfolioFromChain({
            chainId,
            userAddr,
            blockNumber: result.blockNumber,
            instrumentAddr: pair.rootInstrument.instrumentAddr,
            expiry: pair.expiry,
          }),
        );
        // need update balance
        if (simulation?.margin?.gt(0)) {
          if (simulation.marginToDeposit.gt(0)) {
            dispatch(
              checkTokenAllowance({
                userAddress: userAddr,
                chainId,
                marginToken: pair.rootInstrument.quoteToken,
                block: result.blockNumber,
                sdk: sdkContext,
              }),
            );
            dispatch(
              fetchTokenBalanceAction({
                chainId,
                userAddr,
                token: pair.rootInstrument.quoteToken,
                block: result.blockNumber,
              }),
            );
          }
          if (!simulation?.margin.eq(simulation?.marginToDeposit)) {
            dispatch(
              fetchGateBalanceAction({
                chainId,
                userAddr,
                tokens: [pair.rootInstrument.quoteToken],
                block: result.blockNumber,
              }),
            );
          }
        }
      }

      return result;
    } catch (e) {
      SentryService.captureException(e, {
        name: 'trade/batchPlaceScaledLimitOrder',
        chainId,
        userAddr,
        pair: pair?.toJSON(),
        deadline,
        side,
        leverageWad: JSON.stringify(leverageWad),
        baseSizeWad: JSON.stringify(baseSizeWad),
      });
      console.error('🚀 ~ file: actions.ts:125 ~ e:', e);
      throw e;
    }
  },
);

export const simulateCrossMarketOrder = createAsyncThunk(
  'trade/simulateCrossMarketOrder',
  async (
    {
      sdkContext,
      position,
      base,
      limitPrice,
      tradeSide,
      leverage,
      chainId,
      slippage,
      onlyCallFuncMode,
    }: {
      chainId: number;
      limitPrice: string | undefined;
      position: WrappedPosition | undefined;
      sdkContext: Context;
      base: WrappedBigNumber;
      leverage?: WrappedBigNumber;
      tradeSide: Side;
      slippage: number;
      onlyCallFuncMode?: boolean;
    },
    { dispatch },
  ): Promise<ICrossMarketOrderSimulation | undefined> => {
    try {
      if (
        limitPrice &&
        // !portfolio?.rootPair.wrapAttribute('fairPrice').eq(limitPrice) &&
        !base.eq(0) &&
        !(leverage && leverage.eq(0))
      ) {
        if (position) {
          const userAddr = position.traderAddr;
          const portfolio = position.rootPortfolio;
          const rootInstrument = portfolio.rootInstrument;
          const limitRes = await dispatch(
            getLimitAlignPriceWad({
              sdkContext,
              isInverse: rootInstrument.isInverse,
              limitPrice,
              instrumentAddr: rootInstrument.instrumentAddr,
            }),
          ).unwrap();
          if (!limitRes) return;
          const { tick: tickNumber } = limitRes;
          const adjustTradeSide = tradeSide; // getAdjustTradeSide(tradeSide, rootInstrument.isInverse);

          if (!leverage) return;
          // pairAccountModel: PairLevelAccountModel, targetTick: number, side: Side, baseSize: BigNumber, leverageWad: BigNumber, slippage: number

          const result = await sdkContext.perp.simulate.simulateCrossMarketOrder({
            instrument: rootInstrument,
            leverage: leverage.wadValue,
            tradeInfo: portfolio,
            slippage: perToTenThousands(slippage),
            side: adjustTradeSide,
            size: {
              base: base.wadValue,
            },
            priceInfo: tickNumber,
          });

          const gateBalanceList = queryClient.getQueryData<IGateBalanceInfo[] | null>(
            QUERY_KEYS.BALANCE.GATE(chainId, userAddr),
          );
          const gateBalanceInfo = (gateBalanceList || [])?.find(
            (balance) => balance.address === position.rootInstrument.quoteToken.address,
          );

          const marketSimulationData: ISimulationData = {
            origin: result.tradeSimulation,
            ...result.tradeSimulation,
            simulationMainPosition: new WrappedPosition(
              {
                ...result.tradeSimulation.postPosition,
                id: position.rootPortfolio.id,
                instrumentId: position.rootInstrument.id,
                pairId: position.rootPair.id,
                accountId: position.rootPortfolio.rootAccount.id,
                portfolioId: position.rootPortfolio.id,
                blockInfo: position.rootPortfolio.blockInfo!,
              },
              position.rootPortfolio,
            ),

            tradePrice: WrappedBigNumber.from(result.tradeSimulation.tradePrice),
            limitTick: result.tradeSimulation.limitTick,
            limitPrice: WrappedBigNumber.from(TickMath.getWadAtTick(result.tradeSimulation.limitTick)),
            priceChangeRate: WrappedBigNumber.from(result.tradeSimulation.priceImpact),
            marginToDeposit: calcMarginToDeposit(result.tradeSimulation.margin, gateBalanceInfo?.balance || 0),
            additionalFee: WrappedBigNumber.from(result.tradeSimulation.stabilityFee),
            estimatedTradeValue: WrappedBigNumber.from(result.tradeSimulation.tradeValue),
            tradingFee: WrappedBigNumber.from(result.tradeSimulation.tradingFee),
            // margin may be input
            margin: WrappedBigNumber.from(result.tradeSimulation.marginChanged),
            realized: WrappedBigNumber.from(result.tradeSimulation.realized),
            minTradeValue: WrappedBigNumber.from(position.rootInstrument.minTradeValue),
            leverage: WrappedBigNumber.from(result.tradeSimulation.leverage),
            exceedMaxLeverage:
              result.tradeSimulation.exceedMaxLeverage &&
              WrappedBigNumber.from(result.tradeSimulation.leverage).lt(leverage || 0),
          };
          const estimatedTradeValue = WrappedBigNumber.from(TickMath.getWadAtTick(tickNumber)).mul(
            result.orderSimulation.size.base,
          );
          const orderSimulationData: IOrderSimulationData = {
            origin: result.orderSimulation,
            ...result.orderSimulation,
            tickNumber,
            // limitPrice: WrappedBigNumber.from(TickMath.getWadAtTick(tickNumber)),
            limitPrice: WrappedBigNumber.from(
              await sdkContext.perp.calc.getWadAtTick(portfolio.instrumentAddr, tickNumber),
            ),
            marginToDeposit: calcMarginToDeposit(result.orderSimulation.margin, gateBalanceInfo?.balance || 0),
            margin: WrappedBigNumber.from(result.orderSimulation.margin),
            minFeeRebate: WrappedBigNumber.from(result.orderSimulation.minFeeRebate),
            estimatedTradeValue: estimatedTradeValue,
            leverage: result.orderSimulation.leverage,
            minOrderValue: rootInstrument.minOrderValue,
            baseSize: result.orderSimulation.size.base,
          };

          const tradeSize = WrappedBigNumber.from(result.tradeSimulation.size.base);
          const orderSize = WrappedBigNumber.from(result.orderSimulation.size.base);

          const simulateResult: ICrossMarketOrderSimulation = {
            data: {
              ...result,
              tickNumber,
              tradeSize: tradeSize,
              orderSize: orderSize,
              totalMinSize: WrappedBigNumber.from(tradeSize).add(result.minOrderSize),
              tradeSimulation: marketSimulationData,
              orderSimulation: orderSimulationData,
              marginToDeposit: WrappedBigNumber.from(marketSimulationData.marginToDeposit).add(
                orderSimulationData.marginToDeposit,
              ),
              margin: WrappedBigNumber.from(marketSimulationData.margin).add(orderSimulationData.margin),
            },
          };

          if (!onlyCallFuncMode && orderSize.gt(0) && base.gte(simulateResult.data?.totalMinSize || 0)) {
            // simulate points for odyssey
            dispatch(
              simulatePointsByLimitTrade({
                chainId,
                tick: tickNumber,
                base: orderSize.wadValue,
                quote: rootInstrument.quoteToken,
                pair: portfolio.rootPair,
                userAddr: portfolio.traderAddr.toLowerCase(),
              }),
            );
          }

          return simulateResult;
        }
      }
      return undefined;
    } catch (e) {
      SentryService.captureException(
        e,
        {
          name: 'trade/simulateCrossMarketOrder',
          position: position?.toJSON(),
          base: base?.stringValue,
          limitPrice,
          tradeSide,
          leverage: leverage?.stringValue,
          chainId,
          slippage,
          onlyCallFuncMode,
        },
        'info',
      );
      console.log('🚀 simulateCrossMarketOrder error', e);
      const parsedError = parsedEthersError(e);
      const errorMsg = parsedError?.errorMsg || _.get(e, ['reason']) || _.get(e, ['message']);
      console.log('🚀 ~ errorMsg:', errorMsg);
      console.log('🚀 ~ file: actions.ts:546 ~ errorMsg:', errorMsg, parsedError);
      if (errorMsg.startsWith(ERROR_MSG_LIMIT_PRICE_FAR_FROM_MARK) || errorMsg.includes(INVALID_PRICE)) {
        return;
      } else if (errorMsg && errorMsg.includes(ERROR_MSG_SIZE_TO_TICK_IS_TRIVIAL)) {
        return { message: getMappedRevertReason(ERROR_MSG_SIZE_TO_TICK_IS_TRIVIAL) };
      }
      return { message: errorMsg, errorData: parsedError?.errorData };
    }
  },
);

export const placeCrossMarketOrder = createAsyncThunk(
  'tradeForm/placeCrossMarketOrder',
  async (
    {
      signer,
      chainId,
      userAddr,
      sdkContext,
      pair,
      deadline,
      simulation,
      provider,
      side,
    }: {
      chainId: number;
      userAddr: string;
      signer: JsonRpcSigner;
      pair: WrappedPair;
      sdkContext: Context;
      slippage: number;
      deadline: number;
      simulation: ICrossMarketOrderData;
      provider?: JsonRpcProvider;
      side: Side;
    },
    { dispatch, getState },
  ): Promise<ContractReceipt | undefined> => {
    try {
      const adjustTradeSide = side; // getAdjustTradeSide(side, pair.isInverse);
      const result = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record(
              'tx',
              `Try to send [${OPERATION_TX_TYPE.PLACE_CROSS_MARKET_ORDER}] operation tx for pair [${
                pair.rootInstrument.symbol
              }-${showProperDateString({ expiry: pair.expiry, format: 'MMDD' })}]`,
              undefined,
              {
                signer,
                expiry: pair.expiry,
                pair: pair,
                futures: pair.rootInstrument,
                simulation,
              },
            );
            const {
              global: { onChainReferralCode },
            } = getState() as AppState;
            const referralCode = onChainReferralCode?.referralCode || '';
            // signer: Signer, pair: PairModel, side: Side, swapSize: BigNumber, swapMargin: BigNumber, swapTradePrice: BigNumber, orderTickNumber: number, orderBaseWad: BigNumber, orderMargin: BigNumber, slippage: number, deadline: number, referralCode?: string, overrides?: PayableOverrides
            const populatedTx = await sdkContext.perp.instrument.placeCrossMarketOrder(
              {
                instrumentAddr: pair.rootInstrument.instrumentAddr,
                expiry: pair.expiry,
                orderSize: simulation.orderSize.wadValue,
                tradeSize: simulation.tradeSize.wadValue,
                side: adjustTradeSide,
                tradeLimitTick: simulation.tradeSimulation.limitTick,
                orderTick: simulation.orderSimulation.tickNumber,
                tradeMargin: simulation.tradeSimulation.margin.wadValue,
                // swapTradePrice: simulation.tradeSimulation.tradePrice.wadValue,
                orderMargin: simulation.orderSimulation.margin.wadValue,
                deadline: addedDeadline(deadline),
                referralCode,
              },
              { from: userAddr },
            );
            return signer.sendTransaction(populatedTx);
          },

          chainId,
          userAddr,
          txParams: {
            type: OPERATION_TX_TYPE.PLACE_CROSS_MARKET_ORDER,
            instrument: {
              baseSymbol: pair.rootInstrument.baseToken.symbol,
              quoteSymbol: pair.rootInstrument.quoteToken.symbol,
              isInverse: pair.rootInstrument.isInverse,
            },
            sendingTemplate: parseSendingTxMessageMapping[OPERATION_TX_TYPE.PLACE_CROSS_MARKET_ORDER]!(
              pair.rootInstrument.baseToken.symbol,
              simulation.tradeSimulation.tradePrice,
              simulation.orderSize.add(simulation.tradeSize),
              pair.rootInstrument.isInverse,
              side,
            ),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      if (result?.status) {
        dispatch(
          getPortfolioFromChain({
            chainId,
            userAddr,
            blockNumber: result.blockNumber,
            instrumentAddr: pair.rootInstrument.instrumentAddr,
            expiry: pair.expiry,
          }),
        );
        // need update balance
        if (simulation?.margin?.gt(0)) {
          if (simulation.marginToDeposit.gt(0)) {
            dispatch(
              checkTokenAllowance({
                userAddress: userAddr,
                chainId,
                marginToken: pair.rootInstrument.quoteToken,
                block: result.blockNumber,
                sdk: sdkContext,
              }),
            );
            dispatch(
              fetchTokenBalanceAction({
                chainId,
                userAddr,
                token: pair.rootInstrument.quoteToken,
                block: result.blockNumber,
              }),
            );
          }
          if (!simulation?.margin.eq(simulation?.marginToDeposit)) {
            dispatch(
              fetchGateBalanceAction({
                chainId,
                userAddr,
                tokens: [pair.rootInstrument.quoteToken],
                block: result.blockNumber,
              }),
            );
          }
        }
      }
      return result;
    } catch (e) {
      SentryService.captureException(e, {
        name: 'tradeForm/placeCrossMarketOrder',
        chainId,
        userAddr,
        pair: pair?.toJSON(),
        deadline,
        side,
      });
      console.log('🚀 ~ file: actions.ts:125 ~ e:', e);
      throw e;
    }
  },
);

export const fillLimitOrder = createAsyncThunk(
  'trade/fillLimitOrder',
  async (
    {
      sdkContext,
      chainId,
      signer,
      order,
      userAddr,
      portfolio,
      deadline,
      provider,
    }: {
      chainId: number;
      sdkContext: Context;
      signer: JsonRpcSigner;
      userAddr: string;
      order: WrappedOrder;
      portfolio: WrappedPortfolio;
      deadline: number;
      provider: JsonRpcProvider;
    },
    { dispatch },
  ): Promise<ContractReceipt | undefined> => {
    try {
      const pair = portfolio.rootPair;
      const result = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record(
              'tx',
              `Try to send [${OPERATION_TX_TYPE.FILL_ORDER}] operation tx for pair [${portfolio.rootInstrument.symbol}`,
              undefined,
              {
                signer,
                portfolio,
                order,
                deadline: addedDeadline(deadline),
              },
            );

            const populatedTx = await sdkContext.perp.instrument.fillLimitOrder(
              {
                instrumentAddr: pair.rootInstrument.instrumentAddr,
                expiry: pair.expiry,
                nonce: order.nonce,
                tick: order.tick,
                target: userAddr,
              },
              { from: userAddr },
            );
            return signer.sendTransaction(populatedTx);
          },

          chainId,
          userAddr,
          txParams: {
            type: OPERATION_TX_TYPE.FILL_ORDER,
            instrument: {
              baseSymbol: pair.rootInstrument.baseToken.symbol,
              quoteSymbol: pair.rootInstrument.quoteToken.symbol,
              isInverse: pair.rootInstrument.isInverse,
            },
            sendingTemplate: parseSendingTxMessageMapping[OPERATION_TX_TYPE.FILL_ORDER]!(order.tick, pair.isInverse),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      if (result?.status) {
        dispatch(
          getPortfolioFromChain({
            chainId,
            userAddr,
            blockNumber: result.blockNumber,
            instrumentAddr: pair.rootInstrument.instrumentAddr,
            expiry: pair.expiry,
          }),
        );
        dispatch(
          fetchGateBalanceAction({
            chainId,
            userAddr,
            tokens: [pair.rootInstrument.quoteToken],
            block: result.blockNumber,
          }),
        );
        _.unset(portfolio.orderMap, [order.id]);
      }
      if (result?.transactionHash) {
        const { setPollingHistoryTx } = useGlobalStore.getState();
        setPollingHistoryTx({
          chainId,
          userAddress: userAddr,
          pollingHistoryId: PollingHistoryId.order,
          tx: result?.transactionHash,
        });
      }
      return result;
    } catch (e) {
      SentryService.captureException(e, {
        name: 'trade/fillLimitOrder',
        chainId,
        order: order.id,
        userAddr,
        deadline,
      });
      console.log('🚀 ~ file: actions.ts:125 ~ e:', e);
      throw e;
    }
  },
);

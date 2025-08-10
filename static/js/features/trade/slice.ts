import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BatchOrderSizeDistribution, InstrumentInfo, Side } from '@synfutures/sdks-perp';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { TABLE_TYPES, TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';
import { ERROR_MSG_IMR } from '@/constants/simulation';
import { PRICE_BASIS_FOR_PNL } from '@/constants/storage';
import { DEFAULT_STEP_RATIO, MANAGE_SIDE, TRADE_TYPE } from '@/constants/trade';
import { initPriceBasisForPnl, PriceBasisForPnl } from '@/constants/trade/priceBasisForPnl';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { DYNAMIC } from '@/types/storage';
import {
  AdjustMarginByLeverageState,
  getDefaultCloseFormState,
  getDefaultLimitFormState,
  getDefaultMarketFormState,
  getDefaultScaleLimitFormState,
  getDefaultSimulation,
  IAdjustMarginFormState,
  IAdjustMarginSimulation,
  ICancelFormState,
  IClosePositionFormState,
  ICrossMarketOrderSimulation,
  ILimitFormState,
  IMarketFormState,
  IOrderCancelStatus,
  IOrderSimulation,
  IPnlParams,
  IScaledOrderSimulation,
  IScaleFormState,
  ISimulation,
  MarginAdjustMethod,
} from '@/types/trade';
import { getSavedPairLeverage } from '@/utils/localstorage';
import { inputNumChecker } from '@/utils/numberUtil';

import { WrappedPair } from '@/entities/WrappedPair';
import { FundingChartInterval, KlineInterval } from '@synfutures/sdks-perp-datasource';
import { isMobile } from 'react-device-detect';
import { AppState } from '../store';
import {
  adjustMargin,
  batchPlaceScaledLimitOrder,
  cancelTradeOrders,
  clearMarketTradeSimulation,
  fillLimitOrder,
  orderSimulate,
  placeCrossMarketOrder,
  placeLimitOrder,
  resetAdjustMarginForm,
  resetClosePositionForm,
  resetFormByChainId,
  selectOrderToCancel,
  setAdjustMarginByLeverageState,
  setAdjustMarginFormAmount,
  setAdjustMarginMethod,
  setAdjustMarginSide,
  setAdjustMarginSimulation,
  setClosePositionFormAmount,
  setCurrentFutures,
  setCurrentPair,
  setFundingChartDuration,
  setIsChosenOrder,
  setIsTurnOnCrossMarket,
  setLimitPrice,
  setMarketFormState,
  setPairChartDuration,
  setPairLeverageSwitchChecked,
  setPairStepRatio,
  setPnlShare,
  setPriceBasisForPnl,
  setScaleFormAmount,
  setScaleLimitPrice,
  setTradeDrawerType,
  setTradeFormAmount,
  setTradeFormLeverage,
  setTradeFormLeverageAndMargin,
  setTradeFormMargin,
  setTradeFormSide,
  setTradeFormType,
  setTransferAmount,
  simulateAdjustMargin,
  simulateBatchPlaceScaledLimitOrder,
  simulateCrossMarketOrder,
  simulateMarketClosePosition,
  simulateMarketTrade,
  switchToMarketTab,
  trade,
  updateLimitPriceFromOrderBook,
  updateSimulateError,
} from './actions';

export interface ITradeState {
  priceBasisForPnl: PriceBasisForPnl;
  isHistoryPortfolioTab: boolean;
  chainFormType: {
    [chainId: number]: TRADE_TYPE;
  };
  chainDrawerType: {
    [chainId: number]: TRADE_TYPE;
  };
  chainLeverageSwitchChecked: {
    [chainId: number]: {
      [userAddr: string]: {
        [pairId: string]: boolean;
      };
    };
  };
  chainMarketFormState: {
    [chainId: number]: IMarketFormState;
  };
  chainMarketSimulation: {
    [chainId: number]: ISimulation;
  };
  chainMarketFormStatus: {
    [chainId: number]: FETCHING_STATUS;
  };
  chainScaleFormState: {
    [chainId: number]: IScaleFormState;
  };
  chainScaleSimulation: {
    [chainId: number]: IScaledOrderSimulation;
  };
  chainScaleFormStatus: {
    [chainId: number]: FETCHING_STATUS;
  };
  chainCurrentFutures: {
    [chainId: number]: InstrumentInfo;
  };
  chainCurrentPair: {
    [chainId: number]: WrappedPair;
  };

  chainLimitFormState: {
    [chainId: number]: ILimitFormState;
  };
  chainLimitSimulation: {
    [chainId: number]: IOrderSimulation;
  };
  chainLimitFormStatus: {
    [chainId: number]: FETCHING_STATUS;
  };
  chainAdjustMarginFormState: {
    [chainId: number]: IAdjustMarginFormState;
  };
  chainAdjustMarginSimulation: {
    [chainId: number]: IAdjustMarginSimulation;
  };
  chainAdjustMarginFormStatus: {
    [chainId: number]: FETCHING_STATUS;
  };
  chainClosePositionFormState: {
    [chainId: number]: IClosePositionFormState;
  };
  chainClosePositionFormStatus: {
    [chainId: number]: FETCHING_STATUS;
  };
  chainCloseSimulation: {
    [chainId: number]: ISimulation;
  };
  chainPnlShare: {
    [chainId: number]: IPnlParams;
  };
  chainCloseSimulationStatus: {
    [chainId: number]: FETCHING_STATUS;
  };
  chainCancelFormState: {
    [chainId: number]: ICancelFormState;
  };
  chainCancelOrderFormStatus: {
    [chainId: number]: { [orderId: string]: FETCHING_STATUS };
  };
  chainCancelOrderBulkStatus: {
    [chainId: number]: boolean;
  };
  tradePortfolioTab: TABLE_TYPES;
  isChosenOrder: boolean;
  chainChartDuration: {
    [chainId: number]: KlineInterval;
  };
  fundingChartDuration: {
    [chainId: number]: FundingChartInterval;
  };
  chainStepRatio: {
    [chainId: number]: number;
  };
  chainCrossMarketSimulation: {
    [chainId: number]: ICrossMarketOrderSimulation;
  };
  adjustMarginControlState: {
    marginAdjustMethod: MarginAdjustMethod;
    manageSides: { [id in MarginAdjustMethod]: MANAGE_SIDE };
  };
  chainAdjustMarginByLeverageState: {
    [chainId: number]: AdjustMarginByLeverageState;
  };
}

const initialState: ITradeState = {
  adjustMarginControlState: {
    marginAdjustMethod: MarginAdjustMethod.Leverage,
    manageSides: { [MarginAdjustMethod.Amount]: MANAGE_SIDE.IN, [MarginAdjustMethod.Leverage]: MANAGE_SIDE.IN },
  },
  chainFormType: {},
  chainLeverageSwitchChecked: {},
  chainMarketFormState: {},
  chainMarketSimulation: {},
  chainMarketFormStatus: {},
  chainScaleFormState: {},
  chainScaleSimulation: {},
  chainScaleFormStatus: {},
  chainLimitFormState: {},
  chainLimitSimulation: {},

  chainLimitFormStatus: {},
  chainCloseSimulationStatus: {},
  chainPnlShare: {},
  chainAdjustMarginFormState: {},
  chainAdjustMarginFormStatus: {},
  chainAdjustMarginSimulation: {},
  chainClosePositionFormState: {},
  chainClosePositionFormStatus: {},
  chainCloseSimulation: {},
  chainCancelFormState: {},
  chainCancelOrderFormStatus: {},
  chainCurrentFutures: {},
  chainDrawerType: {},
  chainCurrentPair: {},
  tradePortfolioTab: TABLE_TYPES.TRADE_HISTORY,
  isHistoryPortfolioTab: false,
  isChosenOrder: false,
  chainCancelOrderBulkStatus: {},
  chainChartDuration: {},
  chainStepRatio: {},
  fundingChartDuration: {},
  priceBasisForPnl: initPriceBasisForPnl,
  chainCrossMarketSimulation: {},
  chainAdjustMarginByLeverageState: {},
};

export const tradeSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {
    setIsHistoryPortfolioTab: (state, { payload }: PayloadAction<boolean>) => {
      state.isHistoryPortfolioTab = payload;
    },
    setTradePortfolioTab: (state, { payload: { tab } }: PayloadAction<{ chainId: number; tab: TABLE_TYPES }>) => {
      state.tradePortfolioTab = tab;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setAdjustMarginByLeverageState, (state, { payload }) => {
        const oldProps = state.chainAdjustMarginByLeverageState[payload.chainId];
        _.set(state.chainAdjustMarginByLeverageState, [payload.chainId], {
          leverageInput: payload.leverageInput === undefined ? oldProps?.leverageInput : payload.leverageInput,
          isLeverageInputChanged:
            payload.isLeverageInputChanged === undefined
              ? oldProps?.isLeverageInputChanged
              : payload.isLeverageInputChanged,
          errMsg: payload.errMsg === undefined ? oldProps?.errMsg : payload.errMsg,
        });
      })
      .addCase(setAdjustMarginMethod, (state, { payload }) => {
        state.adjustMarginControlState.marginAdjustMethod = payload;
      })
      .addCase(setAdjustMarginSide, (state, { payload }) => {
        state.adjustMarginControlState.manageSides[payload.method] = payload.side;
      })
      .addCase(setPriceBasisForPnl, (state, { payload }) => {
        state.priceBasisForPnl = payload.priceBasisForPnl;
        localStorage.setItem(PRICE_BASIS_FOR_PNL, payload.priceBasisForPnl);
      })
      .addCase(resetFormByChainId, (state, { payload }) => {
        _.set(state.chainFormType, [payload.chainId], TRADE_TYPE.MARKET);
        state.tradePortfolioTab = TABLE_TYPES.TRADE_HISTORY;
        state.isHistoryPortfolioTab = false;
        _.set(state.chainMarketFormState, [payload.chainId], getDefaultMarketFormState(payload.chainId));
        _.set(state.chainLimitFormState, [payload.chainId], getDefaultLimitFormState(payload.chainId));
        _.set(state.chainScaleFormState, [payload.chainId], getDefaultScaleLimitFormState(payload.chainId));
        _.set(state.chainAdjustMarginFormState, [payload.chainId], { chainId: payload.chainId });
        _.set(state.chainCancelFormState, [payload.chainId], { chainId: payload.chainId });
        _.set(state.chainMarketSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainLimitSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainCrossMarketSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainScaleSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainCloseSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainAdjustMarginSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
      })
      .addCase(setTradeFormType, (state, { payload }) => {
        _.set(state.chainFormType, [payload.chainId], payload.tradeType);
        let tradeSide: Side | undefined = undefined;
        if (payload.tradeType === TRADE_TYPE.LIMIT) {
          const marketFormState = _.get(state.chainMarketFormState, [payload.chainId]);
          tradeSide = marketFormState.tradeSide;
        } else if (payload.tradeType === TRADE_TYPE.MARKET) {
          const limitFormState = _.get(state.chainLimitFormState, [payload.chainId]);
          tradeSide = limitFormState.tradeSide;
        } else {
          const scaleLimitFormState = _.get(state.chainScaleFormState, [payload.chainId]);
          tradeSide = scaleLimitFormState.tradeSide;
        }
        _.set(state.chainMarketFormState, [payload.chainId], getDefaultMarketFormState(payload.chainId, tradeSide));
        _.set(state.chainLimitFormState, [payload.chainId], getDefaultLimitFormState(payload.chainId, tradeSide));
        _.set(state.chainScaleFormState, [payload.chainId], getDefaultLimitFormState(payload.chainId, tradeSide));
        _.set(state.chainClosePositionFormState, [payload.chainId], getDefaultCloseFormState(payload.chainId));
        _.set(state.chainAdjustMarginFormState, [payload.chainId], { chainId: payload.chainId });
        _.set(state.chainCancelFormState, [payload.chainId], { chainId: payload.chainId });
        _.set(state.chainMarketSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainLimitSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainCrossMarketSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainCloseSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainAdjustMarginSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
      })
      .addCase(setTradeDrawerType, (state, { payload }) => {
        _.set(state.chainDrawerType, [payload.chainId], payload.tradeType);
        _.set(state.chainClosePositionFormState, [payload.chainId], getDefaultCloseFormState(payload.chainId));
        _.set(state.chainAdjustMarginFormState, [payload.chainId], { chainId: payload.chainId });
        _.set(state.chainCancelFormState, [payload.chainId], { chainId: payload.chainId });
        _.set(state.chainCloseSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        _.set(state.chainAdjustMarginSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
      })
      .addCase(setPnlShare, (state, { payload }) => {
        _.set(state.chainPnlShare, [payload.chainId], payload);
      })
      .addCase(resetAdjustMarginForm, (state, { payload }) => {
        // _.set(state.chainFormType, [payload.chainId], TRADE_TYPE.MARKET);
        // state.tradePortfolioTab = TABLE_TYPES.TRADE_HISTORY;
        _.set(state.chainAdjustMarginFormState, [payload.chainId], { chainId: payload.chainId });
        _.set(state.chainAdjustMarginSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
      })
      .addCase(resetClosePositionForm, (state, { payload }) => {
        // _.set(state.chainFormType, [payload.chainId], TRADE_TYPE.MARKET);
        // state.tradePortfolioTab = TABLE_TYPES.TRADE_HISTORY;
        _.set(state.chainClosePositionFormState, [payload.chainId], getDefaultCloseFormState(payload.chainId));
        _.set(state.chainCloseSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
      })
      .addCase(switchToMarketTab, (state, { payload }) => {
        _.set(state.chainFormType, [payload.chainId], TRADE_TYPE.MARKET);
        state.tradePortfolioTab = TABLE_TYPES.TRADE_HISTORY;
        state.isHistoryPortfolioTab = false;
      })
      .addCase(setPairLeverageSwitchChecked, (state, { payload }) => {
        _.set(state.chainLeverageSwitchChecked, [payload.chainId, payload.userAddr, payload.pairId], payload.checked);
      })

      .addCase(clearMarketTradeSimulation, (state, { payload }) => {
        _.set(state.chainMarketSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
      })
      .addCase(updateSimulateError, (state, { payload }) => {
        if (payload) {
          if (payload.type === TRADE_TYPE.MARKET)
            _.set(state.chainMarketSimulation, [payload.chainId], {
              chainId: payload.chainId,
              message: payload.errMessage,
            });
          else if (payload.type === TRADE_TYPE.LIMIT)
            _.set(state.chainLimitSimulation, [payload.chainId], {
              chainId: payload.chainId,
              message: payload.errMessage,
            });
          else if (payload.type === TRADE_TYPE.SCALE_LIMIT)
            _.set(state.chainScaleSimulation, [payload.chainId], {
              chainId: payload.chainId,
              message: payload.errMessage,
            });
        }
      })
      .addCase(setPairChartDuration, (state, { payload }) => {
        _.set(state.chainChartDuration, [payload.chainId], payload.chartDuration);
      })
      .addCase(setFundingChartDuration, (state, { payload }) => {
        _.set(state.fundingChartDuration, [payload.chainId], payload.chartDuration);
      })
      .addCase(setPairStepRatio, (state, { payload }) => {
        _.set(state.chainStepRatio, [payload.chainId], payload.stepRatio);
      })
      .addCase(setIsChosenOrder, (state, { payload }) => {
        state.isChosenOrder = payload.isChosenOrder;
      })
      .addCase(setTradeFormSide, (state, { payload }) => {
        const marketFormState = _.get(state.chainMarketFormState, [payload.chainId]);
        const limitFormState = _.get(state.chainLimitFormState, [payload.chainId]);
        const scaleLimitFormState = _.get(state.chainScaleFormState, [payload.chainId]);
        // const formType = _.get(state.chainFormType, [payload.chainId]);
        // if (formType === TRADE_TYPE.LIMIT) {
        //   _.set(state.chainLimitFormState, [payload.chainId], _.merge({}, limitFormState, payload));
        // } else {
        //   _.set(state.chainMarketFormState, [payload.chainId], _.merge({}, marketFormState, payload));
        // }
        _.set(state.chainLimitFormState, [payload.chainId], _.merge({}, limitFormState, payload));
        _.set(state.chainMarketFormState, [payload.chainId], _.merge({}, marketFormState, payload));
        _.set(state.chainScaleFormState, [payload.chainId], _.merge({}, scaleLimitFormState, payload));
      })
      .addCase(setTradeFormAmount, (state, { payload }) => {
        const marketFormState = _.get(state.chainMarketFormState, [payload.chainId]);
        const limitFormState = _.get(state.chainLimitFormState, [payload.chainId]);
        const formType = _.get(state.chainFormType, [payload.chainId]);
        if (formType === TRADE_TYPE.LIMIT) {
          _.set(state.chainLimitFormState, [payload.chainId], _.merge({}, limitFormState, payload));
          _.set(state.chainCrossMarketSimulation, [payload.chainId], getDefaultSimulation(payload.chainId));
        } else {
          _.set(state.chainMarketFormState, [payload.chainId], _.merge({}, marketFormState, payload));
        }
      })
      .addCase(setScaleFormAmount, (state, { payload }) => {
        const limitFormState = _.get(state.chainScaleFormState, [payload.chainId]);
        _.set(state.chainScaleFormState, [payload.chainId], _.merge({}, limitFormState, payload));
      })
      .addCase(setTradeFormLeverage, (state, { payload }) => {
        const marketFormState = _.get(state.chainMarketFormState, [payload.chainId]);
        const limitFormState = _.get(state.chainLimitFormState, [payload.chainId]);
        const scaleLimitFormState = _.get(state.chainScaleFormState, [payload.chainId]);
        const adjustMarginFormState = _.get(state.chainAdjustMarginFormState, [payload.chainId]);
        const formType = _.get(state.chainFormType, [payload.chainId]);
        if (formType === TRADE_TYPE.ADJUST_MARGIN) {
          _.set(state.chainAdjustMarginFormState, [payload.chainId], _.merge({}, adjustMarginFormState, payload));
        }
        if (formType === TRADE_TYPE.MARKET) {
          _.set(state.chainMarketFormState, [payload.chainId], _.merge({}, marketFormState, payload));
        }
        if (formType === TRADE_TYPE.LIMIT) {
          _.set(state.chainLimitFormState, [payload.chainId], _.merge({}, limitFormState, payload));
        }
        if (formType === TRADE_TYPE.SCALE_LIMIT) {
          _.set(state.chainScaleFormState, [payload.chainId], _.merge({}, scaleLimitFormState, payload));
        }
      })
      .addCase(setTradeFormLeverageAndMargin, (state, { payload }) => {
        const marketFormState = _.get(state.chainMarketFormState, [payload.chainId]);
        const adjustMarginFormState = _.get(state.chainAdjustMarginFormState, [payload.chainId]);
        const formType = _.get(state.chainFormType, [payload.chainId]);
        if (formType === TRADE_TYPE.ADJUST_MARGIN) {
          _.set(state.chainAdjustMarginFormState, [payload.chainId], _.merge({}, adjustMarginFormState, payload));
        } else {
          _.set(state.chainMarketFormState, [payload.chainId], _.merge({}, marketFormState, payload));
        }
      })
      .addCase(simulateMarketTrade.pending, (state, { meta }) => {
        if (meta.arg.onlyCallFuncMode) {
          return;
        }
        const { chainId } = meta.arg;
        const formType = _.get(state.chainFormType, [chainId]);
        const drawerType = _.get(state.chainDrawerType, [chainId]);

        if (formType === TRADE_TYPE.CLOSE_POSITION || drawerType === TRADE_TYPE.CLOSE_POSITION) {
          _.set(state.chainCloseSimulationStatus, [chainId], FETCHING_STATUS.FETCHING);
        }
      })
      .addCase(simulateMarketTrade.fulfilled, (state, { meta, payload }) => {
        const { chainId, position, leverage, userAddr } = meta.arg;
        const formType = _.get(state.chainFormType, [chainId]);
        const drawerType = _.get(state.chainDrawerType, [chainId]);
        const marketFormState = _.get(state.chainMarketFormState, [chainId]);
        if (meta.arg.onlyCallFuncMode) {
          return;
        }
        if (formType === TRADE_TYPE.CLOSE_POSITION || drawerType === TRADE_TYPE.CLOSE_POSITION) {
          _.set(state.chainCloseSimulation, [chainId], payload);
          _.set(state.chainCloseSimulationStatus, [chainId], FETCHING_STATUS.DONE);
        } else {
          _.set(state.chainMarketSimulation, [chainId], payload);
          if (payload) {
            //TODO may need to use payload.data?.simulationMainPosition.leverageWad in the future
            const simulatedLeverage = WrappedBigNumber.from(
              payload.data?.leverage ||
                (position?.hasPosition ? position?.leverageWad : TRADE_LEVERAGE_THRESHOLDS.DEFAULT),
            ).stringValue;
            const dynamic = getSavedPairLeverage(userAddr, chainId, position?.rootPair.id, DYNAMIC);
            let leverageAfterSimulation = inputNumChecker(
              !!dynamic && position?.hasPosition
                ? marketFormState?.leverage || TRADE_LEVERAGE_THRESHOLDS.DEFAULT.toString()
                : leverage
                ? leverage
                : simulatedLeverage,
              1,
            );
            //TODO check this after simulation leverageWad updates
            if (payload.message === ERROR_MSG_IMR) {
              leverageAfterSimulation =
                getSavedPairLeverage(userAddr, chainId, position?.rootPair.id, formType) ||
                TRADE_LEVERAGE_THRESHOLDS.MAX.toString();
            }
            _.set(
              state.chainMarketFormState,
              [chainId],
              _.merge({}, marketFormState, {
                leverage: leverageAfterSimulation,
              }),
            );
            if (!isMobile) {
              state.tradePortfolioTab = TABLE_TYPES.TRADE_HISTORY;
            }
            state.isHistoryPortfolioTab = false;
          }
        }
      })
      .addCase(simulateMarketTrade.rejected, (state, { meta }) => {
        if (meta.arg.onlyCallFuncMode) {
          return;
        }
        const { chainId } = meta.arg;
        const formType = _.get(state.chainFormType, [chainId]);
        const drawerType = _.get(state.chainDrawerType, [chainId]);

        if (formType === TRADE_TYPE.CLOSE_POSITION || drawerType === TRADE_TYPE.CLOSE_POSITION) {
          _.set(state.chainCloseSimulationStatus, [chainId], FETCHING_STATUS.DONE);
        } else {
        }
      });
    // simulate close
    builder
      .addCase(simulateMarketClosePosition.pending, (state, { meta }) => {
        if (meta.arg.onlyCallFuncMode) {
          return;
        }
        const { chainId } = meta.arg;
        const formType = _.get(state.chainFormType, [chainId]);
        const drawerType = _.get(state.chainDrawerType, [chainId]);

        if (formType === TRADE_TYPE.CLOSE_POSITION || drawerType === TRADE_TYPE.CLOSE_POSITION) {
          _.set(state.chainCloseSimulationStatus, [chainId], FETCHING_STATUS.FETCHING);
        }
      })
      .addCase(simulateMarketClosePosition.fulfilled, (state, { meta, payload }) => {
        const { chainId, position, userAddr } = meta.arg;
        const formType = _.get(state.chainFormType, [chainId]);
        const drawerType = _.get(state.chainDrawerType, [chainId]);
        const marketFormState = _.get(state.chainMarketFormState, [chainId]);
        if (meta.arg.onlyCallFuncMode) {
          return;
        }
        if (formType === TRADE_TYPE.CLOSE_POSITION || drawerType === TRADE_TYPE.CLOSE_POSITION) {
          _.set(state.chainCloseSimulation, [chainId], payload);
          _.set(state.chainCloseSimulationStatus, [chainId], FETCHING_STATUS.DONE);
        } else {
          _.set(state.chainMarketSimulation, [chainId], payload);
          if (payload) {
            //TODO may need to use payload.data?.simulationMainPosition.leverageWad in the future
            const simulatedLeverage = WrappedBigNumber.from(
              payload.data?.leverage ||
                (position?.hasPosition ? position?.leverageWad : TRADE_LEVERAGE_THRESHOLDS.DEFAULT),
            ).stringValue;
            const dynamic = getSavedPairLeverage(userAddr, chainId, position?.rootPair.id, DYNAMIC);
            let leverageAfterSimulation = inputNumChecker(
              !!dynamic && position?.hasPosition
                ? marketFormState?.leverage || TRADE_LEVERAGE_THRESHOLDS.DEFAULT.toString()
                : simulatedLeverage,
              1,
            );
            //TODO check this after simulation leverageWad updates
            if (payload.message === ERROR_MSG_IMR) {
              leverageAfterSimulation =
                getSavedPairLeverage(userAddr, chainId, position?.rootPair.id, formType) ||
                TRADE_LEVERAGE_THRESHOLDS.MAX.toString();
            }
            _.set(
              state.chainMarketFormState,
              [chainId],
              _.merge({}, marketFormState, {
                leverage: leverageAfterSimulation,
              }),
            );
            if (!isMobile) state.tradePortfolioTab = TABLE_TYPES.TRADE_HISTORY;
            state.isHistoryPortfolioTab = false;
          }
        }
      })
      .addCase(simulateMarketClosePosition.rejected, (state, { meta }) => {
        if (meta.arg.onlyCallFuncMode) {
          return;
        }
        const { chainId } = meta.arg;
        const formType = _.get(state.chainFormType, [chainId]);
        const drawerType = _.get(state.chainDrawerType, [chainId]);

        if (formType === TRADE_TYPE.CLOSE_POSITION || drawerType === TRADE_TYPE.CLOSE_POSITION) {
          _.set(state.chainCloseSimulationStatus, [chainId], FETCHING_STATUS.DONE);
        } else {
        }
      });

    builder
      .addCase(setCurrentFutures, (state, { payload }) => {
        _.set(state.chainCurrentFutures, [payload.chainId], payload.futures);
      })
      .addCase(setCurrentPair, (state, { payload }) => {
        _.set(state.chainCurrentPair, [payload.chainId], payload.pair);
      })
      .addCase(setTradeFormMargin, (state, { payload }) => {
        const marketFormState = _.get(state.chainMarketFormState, [payload.chainId]);
        const limitFormState = _.get(state.chainLimitFormState, [payload.chainId]);
        const formType = _.get(state.chainFormType, [payload.chainId]);
        if (formType === TRADE_TYPE.LIMIT) {
          _.set(state.chainLimitFormState, [payload.chainId], _.merge({}, limitFormState, payload));
        } else {
          _.set(state.chainMarketFormState, [payload.chainId], _.merge({}, marketFormState, payload));
        }
      })
      .addCase(setTransferAmount, (state, { payload }) => {
        const marketFormState = _.get(state.chainMarketFormState, [payload.chainId]);
        _.set(state.chainMarketFormState, [payload.chainId], _.merge({}, marketFormState, payload));
      })
      .addCase(selectOrderToCancel, (state, { payload }) => {
        _.set(state.chainCancelFormState, [payload.chainId], payload);
      })
      .addCase(setLimitPrice, (state, { payload }) => {
        const limitFormState = _.get(state.chainLimitFormState, [payload.chainId]);
        _.set(state.chainLimitFormState, [payload.chainId], _.merge({}, limitFormState, payload));
      })
      .addCase(setScaleLimitPrice, (state, { payload }) => {
        const limitFormState = _.get(state.chainScaleFormState, [payload.chainId]);
        _.set(state.chainScaleFormState, [payload.chainId], _.merge({}, limitFormState, payload));
      })
      .addCase(updateLimitPriceFromOrderBook, (state, { payload }) => {
        const limitFormState = _.get(state.chainLimitFormState, [payload.limitState.chainId]);
        _.set(state.chainLimitFormState, [payload.limitState.chainId], _.merge({}, limitFormState, payload.limitState));
        _.set(state.chainFormType, [payload.limitState.chainId], payload.formType);
      })
      .addCase(setClosePositionFormAmount, (state, { payload }) => {
        const closePositionFormState = _.get(state.chainClosePositionFormState, [payload.chainId]);
        _.set(state.chainClosePositionFormState, [payload.chainId], _.merge({}, closePositionFormState, payload));
      })
      .addCase(setAdjustMarginFormAmount, (state, { payload }) => {
        const adjustMarginFormState = _.get(state.chainAdjustMarginFormState, [payload.chainId]);
        _.set(state.chainAdjustMarginFormState, [payload.chainId], _.merge({}, adjustMarginFormState, payload));
      })
      .addCase(setAdjustMarginSimulation, (state, { payload }) => {
        _.set(state.chainAdjustMarginSimulation, [payload.chainId], payload);
      })
      .addCase(setMarketFormState, (state, { payload }) => {
        _.set(state.chainMarketFormState, [payload.chainId], payload);
      })
      .addCase(trade.pending, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainMarketFormStatus, [chainId], FETCHING_STATUS.FETCHING);
      })
      .addCase(trade.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        if (payload) {
          const oldState = _.get(state.chainMarketFormState, [chainId]);
          _.set(state.chainMarketFormState, [chainId], {
            ...oldState,
            baseAmount: '',
            quoteAmount: '',
            marginAmount: '',
          });
        }
        _.set(state.chainMarketFormStatus, [chainId], FETCHING_STATUS.DONE);
        _.set(state.chainMarketSimulation, [chainId], getDefaultSimulation(chainId));
        _.set(state.chainCloseSimulation, [chainId], getDefaultSimulation(chainId));
      })
      .addCase(trade.rejected, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainMarketFormStatus, [chainId], FETCHING_STATUS.DONE);
      })
      .addCase(placeLimitOrder.pending, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainLimitFormStatus, [chainId], FETCHING_STATUS.FETCHING);
      })
      .addCase(placeLimitOrder.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        if (payload) {
          const oldState = _.get(state.chainLimitFormState, [chainId]);
          _.set(state.chainLimitFormState, [chainId], { ...oldState, baseAmount: '', quoteAmount: '' });
        }
        _.set(state.chainLimitFormStatus, [chainId], FETCHING_STATUS.DONE);
        _.set(state.chainLimitSimulation, [chainId], getDefaultSimulation(chainId));
      })
      .addCase(placeLimitOrder.rejected, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainLimitFormStatus, [chainId], FETCHING_STATUS.DONE);
      })
      .addCase(simulateBatchPlaceScaledLimitOrder.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        _.set(state.chainScaleSimulation, [chainId], payload);
      })
      // batchPlaceScaledLimitOrder
      .addCase(batchPlaceScaledLimitOrder.pending, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainScaleFormStatus, [chainId], FETCHING_STATUS.FETCHING);
      })
      .addCase(batchPlaceScaledLimitOrder.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        if (payload) {
          const oldState = _.get(state.chainScaleFormState, [chainId]);
          _.set(state.chainScaleFormState, [chainId], {
            ...oldState,
            baseAmount: '',
            quoteAmount: '',
            sizeDistribution: BatchOrderSizeDistribution.FLAT,
          });
        }
        _.set(state.chainScaleFormStatus, [chainId], FETCHING_STATUS.DONE);
        _.set(state.chainScaleSimulation, [chainId], getDefaultSimulation(chainId));
      })
      .addCase(batchPlaceScaledLimitOrder.rejected, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainScaleFormStatus, [chainId], FETCHING_STATUS.DONE);
      })
      // adjustMargin
      .addCase(adjustMargin.pending, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainAdjustMarginFormStatus, [chainId], FETCHING_STATUS.FETCHING);
      })
      .addCase(adjustMargin.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        if (payload) {
          _.set(state.chainAdjustMarginFormState, [chainId], {});
        }
        _.set(state.chainAdjustMarginFormStatus, [chainId], FETCHING_STATUS.DONE);
        _.set(state.chainAdjustMarginSimulation, [chainId], getDefaultSimulation(chainId));
      })
      .addCase(adjustMargin.rejected, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainAdjustMarginFormStatus, [chainId], FETCHING_STATUS.DONE);
      })
      .addCase(cancelTradeOrders.pending, (state, { meta }) => {
        const { chainId, orders, bulkCancel } = meta.arg;
        orders.forEach((o) => {
          _.set(state.chainCancelOrderFormStatus, [chainId, o.id], FETCHING_STATUS.FETCHING);
        });
        if (bulkCancel) {
          _.set(state.chainCancelOrderBulkStatus, [chainId], true);
        }
      })
      .addCase(cancelTradeOrders.fulfilled, (state, { meta }) => {
        const { chainId, orders, bulkCancel } = meta.arg;
        _.set(state.chainCancelFormState, [chainId], {});
        orders.forEach((o) => {
          _.set(state.chainCancelOrderFormStatus, [chainId, o.id], FETCHING_STATUS.DONE);
        });
        if (bulkCancel) {
          _.set(state.chainCancelOrderBulkStatus, [chainId], false);
          state.isChosenOrder = false;
        }
      })
      .addCase(cancelTradeOrders.rejected, (state, { meta }) => {
        const { chainId, orders, bulkCancel } = meta.arg;
        orders.forEach((o) => {
          _.set(state.chainCancelOrderFormStatus, [chainId, o.id], FETCHING_STATUS.DONE);
        });
        if (bulkCancel) {
          _.set(state.chainCancelOrderBulkStatus, [chainId], false);
        }
      })
      .addCase(fillLimitOrder.pending, (state, { meta }) => {
        const { chainId, order } = meta.arg;
        _.set(state.chainCancelOrderFormStatus, [chainId, order.id], FETCHING_STATUS.FETCHING);
      })
      .addCase(fillLimitOrder.fulfilled, (state, { meta }) => {
        const { chainId, order } = meta.arg;
        _.set(state.chainCancelFormState, [chainId], {});
        _.set(state.chainCancelOrderFormStatus, [chainId, order.id], FETCHING_STATUS.DONE);
      })
      .addCase(fillLimitOrder.rejected, (state, { meta }) => {
        const { chainId, order } = meta.arg;
        _.set(state.chainCancelOrderFormStatus, [chainId, order.id], FETCHING_STATUS.DONE);
      })
      .addCase(orderSimulate.fulfilled, (state, { meta, payload }) => {
        if (meta.arg.onlyCallFuncMode) {
          return;
        }
        const { chainId } = meta.arg;

        _.set(state.chainLimitSimulation, [chainId], payload);
        // if (margin && payload?.data?.leverage) {
        //   _.set(
        //     state.chainLimitFormState,
        //     [chainId, 'leverage'],
        //     WrappedBigNumber.from(payload.data.leverage).stringValue,
        //   );
        // }
      })
      .addCase(simulateAdjustMargin.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        _.set(state.chainAdjustMarginSimulation, [chainId], payload);
      })
      .addCase(setIsTurnOnCrossMarket, (state, { payload }) => {
        _.set(state.chainLimitFormState, [payload.chainId, 'isTurnOnCrossMarket'], payload.isTurnOnCrossMarket);
      })
      // cross market order
      .addCase(simulateCrossMarketOrder.fulfilled, (state, { meta, payload }) => {
        if (meta.arg.onlyCallFuncMode) {
          return;
        }
        const { chainId } = meta.arg;

        _.set(state.chainCrossMarketSimulation, [chainId], payload);
      })
      .addCase(placeCrossMarketOrder.pending, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainLimitFormStatus, [chainId], FETCHING_STATUS.FETCHING);
      })
      .addCase(placeCrossMarketOrder.fulfilled, (state, { meta, payload }) => {
        const { chainId } = meta.arg;
        if (payload) {
          const oldState = _.get(state.chainLimitFormState, [chainId]);
          _.set(state.chainLimitFormState, [chainId], { ...oldState, baseAmount: '', quoteAmount: '' });
        }
        _.set(state.chainLimitFormStatus, [chainId], FETCHING_STATUS.DONE);
        _.set(state.chainCrossMarketSimulation, [chainId], getDefaultSimulation(chainId));
      })
      .addCase(placeCrossMarketOrder.rejected, (state, { meta }) => {
        const { chainId } = meta.arg;
        _.set(state.chainLimitFormStatus, [chainId], FETCHING_STATUS.DONE);
      });
  },
});
export const { setIsHistoryPortfolioTab, setTradePortfolioTab } = tradeSlice.actions;

export const selectScaleFormStateByChainId =
  (chainId: number | undefined) =>
  (state: AppState): IScaleFormState =>
    _.get(state.trade.chainScaleFormState, [chainId || '']);

export const selectScaleFormStatusByChainId =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.trade.chainScaleFormStatus, [chainId || ''], FETCHING_STATUS.DONE);

export const selectScaleSimulationByChainId =
  (chainId: number | undefined) =>
  (state: AppState): IScaledOrderSimulation | undefined =>
    _.get(state.trade.chainScaleSimulation, [chainId || '']);

export const selectMarketFormStateByChainId =
  (chainId: number | undefined) =>
  (state: AppState): IMarketFormState =>
    _.get(state.trade.chainMarketFormState, [chainId || '']);

export const selectMarketFormStatusByChainId =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.trade.chainMarketFormStatus, [chainId || ''], FETCHING_STATUS.DONE);

export const selectAdjustMarginFormState =
  (chainId: number | undefined) =>
  (state: AppState): IAdjustMarginFormState =>
    _.get(state.trade.chainAdjustMarginFormState, [chainId || '']);

export const selectAdjustMarginSimulation =
  (chainId: number | undefined) =>
  (state: AppState): IAdjustMarginSimulation | undefined =>
    _.get(state.trade.chainAdjustMarginSimulation, [chainId || '']);

export const selectAdjustMarginFormStatus =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.trade.chainAdjustMarginFormStatus, [chainId || ''], FETCHING_STATUS.DONE);

export const selectClosePositionFormState =
  (chainId: number | undefined) =>
  (state: AppState): IClosePositionFormState =>
    _.get(state.trade.chainClosePositionFormState, [chainId || '']);

export const selectCloseFormStatus =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.trade.chainClosePositionFormStatus, [chainId || ''], FETCHING_STATUS.DONE);

export const selectCloseSimulation =
  (chainId: number | undefined) =>
  (state: AppState): ISimulation =>
    _.get(state.trade.chainCloseSimulation, [chainId || '']);
export const selectCloseSimulationStatus =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.trade.chainCloseSimulationStatus, [chainId || ''], FETCHING_STATUS.INIT);

export const selectLimitFormState =
  (chainId: number | undefined) =>
  (state: AppState): ILimitFormState =>
    _.get(state.trade.chainLimitFormState, [chainId || '']);
export const selectLimitFormStatus =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.trade.chainLimitFormStatus, [chainId || ''], FETCHING_STATUS.DONE);
export const selectLimitSimulation =
  (chainId: number | undefined) =>
  (state: AppState): IOrderSimulation | undefined =>
    _.get(state.trade.chainLimitSimulation, [chainId || '']);
export const selectMarketSimulation =
  (chainId: number | undefined) =>
  (state: AppState): ISimulation | undefined =>
    _.get(state.trade.chainMarketSimulation, [chainId || '']);

export const selectCancelFormState =
  (chainId: number | undefined) =>
  (state: AppState): ICancelFormState =>
    _.get(state.trade.chainCancelFormState, [chainId || '']);

export const selectPnlShare =
  (chainId: number | undefined) =>
  (state: AppState): IPnlParams | undefined =>
    _.get(state.trade.chainPnlShare, [chainId || '']);

export const selectCancelFormStatus =
  (chainId: number | undefined) =>
  (state: AppState): IOrderCancelStatus | undefined =>
    _.get(state.trade.chainCancelOrderFormStatus, [chainId || '']);
export const selectBulkCancelStatus =
  (chainId: number | undefined) =>
  (state: AppState): boolean | undefined =>
    _.get(state.trade.chainCancelOrderBulkStatus, [chainId || '']);

export const selectTradeTypeByChainId =
  (chainId: number | undefined) =>
  (state: AppState): TRADE_TYPE =>
    _.get(state.trade.chainFormType, [chainId || '']);
export const selectTradeDrawerTypeByChainId =
  (chainId: number | undefined) =>
  (state: AppState): TRADE_TYPE =>
    _.get(state.trade.chainDrawerType, [chainId || '']);
export const selectCurrentFutures =
  (chainId: number | undefined) =>
  (state: AppState): InstrumentInfo =>
    _.get(state.trade.chainCurrentFutures, [chainId || '']);
export const selectCurrentPair =
  (chainId: number | undefined) =>
  (state: AppState): WrappedPair =>
    _.get(state.trade.chainCurrentPair, [chainId || '']);

export const selectTradeFormLeverageByChainIdAndFormType =
  (chainId: number | undefined, formType: TRADE_TYPE) =>
  (state: AppState): string =>
    _.get(
      formType === TRADE_TYPE.MARKET
        ? state.trade.chainMarketFormState
        : formType === TRADE_TYPE.ADJUST_MARGIN
        ? state.trade.chainAdjustMarginFormState
        : state.trade.chainLimitFormState,
      [chainId || '', 'leverage'],
      TRADE_LEVERAGE_THRESHOLDS.DEFAULT.toString(),
    );

export const selectTradePortfolioTab = (state: AppState): TABLE_TYPES => state.trade.tradePortfolioTab;

export const selectIsChosenOrder = (state: AppState): boolean => state.trade.isChosenOrder;

export const selectChartDurationByChainId =
  (chainId: number | undefined) =>
  (state: AppState): KlineInterval | undefined =>
    _.get(state.trade.chainChartDuration, [chainId || '']);

export const selectFundingChartDurationByChainId =
  (chainId: number | undefined) =>
  (state: AppState): FundingChartInterval | undefined =>
    _.get(state.trade.fundingChartDuration, [chainId || '']);

export const selectStepRatioByChainId =
  (chainId: number | undefined) =>
  (state: AppState): number =>
    _.get(state.trade.chainStepRatio, [chainId || ''], DEFAULT_STEP_RATIO);
export const selectPairLeverageSwitchChecked =
  (chainId: number | undefined, userAddr: string | undefined, pairId: string | undefined) =>
  (state: AppState): boolean =>
    _.get(state.trade.chainLeverageSwitchChecked, [chainId || '', userAddr || '', pairId || ''], false);

export const selectCrossMarketSimulation =
  (chainId: number | undefined) =>
  (state: AppState): ICrossMarketOrderSimulation | undefined =>
    _.get(state.trade.chainCrossMarketSimulation, [chainId || '']);

export default tradeSlice.reducer;

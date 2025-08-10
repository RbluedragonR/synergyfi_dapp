import { CHAIN_ID } from '@derivation-tech/context';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { TickMath } from '@synfutures/sdks-perp';
import { BigNumber, ContractReceipt } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import _ from 'lodash';

import { OPERATION_TX_TYPE } from '@/constants';
import { DEFAULT_ALPHA, EARN_TYPE } from '@/constants/earn';
import { EVENT_NAMES } from '@/constants/event';
import { TABLE_TYPES } from '@/constants/global';
import { ERROR_MSG_EXCEED_WALLET_BALANCE, ERROR_MSG_RANGE_OCCUPIED } from '@/constants/simulation';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { WrappedRange } from '@/entities/WrappedRange';
import {
  IAddLiquidityFormState,
  IAddLiquiditySimulation,
  IRemoveLiquiditySimulation,
  IRemoveLiquiditySimulationData,
} from '@/types/earn';
import { ILiquidityFilters } from '@/types/liquidity';
import { CreativePair } from '@/types/pair';
import { parsedEthersError } from '@/utils/error';
import { parseSendingTxMessageMapping } from '@/utils/notification';
import { addedDeadline } from '@/utils/trade';
import { getEventLogs } from '@/utils/tx';

import { QUERY_KEYS } from '@/constants/query';
import SentryService from '@/entities/SentryService';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { queryClient } from '@/pages/App';
import { IMetaRange } from '@/types/account';
import { IGateBalanceInfo } from '@/types/balance';
import { TokenInfo } from '@/types/token';
import { toWad } from '@/utils/numberUtil';
import { calcMarginToDeposit } from '@/utils/position';
import { Context } from '@derivation-tech/context';
import { utils } from '@synfutures/sdks-perp';
import { getPortfolioFromChain } from '../account/actions';
import { fetchGateBalanceAction, fetchTokenBalanceAction } from '../balance/actions';
import { useGlobalStore } from '../global/stores';
import { PollingHistoryId } from '../global/type';
import { AppState } from '../store';
import { sendTransaction } from '../transaction/actions';
import { checkTokenAllowance } from '../user/actions';

export const resetLiquidityFormByChainId = createAction<{ chainId: number }>('earn/resetLiquidityFormByChainId');
export const setEarnFormType = createAction<{ chainId: number; formType: EARN_TYPE }>('earn/setEarnFormType');
export const setAddLiqFormState = createAction<IAddLiquidityFormState>('earn/setAddLiqFormState');
export const setEarnPortfolioTab = createAction<TABLE_TYPES>('earn/setEarnPortfolioTab');
export const setIsAddLiquidityInputRisky = createAction<boolean>('earn/setIsAddLiquidityInputRisky');
export const setCurrentRange = createAction<{
  chainId: number;
  rangeId: string;
}>('earn/setCurrentRange');
export const setPoolFilters = createAction<ILiquidityFilters>('earn/setLiquidityFilters');

export const addLiquiditySimulate = createAsyncThunk(
  'earn/addLiquiditySimulate',
  async (
    {
      chainId,
      sdkContext,
      pair,
      margin,
      slippage,
      alpha,
      userAddr,
    }: // customStableInstruments,
    {
      chainId: number;
      pair: WrappedPair | CreativePair;
      sdkContext: Context | undefined;
      margin?: WrappedBigNumber;
      alpha?: BigNumber;
      slippage: number;
      userAddr?: string;
      customStableInstruments: string[] | undefined;
    },
    { getState },
  ): Promise<IAddLiquiditySimulation | undefined> => {
    try {
      if (sdkContext && pair && margin) {
        //      expiry: number;
        // instrument: Instrument | InstrumentIdentifier;
        // alphaWad: BigNumber;
        // margin: BigNumber;
        // slippage: number;
        // currentSqrtPX96?: BigNumber;
        const isLivePair = pair instanceof WrappedPair;
        console.record('syn', `addLiquiditySimulate params:`, {
          instrument: isLivePair
            ? pair.rootInstrument
            : {
                marketType: pair.rootInstrument.marketType,
                baseSymbol: utils.isCexMarket(pair.rootInstrument.marketType)
                  ? pair.rootInstrument.baseToken.symbol
                  : pair.rootInstrument.baseToken,
                quoteSymbol: pair.rootInstrument.quoteToken,
              },
          expiry: pair.expiry,
          alphaWad: alpha,
          margin: margin.wadValue,
          slippage,
        });

        const simulation = await sdkContext.perp.simulate.simulateAddLiquidity({
          instrument: isLivePair
            ? pair.rootInstrument
            : {
                marketType: pair.rootInstrument.marketType,
                baseSymbol: utils.isCexMarket(pair.rootInstrument.marketType)
                  ? pair.rootInstrument.baseToken.symbol
                  : pair.rootInstrument.baseToken,
                quoteSymbol: pair.rootInstrument.quoteToken,
              },
          expiry: pair.expiry,
          alphaWad: alpha || toWad(DEFAULT_ALPHA),
          margin: margin.wadValue,
          slippage,
        });
        const {
          account: { chainMetaRange },
        } = getState() as AppState;
        const rangeList: IMetaRange[] = _.values(
          _.pickBy(
            _.get(chainMetaRange, [chainId || '', userAddr || '', 'list']),
            (metaOrder) => metaOrder.pairId === pair.id,
          ),
        );
        if (rangeList?.length && simulation) {
          const upperTick = TickMath.getTickAtPWad(simulation.upperPrice);
          const lowerTick = TickMath.getTickAtPWad(simulation.lowerPrice);
          const placedRange = rangeList.find((range) => {
            range.tickUpper === upperTick && range.tickLower === lowerTick;
          });

          if (placedRange) {
            return {
              chainId,
              message: ERROR_MSG_RANGE_OCCUPIED.errorMsg,
              errorData: ERROR_MSG_RANGE_OCCUPIED.errorData,
            };
          }
        }

        // const lowerLiqPrice = calcPositionLiquidationPrice(
        //   pair,
        //   simulation.lowerPosition,
        //   isLivePair ? pair.rootInstrument.maintenanceMarginRatio : undefined,
        // );

        const gateBalanceList = queryClient.getQueryData<IGateBalanceInfo[] | null>(
          QUERY_KEYS.BALANCE.GATE(chainId, userAddr),
        );
        const gateBalanceInfo = (gateBalanceList || [])?.find(
          (balance) => balance.address === pair.rootInstrument.quoteToken.address,
        );

        const marginToDeposit = calcMarginToDeposit(margin, gateBalanceInfo?.balance || 0);

        const lowerLiqPrice = isLivePair
          ? WrappedBigNumber.from(
              utils.positionLiquidationPrice(
                simulation.lowerPosition,
                pair,
                pair.rootInstrument.maintenanceMarginRatio,
              ),
            )
          : WrappedBigNumber.from(utils.positionLiquidationPrice(simulation.lowerPosition));

        const upperLiqPrice = isLivePair
          ? WrappedBigNumber.from(
              utils.positionLiquidationPrice(
                simulation.upperPosition,
                pair,
                pair.rootInstrument.maintenanceMarginRatio,
              ),
            )
          : WrappedBigNumber.from(utils.positionLiquidationPrice(simulation.upperPosition));

        const simulateResult: IAddLiquiditySimulation = {
          chainId,
          data: {
            ...simulation,
            // upperPrice: WrappedBigNumber.from(simulation.upperPrice),
            // lowerPrice: WrappedBigNumber.from(simulation.lowerPrice),
            // lowerLeverage: WrappedBigNumber.from(simulation.lowerLeverage),
            // upperLeverage: WrappedBigNumber.from(simulation.upperLeverage),
            // sqrtStrikeLowerPX96: WrappedBigNumber.from(simulation.sqrtStrikeLowerPX96),
            // sqrtStrikeUpperPX96: WrappedBigNumber.from(simulation.sqrtStrikeUpperPX96),
            // minMargin: WrappedBigNumber.from(simulation.minMargin),
            margin: margin,
            marginToDeposit: marginToDeposit,
            lowerLiqPrice: lowerLiqPrice,
            upperLiqPrice: upperLiqPrice,
            equivalentAlphaLower: WrappedBigNumber.from(simulation.equivalentAlpha).toNumber(),
            equivalentAlphaUpper: WrappedBigNumber.from(simulation.equivalentAlpha).toNumber(),
            tickDeltaLower: simulation.tickDelta,
            tickDeltaUpper: simulation.tickDelta,
            // liquidity: WrappedBigNumber.from(simulation.liquidity),
            // minEffectiveQuoteAmount: WrappedBigNumber.from(simulation.minEffectiveQuoteAmount),
          },
        };
        if (pair.rootInstrument.isInverse && simulateResult?.data) {
          // simulateResult.data.upperPrice = toReciprocalNumber(simulation.lowerPrice);
          // simulateResult.data.lowerPrice = toReciprocalNumber(simulation.upperPrice);
          // simulateResult.data.lowerLiqPrice = toReciprocalNumber(upperLiqPrice);
          // simulateResult.data.upperLiqPrice = toReciprocalNumber(lowerLiqPrice);
          // const upperPosition = simulation.lowerPosition;
          // simulateResult.data.lowerPosition = simulation.upperPosition;
          // simulateResult.data.upperPosition = upperPosition;
          // const upperLeverage = simulateResult.data.lowerLeverage;
          // simulateResult.data.lowerLeverage = simulateResult.data.upperLeverage;
          // simulateResult.data.upperLeverage = upperLeverage;
        }

        // check if the margin is not enough
        if (userAddr && simulateResult.data?.marginToDeposit?.gt(0)) {
          const {
            balance: { chainBalanceMap },
          } = getState() as AppState;
          const rootInstrument = pair.rootInstrument;
          const balance = _.get(chainBalanceMap, [chainId, userAddr, rootInstrument.quoteToken.address]);
          if (balance) {
            if (simulateResult.data.marginToDeposit.gt(balance.balance)) {
              simulateResult.message = ERROR_MSG_EXCEED_WALLET_BALANCE.errorMsg;
              simulateResult.errorData = ERROR_MSG_EXCEED_WALLET_BALANCE.errorData;
            }
          }
        }

        // dispatch(
        //   simulatePointsByAddLiquidity({
        //     userAddr,
        //     chainId,
        //     quote: pair.rootInstrument.quoteToken,
        //     pair,
        //     alphaWad: simulation.equivalentAlpha,
        //     liquidity: WrappedBigNumber.from(simulateResult.data?.liquidity || 0),
        //     margin,
        //     sdk: sdkContext,
        //     customStableInstruments,
        //   }),
        // );

        return simulateResult;
      }
      return { chainId };
    } catch (error) {
      SentryService.captureException(
        error,
        {
          name: 'earn/addLiquiditySimulate',
          chainId,
          pair: pair?.symbol,
          margin: margin?.stringValue,
          slippage,
          alpha: alpha?._hex,
          userAddr,
        },
        'info',
      );
      console.log('addLiquiditySimulate error', error);
      const parsedError = parsedEthersError(error);
      const errorMsg = parsedError?.errorMsg || _.get(error, ['message']);
      return { chainId, message: errorMsg };
    }
  },
);
export const addLiquidityAsymmetricSimulate = createAsyncThunk(
  'earn/addLiquidityAsymmetricSimulate',
  async (
    {
      chainId,
      sdkContext,
      pair,
      margin,
      slippage,
      alphaWadLower,
      alphaWadUpper,
      userAddr,
    }: // customStableInstruments,
    {
      chainId: number;
      pair: WrappedPair | CreativePair;
      sdkContext: Context | undefined;
      margin?: WrappedBigNumber;
      alphaWadLower: BigNumber;
      alphaWadUpper: BigNumber;
      slippage: number;
      userAddr?: string;
      customStableInstruments: string[] | undefined;
    },
    { getState },
  ): Promise<IAddLiquiditySimulation | undefined> => {
    try {
      if (sdkContext && pair && margin) {
        const isLivePair = pair instanceof WrappedPair;
        const simulation = await sdkContext.perp.simulate.simulateAddLiquidityWithAsymmetricRange({
          instrument: isLivePair
            ? pair.rootInstrument
            : {
                marketType: pair.rootInstrument.marketType,
                baseSymbol: utils.isCexMarket(pair.rootInstrument.marketType)
                  ? pair.rootInstrument.baseToken.symbol
                  : pair.rootInstrument.baseToken,
                quoteSymbol: pair.rootInstrument.quoteToken,
              },
          expiry: pair.expiry,
          alphaWadLower,
          alphaWadUpper,
          margin: margin.wadValue,
          slippage,
        });
        const {
          account: { chainMetaRange },
        } = getState() as AppState;
        const rangeList: IMetaRange[] = _.values(
          _.pickBy(
            _.get(chainMetaRange, [chainId || '', userAddr || '', 'list']),
            (metaOrder) => metaOrder.pairId === pair.id,
          ),
        );
        if (rangeList?.length && simulation) {
          const upperTick = TickMath.getTickAtPWad(simulation.upperPrice);
          const lowerTick = TickMath.getTickAtPWad(simulation.lowerPrice);
          const placedRange = rangeList.find((range) => {
            range.tickUpper === upperTick && range.tickLower === lowerTick;
          });

          if (placedRange) {
            return {
              chainId,
              message: ERROR_MSG_RANGE_OCCUPIED.errorMsg,
              errorData: ERROR_MSG_RANGE_OCCUPIED.errorData,
            };
          }
        }

        const gateBalanceList = queryClient.getQueryData<IGateBalanceInfo[] | null>(
          QUERY_KEYS.BALANCE.GATE(chainId, userAddr),
        );
        const gateBalanceInfo = (gateBalanceList || [])?.find(
          (balance) => balance.address === pair.rootInstrument.quoteToken.address,
        );

        const marginToDeposit = calcMarginToDeposit(margin, gateBalanceInfo?.balance || 0);

        const lowerLiqPrice = WrappedBigNumber.from(
          utils.positionLiquidationPrice(
            simulation.lowerPosition,
            isLivePair ? pair : undefined,
            isLivePair ? pair.rootInstrument.maintenanceMarginRatio : undefined,
          ),
        );
        const upperLiqPrice = WrappedBigNumber.from(
          utils.positionLiquidationPrice(
            simulation.upperPosition,
            isLivePair ? pair : undefined,
            isLivePair ? pair.rootInstrument.maintenanceMarginRatio : undefined,
          ),
        );

        const simulateResult: IAddLiquiditySimulation = {
          chainId,
          data: {
            ...simulation,
            margin: margin,
            marginToDeposit: marginToDeposit,
            lowerLiqPrice: lowerLiqPrice,
            upperLiqPrice: upperLiqPrice,
            equivalentAlphaLower: WrappedBigNumber.from(simulation.equivalentAlphaLower).toNumber(),
            equivalentAlphaUpper: WrappedBigNumber.from(simulation.equivalentAlphaUpper).toNumber(),
            equivalentAlpha: simulation.equivalentAlphaLower.gt(simulation.equivalentAlphaUpper)
              ? simulation.equivalentAlphaUpper
              : simulation.equivalentAlphaLower,
            tickDelta: simulation.tickDeltaLower,
          },
        };
        if (pair.rootInstrument.isInverse && simulateResult?.data) {
        }

        // check if the margin is not enough
        if (userAddr && simulateResult.data?.marginToDeposit?.gt(0)) {
          const {
            balance: { chainBalanceMap },
          } = getState() as AppState;
          const rootInstrument = pair.rootInstrument;
          const balance = _.get(chainBalanceMap, [chainId, userAddr, rootInstrument.quoteToken.address]);
          if (balance) {
            if (simulateResult.data.marginToDeposit.gt(balance.balance)) {
              simulateResult.message = ERROR_MSG_EXCEED_WALLET_BALANCE.errorMsg;
              simulateResult.errorData = ERROR_MSG_EXCEED_WALLET_BALANCE.errorData;
            }
          }
        }

        // simulateResult.data &&
        //   dispatch(
        //     simulatePointsByAddLiquidity({
        //       userAddr,
        //       chainId,
        //       quote: pair.rootInstrument.quoteToken,
        //       pair,
        //       alphaWad: simulateResult.data?.equivalentAlpha,
        //       liquidity: WrappedBigNumber.from(simulateResult.data?.liquidity || 0),
        //       margin,
        //       sdk: sdkContext,
        //       customStableInstruments,
        //     }),
        //   );

        return simulateResult;
      }
      return { chainId };
    } catch (error) {
      SentryService.captureException(
        error,
        {
          name: 'earn/addLiquidityAsymmetricSimulate',
          chainId,
          pair: pair?.symbol,
          margin: margin?.stringValue,
          slippage,
          alphaWadLower: alphaWadLower?._hex,
          alphaWadUpper: alphaWadUpper?._hex,
          userAddr,
        },
        'info',
      );
      console.log('addLiquiditySimulate error', error);
      const parsedError = parsedEthersError(error);
      const errorMsg = parsedError?.errorMsg || _.get(error, ['message']);
      return { chainId, message: errorMsg };
    }
  },
);

export const removeLiquiditySimulate = createAsyncThunk(
  'earn/removeLiquiditySimulate',
  async (
    {
      chainId,
      sdkContext,
      range,
      slippage,
      portfolio,
    }: {
      chainId: number;
      sdkContext: Context | undefined;
      range: WrappedRange;
      slippage: number;
      portfolio: WrappedPortfolio;
    },
    {},
  ): Promise<IRemoveLiquiditySimulation | undefined> => {
    try {
      if (sdkContext && portfolio && range) {
        const res = await sdkContext.perp.simulate.simulateRemoveLiquidity({
          tradeInfo: portfolio,
          tickUpper: range.tickUpper,
          tickLower: range.tickLower,
          slippage: slippage,
          instrument: range.rootInstrument,
        });
        const simulation: IRemoveLiquiditySimulationData = {
          ...res,
          simulatePositionRemoved: res.removedPosition,
          simulationMainPosition: new WrappedPosition(
            {
              ...res.postPosition,
              id: portfolio.id,
              instrumentId: portfolio.rootInstrument.id,
              pairId: portfolio.rootPair.id,
              accountId: portfolio.rootAccount.id,
              portfolioId: portfolio.id,
              blockInfo: portfolio.blockInfo,
              expiry: portfolio.expiry,
              traderAddr: portfolio.traderAddr,
              instrumentAddr: portfolio.rootInstrument.instrumentAddr,
            },
            portfolio,
          ),
        };
        // if no position, return margin to account balance
        if (simulation.simulationMainPosition.size.eq(0) && simulation.simulationMainPosition.balance.gt(0)) {
          simulation.margin = WrappedBigNumber.from(simulation.simulationMainPosition.balance).mul(-1);
        }
        return {
          chainId,
          data: simulation,
        };
      }
      return { chainId };
    } catch (error) {
      SentryService.captureException(error, {
        name: 'earn/removeLiquiditySimulate',
        chainId,
        range: range?.id,
        slippage,
      });
      console.log('🚀 removeLiquiditySimulate error', error);
      const parsedError = parsedEthersError(error);
      const errorMsg = parsedError?.errorMsg || _.get(error, ['message']);
      return { chainId, message: errorMsg, errorData: parsedError?.errorData };
    }
  },
);

export const addLiquidity = createAsyncThunk(
  'earn/addLiquidity',
  async (
    {
      signer,
      chainId,
      userAddr,
      sdk: sdk,
      margin,
      deadline,
      pair,
      provider,
    }: {
      chainId: number;
      userAddr: string;
      signer: JsonRpcSigner;
      sdk: Context;
      deadline: number;
      pair: WrappedPair | CreativePair;
      provider: JsonRpcProvider;
      margin: string;
    },
    { dispatch, getState },
  ): Promise<ContractReceipt | undefined> => {
    try {
      const {
        earn: { chainAddLiquiditySimulation },
      } = getState() as AppState;
      const simulation = _.get(chainAddLiquiditySimulation, [chainId]);

      const isLivePair = pair instanceof WrappedPair;
      const simulationData = simulation.data;
      // if no simulation, return
      if (!simulationData) {
        return;
      }
      const result = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record(
              'tx',
              `Try to send [${OPERATION_TX_TYPE.ADD_LIQUIDITY}] operation tx for pair [${pair.symbol}]`,
              undefined,
              {
                signer,
                expiry: pair.expiry,
                pair,
                margin: parseEther(margin),
                deadline: addedDeadline(deadline),
                simulation,
              },
            );
            // return await provider.getTransaction(`0x2f4e1c10e6f80dd57ec9f51a34c32963041ba7d9ba9e596db8347cb6fd160c33`);
            const {
              global: { onChainReferralCode },
            } = getState() as AppState;
            const referralCode = onChainReferralCode?.referralCode || '';
            console.record(
              'syn',
              `addLiquidity params:`,
              {
                instrumentAddr: isLivePair
                  ? pair.rootInstrument.instrumentAddr
                  : {
                      marketType: pair.rootInstrument.marketType,
                      baseSymbol: utils.isCexMarket(pair.rootInstrument.marketType)
                        ? pair.rootInstrument.baseToken.symbol
                        : pair.rootInstrument.baseToken,
                      quoteSymbol: pair.rootInstrument.quoteToken,
                    },
                expiry: pair.expiry,
                limitTicks: simulationData?.limitTicks,
                margin: toWad(margin),
                tickDeltaLower: simulationData?.tickDelta,
                tickDeltaUpper: simulationData?.tickDelta,
                deadline: addedDeadline(deadline),
                referralCode,
              },
              { from: userAddr },
            );
            const populatedTx = await sdk.perp.instrument.addLiquidity(
              {
                instrumentAddr: isLivePair
                  ? pair.rootInstrument.instrumentAddr
                  : {
                      marketType: pair.rootInstrument.marketType,
                      baseSymbol: utils.isCexMarket(pair.rootInstrument.marketType)
                        ? pair.rootInstrument.baseToken.symbol
                        : pair.rootInstrument.baseToken,
                      quoteSymbol: pair.rootInstrument.quoteToken,
                    },
                expiry: pair.expiry,
                limitTicks: simulationData?.limitTicks,
                margin: toWad(margin),
                tickDeltaLower: simulationData?.tickDeltaLower,
                tickDeltaUpper: simulationData?.tickDeltaUpper,
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
            type: OPERATION_TX_TYPE.ADD_LIQUIDITY,
            instrument: {
              baseSymbol: pair.rootInstrument.baseToken.symbol,
              quoteSymbol: pair.rootInstrument.quoteToken.symbol,
              isInverse: pair.rootInstrument.isInverse || false,
            },
            sendingTemplate: parseSendingTxMessageMapping[OPERATION_TX_TYPE.ADD_LIQUIDITY]!(
              pair.rootInstrument.quoteToken.symbol,
              margin,
              WrappedBigNumber.from(simulationData.upperPrice),
              WrappedBigNumber.from(simulationData.lowerPrice),
              pair.rootInstrument.isInverse,
            ),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      if (result?.status) {
        if (pair instanceof WrappedPair) {
          dispatch(
            getPortfolioFromChain({
              chainId,
              userAddr,
              blockNumber: result.blockNumber,
              instrumentAddr: pair.rootInstrument.instrumentAddr,
              expiry: pair.expiry,
            }),
          );
        } else {
          try {
            let instrumentAddr = '';
            // get instrument addr from event
            const eventLogs = await getEventLogs(OPERATION_TX_TYPE.CREATE, result);
            if (eventLogs && eventLogs.length) {
              const NewInstrumentLog = eventLogs.find((log) => log.name === EVENT_NAMES.NewInstrument);
              if (NewInstrumentLog && NewInstrumentLog.args?.instrument) {
                instrumentAddr = NewInstrumentLog.args?.instrument.toLowerCase();
              }
            }
            if (instrumentAddr) {
              dispatch(
                getPortfolioFromChain({
                  chainId,
                  userAddr,
                  blockNumber: result.blockNumber,
                  instrumentAddr: instrumentAddr,
                  expiry: pair.expiry,
                }),
              );
            }
          } catch (error) {
            console.log('🚀 ~ file: action.ts:302 ~ error:', error);
          }
        }
        // need update balance
        if (simulation?.data?.margin?.gt(0)) {
          if (simulation.data.marginToDeposit.gt(0)) {
            dispatch(
              checkTokenAllowance({
                userAddress: userAddr,
                chainId,
                marginToken: pair.rootInstrument.quoteToken,
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
          if (!simulation?.data.margin.eq(simulation.data?.marginToDeposit)) {
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
    } catch (error) {
      SentryService.captureException(
        error,
        {
          name: 'earn/addLiquidity',
          chainId,
          userAddr,
          margin,
          deadline,
          pair: pair?.symbol,
        },
        'info',
      );
      console.log('🚀 ~ file: action.ts:130 ~ e:', error);
      throw error;
    }
  },
);

export const removeLiquidity = createAsyncThunk(
  'earn/removeLiquidity',
  async (
    {
      signer,
      chainId,
      userAddr,
      sdkContext,
      deadline,
      pair,
      provider,
      range,
    }: {
      chainId: number;
      userAddr: string;
      signer: JsonRpcSigner;
      range: WrappedRange;
      sdkContext: Context;
      deadline: number;
      pair: WrappedPair;
      provider: JsonRpcProvider;
      isMobile?: boolean;
    },
    { dispatch, getState },
  ): Promise<ContractReceipt | undefined> => {
    try {
      const {
        earn: { chainRemoveLiquiditySimulation },
      } = getState() as AppState;
      const simulation = _.get(chainRemoveLiquiditySimulation, [chainId]);
      // if no simulation, return
      if (!simulation?.data) {
        return;
      }
      const simulationData = simulation.data;

      const result = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record(
              'tx',
              `Try to send [${OPERATION_TX_TYPE.REMOVE_LIQUIDITY}] operation tx for pair [${pair.symbol}]`,
              undefined,
              {
                signer,
                expiry: pair.expiry,
                pair,
                range,
                deadline: addedDeadline(deadline),
                simulation,
              },
            );

            const populatedTx = await sdkContext.perp.instrument.removeLiquidity(
              {
                instrumentAddr: pair.rootInstrument.instrumentAddr,
                expiry: pair.expiry,
                tickLower: range.tickLower,
                tickUpper: range.tickUpper,
                deadline: addedDeadline(deadline),
                limitTicks: simulationData.limitTicks,
                traderAddr: userAddr,
              },
              { from: userAddr },
            );
            return signer.sendTransaction(populatedTx);
          },

          chainId,
          userAddr,
          txParams: {
            type: OPERATION_TX_TYPE.REMOVE_LIQUIDITY,
            instrument: {
              baseSymbol: pair.rootInstrument.baseToken.symbol,
              quoteSymbol: pair.rootInstrument.quoteToken.symbol,
              isInverse: pair.rootInstrument.isInverse,
            },
            sendingTemplate: parseSendingTxMessageMapping[OPERATION_TX_TYPE.REMOVE_LIQUIDITY]!(
              pair.rootInstrument.quoteToken.symbol,
              utils.positionEquity(simulationData.simulationMainPosition, pair),
              WrappedBigNumber.from(range.upperPrice),
              WrappedBigNumber.from(range.lowerPrice),
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
          dispatch(
            fetchGateBalanceAction({
              chainId,
              userAddr,
              tokens: [pair.rootInstrument.quoteToken],
              block: result.blockNumber,
            }),
          );
        }
        if (range && range.rootPortfolio) {
          _.unset(range.rootPortfolio.rangeMap, [range.id]);
        }
      }
      if (result?.transactionHash) {
        const { setPollingHistoryTx } = useGlobalStore.getState();
        setPollingHistoryTx({
          userAddress: userAddr,
          chainId,
          pollingHistoryId: PollingHistoryId.liquidity,
          tx: result?.transactionHash,
        });
      }
      return result;
    } catch (error) {
      SentryService.captureException(error, {
        name: 'earn/removeLiquidity',
        chainId,
        userAddr,
        deadline,
        pair: pair?.toJSON(),
        range: range?.id,
      });
      console.log('🚀 ~ file: action.ts:130 ~ e:', error);
      throw error;
    }
  },
);

export const fetchEarnWhitelistConfig = createAsyncThunk(
  'earn/fetchWhitelistConfig',
  async (
    {
      userAddr,
      sdkContext,
      chainId,
      quote,
    }: { chainId: CHAIN_ID; userAddr: string; sdkContext: Context; quote: TokenInfo },
    { getState },
  ): Promise<{ allowUnauthorizedLPs: boolean | undefined; isInWhiteList: boolean }> => {
    try {
      const {
        earn: { chainAllowUnauthorizedLPs },
      } = getState() as AppState;
      const allowUnauthorizedLPsInState = _.get(chainAllowUnauthorizedLPs, [chainId, quote.address]);
      const res: { allowUnauthorizedLPs: boolean | undefined; isInWhiteList: boolean } = {
        allowUnauthorizedLPs: undefined,
        isInWhiteList: false,
      };
      if (allowUnauthorizedLPsInState === undefined) {
        const allowUnauthorizedLPs = await sdkContext.perp.config.openLp(quote.address);
        res.allowUnauthorizedLPs = allowUnauthorizedLPs;
      } else {
        res.allowUnauthorizedLPs = allowUnauthorizedLPsInState;
      }
      const isInWhiteList = await sdkContext.perp.config.inWhiteListLps(quote.address, [userAddr]);
      if (isInWhiteList.length > 0) {
        res.isInWhiteList = isInWhiteList[0];
      }
      console.record('other', 'Query user [isInLpWhitelist]', res, {
        userAddr,
        sdkContext,
      });
      return res;
    } catch (e) {
      console.error('🚀 ~ file: actions.ts:89 ~ e', e);
      throw e;
    }
  },
);

import { BlockInfo, CHAIN_ID } from '@derivation-tech/context';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Pending } from '@synfutures/sdks-perp';
import { BigNumber, ContractReceipt } from 'ethers';

import { GlobalModalType, OPERATION_TX_TYPE } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { TokenInfo } from '@/types/token';
import { parseSendingTxMessageMapping } from '@/utils/notification';
// import { toWad } from '@/utils/numberUtil';
import { fixBalanceNumberDecimalsTo18, isNativeTokenAddr } from '@/utils/token';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { QUOTE_HISTORY_PRICE_LIST_API, USER_VOLUME_API_PREFIX } from '@/constants/portfolio';
import SentryService from '@/entities/SentryService';
import { IAssetsBalance } from '@/types/assets';
import { IFundFlowMap, ITotalVolume, TQuoteHistoryPrices } from '@/types/portfolio';
import { axiosGet } from '@/utils/axios';
import { Context } from '@derivation-tech/context';
import { captureException } from '@sentry/react';
import _ from 'lodash';
import { getAllAccountsFromChain, getPortfolioFromChain } from '../account/actions';
import { fetchGateBalanceAction, fetchTokenBalanceAction } from '../balance/actions';
import { setOpenModal } from '../global/actions';
import { sendTransaction } from '../transaction/actions';
import { checkTokenAllowance } from '../user/actions';

export const setPortfolioAssetSelect = createAction<{ assetSelected: IAssetsBalance | null }>(
  'portfolio/setPortfolioAssetSelect',
);
export const clickOpenSettledPairModal = createAsyncThunk(
  'portfolio/clickOpenSettledPairModal',
  async (
    {
      portfolio,
    }: {
      chainId: CHAIN_ID;
      userAddr: string;
      portfolio: WrappedPortfolio;
    },
    { dispatch },
  ): Promise<WrappedPortfolio> => {
    dispatch(setOpenModal({ type: GlobalModalType.SETTLE }));
    return portfolio;
  },
);

export const settle = createAsyncThunk(
  'portfolio/settle',
  async (
    {
      chainId,
      portfolio,
      userAddr,
      signer,
      sdkContext,
      provider,
    }: {
      chainId: CHAIN_ID;
      userAddr: string;
      portfolio: WrappedPortfolio;
      sdkContext: Context;
      signer: JsonRpcSigner;
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
              `Try to send [${OPERATION_TX_TYPE.SETTLE}] operation tx for pair [${pair.symbol}]`,
              undefined,
              {
                signer,
                expiry: pair.expiry,
                pair: pair,
                instrument: pair.rootInstrument,
              },
            );
            // return await provider.getTransaction(`0xf3fe7c3513f12b731de791b2adc1cc24841a26a512d354612370e818dd742aa7`);
            const populatedTx = await sdkContext.perp.instrument.settle(
              {
                instrumentAddr: pair.rootInstrument.instrumentAddr,
                expiry: pair.expiry,
                target: userAddr,
              },
              { from: userAddr },
            );
            return signer.sendTransaction(populatedTx);
          },

          chainId,
          userAddr,
          txParams: {
            type: OPERATION_TX_TYPE.SETTLE,
            instrument: {
              baseSymbol: pair.rootInstrument.baseToken.symbol,
              quoteSymbol: pair.rootInstrument.quoteToken.symbol,
              isInverse: pair.rootInstrument.isInverse,
              quoteDecimal: pair.rootInstrument.quoteToken.decimals,
            },
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
          checkTokenAllowance({
            userAddress: userAddr,
            chainId,
            marginToken: pair.rootInstrument.quoteToken,
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
        dispatch(
          fetchGateBalanceAction({
            chainId,
            userAddr,
            tokens: [pair.rootInstrument.quoteToken],
            block: result.blockNumber,
          }),
        );
      }

      return result;
    } catch (error) {
      SentryService.captureException(error, {
        name: 'portfolio/settle',
        chainId,
        userAddr,
      });
      console.log('🚀 ~ portfolio settle error:', error);
      throw error;
    }
  },
);

export const setPortfolioDepositOrWithdrawOperateToken = createAction<{
  chainId: number;
  userAddr: string;
  tokenInfo: TokenInfo;
}>('portfolio/setPortfolioDepositOrWithdrawOperateToken');

export const claimWithdraw = createAsyncThunk(
  'portfolio/claimWithdraw',
  async (
    {
      chainId,
      userAddr,
      signer,
      sdkContext,
      provider,
      quote,
      amount,
      marginTokens,
    }: {
      chainId: CHAIN_ID;
      userAddr: string;
      sdkContext: Context;
      signer: JsonRpcSigner;
      provider: JsonRpcProvider;
      quote: WrappedQuote;
      amount: BigNumber;
      marginTokens: TokenInfo[] | undefined;
    },
    { dispatch },
  ): Promise<ContractReceipt | undefined> => {
    try {
      const txType = OPERATION_TX_TYPE.CLAIM_WITHDRAW;
      const receipt = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record('tx', `Try to send [${txType}] operation tx for quote [${quote.symbol}]`, undefined, {
              chainId,
              userAddr,
              signer,
              quote,
              amount: amount,
              quoteSymbol: quote.symbol,
              to: userAddr,
            });
            const populatedTx = await sdkContext.perp.gate.claimPendingWithdraw(quote.address, userAddr, {
              from: userAddr,
            });
            return signer.sendTransaction(populatedTx);
          },
          chainId,
          userAddr,
          txParams: {
            isDisableNotification: true,
            type: txType,
            instrument: {
              quoteSymbol: quote.symbol,
              baseSymbol: '',
              isInverse: false,
              quoteDecimal: quote.decimals,
            },
            sendingTemplate: parseSendingTxMessageMapping[txType]!(WrappedBigNumber.from(amount), quote.symbol),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      console.log('🚀 ~ sdk release result:', receipt);
      if (receipt?.status === 1) {
        const block = receipt.blockNumber;
        dispatch(
          getAllAccountsFromChain({
            chainId,
            userAddr,
            blockNumber: block,
            sdkContext,
            instruments: [],
            needFetchInstruments: true,
          }),
        );
        dispatch(fetchTokenBalanceAction({ chainId, userAddr: userAddr, token: quote, block }));
        dispatch(
          fetchGateBalanceAction({
            chainId,
            userAddr,
            tokens: [quote],
            block: block,
          }),
        );
        dispatch(getUserPendings({ chainId, sdkContext, userAddr, blockNumber: block, marginTokens }));
      }
      return receipt;
    } catch (e) {
      console.error('portfolio/claimWithdraw error', e);
      throw e;
    }
  },
);

export const getTokenPendingParams = createAsyncThunk(
  'portfolio/getTokenPendingParams',
  async ({
    sdkContext,
    blockNumber,
    marginTokens,
  }: {
    chainId: CHAIN_ID;
    sdkContext: Context;
    blockNumber?: number;
    marginTokens: TokenInfo[] | undefined;
  }): Promise<
    { pendingDuration: number; tokenWithThresholds: (TokenInfo & { threshold: BigNumber })[] } | undefined
  > => {
    try {
      if (!marginTokens || !marginTokens.length) return;

      const pendingParams: { pendingDuration: BigNumber; thresholds: BigNumber[] } =
        await sdkContext.perp.gate.getPendingParams(
          marginTokens.map((token) => token.address),
          { blockTag: blockNumber },
        );

      const tokenWithThresholds = marginTokens.map((token, index) => {
        return { ...token, threshold: fixBalanceNumberDecimalsTo18(pendingParams.thresholds[index], token.decimals) };
      });

      return { pendingDuration: pendingParams.pendingDuration.toNumber(), tokenWithThresholds };
    } catch (error) {
      SentryService.captureException(error, {
        name: 'portfolio/getTokenPendingParams',
        marginTokens: marginTokens?.map((token) => token?.address),
      });
      console.log('🚀 ~ portfolio settle error:', error);
      throw error;
    }
  },
);

export const getUserPendings = createAsyncThunk(
  'portfolio/getUserPendings',
  async ({
    userAddr,
    sdkContext,
    blockNumber,
    marginTokens,
  }: {
    chainId: CHAIN_ID;
    userAddr: string;
    sdkContext: Context;
    blockNumber?: number;
    marginTokens: TokenInfo[] | undefined;
  }): Promise<
    | { tokenWithPendings: (TokenInfo & { maxWithdrawable: BigNumber; pending: Pending })[]; blockInfo: BlockInfo }
    | undefined
  > => {
    try {
      if (!marginTokens || !marginTokens.length) return;

      const pendingParams: { pendings: { maxWithdrawable: BigNumber; pending: Pending }[]; blockInfo: BlockInfo } =
        await sdkContext?.perp?.observer.getUserPendings(
          marginTokens.map((token) => token.address),
          userAddr,
          { blockTag: blockNumber },
        );

      const tokenWithPendings = marginTokens.map((token, index) => {
        return {
          ...token,
          maxWithdrawable: fixBalanceNumberDecimalsTo18(pendingParams.pendings[index].maxWithdrawable, token.decimals),
          pending: {
            ...pendingParams.pendings[index].pending,
            amount: fixBalanceNumberDecimalsTo18(pendingParams.pendings[index].pending.amount, token.decimals),
            // timestamp: 1708497009,
            // amount: toWad(1000),
          },
        };
      });

      return { tokenWithPendings, blockInfo: pendingParams.blockInfo };
    } catch (error) {
      SentryService.captureException(error, {
        name: 'portfolio/getUserPendings',
        userAddr,
        marginTokens: marginTokens?.map((token) => token?.address),
      });
      console.log('🚀 ~ portfolio settle error:', error);
      throw error;
    }
  },
);
export const getFundFlows = createAsyncThunk(
  'portfolio/getFundFlows',
  async ({
    chainId,
    userAddr,
    sdkContext,
    quoteTokens,
    blockNumber,
  }: {
    chainId: CHAIN_ID;
    userAddr: string;
    sdkContext: Context;
    quoteTokens: TokenInfo[];
    blockNumber?: number;
  }): Promise<IFundFlowMap | undefined> => {
    try {
      const addresses = quoteTokens.map((q) => {
        const dappConfig = DAPP_CHAIN_CONFIGS[chainId];
        // get fund flows with weth
        const tokenCheck = isNativeTokenAddr(q.address) ? dappConfig.wrappedNativeToken : q;
        return tokenCheck?.address || q.address;
      });
      const flows = await sdkContext?.perp?.observer.getFundFlows(addresses, userAddr, { blockTag: blockNumber });
      if (flows) {
        const results = flows.fundFlows.map((f, i) => ({
          token: quoteTokens[i],
          totalIn: WrappedBigNumber.from(fixBalanceNumberDecimalsTo18(f.totalIn, quoteTokens[i].decimals)),
          totalOut: WrappedBigNumber.from(fixBalanceNumberDecimalsTo18(f.totalOut, quoteTokens[i].decimals)),
        }));
        return _.keyBy(results, 'token.address');
      }
      return undefined;
    } catch (error) {
      captureException(error);
      console.log('🚀 ~ total withdraw error:', error);
      throw error;
    }
  },
);
export const getTotalVolume = createAsyncThunk(
  'portfolio/getTotalVolume',
  async ({ userAddr, chainId }: { chainId: CHAIN_ID; userAddr: string }): Promise<ITotalVolume | undefined> => {
    try {
      const result = await axiosGet({
        url: USER_VOLUME_API_PREFIX,
        config: {
          params: { userAddress: userAddr, chainId },
        },
      });
      return result.data.data;
    } catch (error) {
      SentryService.captureException(error, {
        name: 'portfolio/getTotalVolume',
        userAddr,
        chainId,
      });
      console.log('🚀 ~ total volume error:', error);
      return undefined;
    }
  },
);

export const getQuoteHistoryPrices = createAsyncThunk(
  'portfolio/getQuoteHistoryPrices',
  async (): Promise<TQuoteHistoryPrices | undefined> => {
    try {
      const result = await axiosGet({
        url: QUOTE_HISTORY_PRICE_LIST_API,
      });
      console.log('getQuoteHistoryPrices', result);
      return result.data;
    } catch (error) {
      SentryService.captureException(error, {
        name: 'portfolio/getQuoteHistoryPrices',
      });
      console.log('🚀 ~ getQuoteHistoryPrices error:', error);
      return undefined;
    }
  },
);

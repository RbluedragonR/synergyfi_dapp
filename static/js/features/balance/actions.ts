import { CHAIN_ID } from '@derivation-tech/context';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { NATIVE_TOKEN_ADDRESS } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';
import _ from 'lodash';

import { BALANCE_TYPE, OPERATION_TX_TYPE, ZERO } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import {
  IGateAccountState,
  ITokenBalanceInfo,
  ITokenBalanceInfoMap,
  getDefaultTokenBalanceInfo,
} from '@/types/balance';
import { TokenInfo, TokenInfoMap } from '@/types/token';
import { BlockyResult, WorkerBalanceEventResult, WorkerEventNames, WorkerGateBalanceResult } from '@/types/worker';
import { parseSendingTxMessageMapping } from '@/utils/notification';
import { toWad } from '@/utils/numberUtil';
import { getERC2O, getSignerFromProvider } from '@/utils/signer';
import { fixBalanceNumberDecimalsTo18, isNativeTokenAddr } from '@/utils/token';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { QUERY_KEYS } from '@/constants/query';
import { queryClient } from '@/pages/App';
import { Context } from '@derivation-tech/context';
import { getUserPendings } from '../portfolio/actions';
import { AppState } from '../store';
import { sendTransaction } from '../transaction/actions';
import { checkTokenAllowance } from '../user/actions';

// import { setTradingRelatedPairsAndMap } from '@/state/pairs/actions';

export const resetChainDefaultBalanceMapAction = createAsyncThunk(
  'balance/resetChainDefaultBalanceMap',
  async (
    {
      chainId,
      traderAddress,
      quoteTokenInfoMap,
    }: {
      chainId: CHAIN_ID;
      traderAddress: string;
      quoteTokenInfoMap: TokenInfoMap;
    },
    { getState },
  ): Promise<{ balanceList: ITokenBalanceInfoMap }> => {
    const {
      balance: { chainBalanceMap },
    } = getState() as AppState;
    let balanceList: ITokenBalanceInfoMap = {};
    balanceList = _.reduce(
      quoteTokenInfoMap,
      (result, curr, key) => {
        result[key] = {
          ...getDefaultTokenBalanceInfo(chainId),
          ...curr,
          isLoading: true,
        };
        return result;
      },
      balanceList,
    );

    const balanceMapInState = _.get(chainBalanceMap, [chainId, traderAddress]);
    if (balanceMapInState) {
      balanceList = _.merge({}, balanceList, balanceMapInState);
    }

    // dispatch(
    //   fetchAllTokenBalance({
    //     chainId,
    //     traderAddress,
    //     currentWeb3,
    //     chainNativeToken,
    //   }),
    // );
    return { balanceList };
  },
);

export const fetchTokenBalanceAction = createAsyncThunk(
  'balance/fetchTokenBalance',
  async (
    {
      chainId,
      userAddr,
      token: token,
      block,
    }: {
      chainId: CHAIN_ID;
      userAddr: string;
      token: TokenInfo;
      block?: number;
    },
    { getState },
  ): Promise<
    | {
        block: number;
        balance: WrappedBigNumber;
      }
    | undefined
  > => {
    if (!token || token.chainId !== chainId || !token.address) {
      return;
    }

    const {
      balance: { chainBalanceMap },
      web3: { chainAppProvider },
    } = getState() as AppState;

    const signer = getSignerFromProvider(chainAppProvider[chainId], userAddr);

    const chainConfig = DAPP_CHAIN_CONFIGS[chainId];
    if (!chainConfig) {
      return;
    }

    const blockNumber = block || 0;

    const chainNativeToken = chainConfig.nativeToken;
    let walletBalance: BigNumber = ZERO;

    if (token.address === chainNativeToken?.address) {
      const balanceInState = _.get(chainBalanceMap, [chainId, userAddr, token.address]);

      walletBalance = await signer.getBalance(blockNumber || undefined);
      if (balanceInState.balance.eq(WrappedBigNumber.from(walletBalance))) {
        throw 'no change';
      }
    } else {
      // [walletBalance, err] = await currentWeb3.account.getMarginTokenBalance(balanceInfo.address, traderAddress);
      const erc20 = await getERC2O(token.address, signer);
      walletBalance = await erc20.balanceOf(userAddr);
    }

    if (walletBalance) {
      walletBalance = fixBalanceNumberDecimalsTo18(walletBalance, token.decimals);
      return {
        block: blockNumber,
        balance: WrappedBigNumber.from(walletBalance),
      };
    }
    return undefined;
  },
);

export const fetchAllTokenBalanceAction = createAsyncThunk(
  'balance/fetchAllTokenBalance',
  async ({
    chainId,
    userAddr,
    marginTokenMap,
  }: {
    chainId: CHAIN_ID;
    userAddr: string;
    marginTokenMap: TokenInfoMap;
  }): Promise<
    | {
        token: ITokenBalanceInfo;
        balance: WrappedBigNumber;
        block: number;
      }[]
    | undefined
  > => {
    const tokens = Object.values(marginTokenMap);
    const chainConfig = DAPP_CHAIN_CONFIGS[chainId];
    const nativeToken = chainConfig?.nativeToken;
    if (nativeToken && tokens.findIndex((token) => token.address === nativeToken.address) === -1) {
      tokens.push(nativeToken);
    }

    window.userWorker.postMessage({
      eventName: WorkerEventNames.MulticallBalance,
      data: {
        chainId,
        userAddr,
        tokens,
      },
    });
    return;

    // const userWorker = await UserWorker.getInstance(chainId);
    // const result = await retryWhenTimeout(userWorker.multicallBalance({ chainId, userAddr, tokens }));

    // if (result) {
    //   const balances = result.data;
    //   const callResult = balances.map((balanceInfo) => {
    //     return {
    //       token: balanceInfo.token as unknown as ITokenBalanceInfo,
    //       balance: WrappedBigNumber.from(
    //         fixBalanceNumberDecimalsTo18(BigNumber.from(balanceInfo.balance), balanceInfo.token.decimals),
    //       ),
    //       block: result.block,
    //     };
    //   });
    //   return callResult;
    // }
  },
);

export const changeTokenBalanceAction = createAsyncThunk(
  'balance/changeTokenBalanceAction',
  async ({
    token: token,
    block,
    balanceInfo,
  }: WorkerBalanceEventResult): Promise<
    | {
        block: number;
        balance: WrappedBigNumber;
      }
    | undefined
  > => {
    if (!token || !token.address) {
      return;
    }

    let walletBalance: BigNumber = BigNumber.from(balanceInfo.balance) || ZERO;

    if (walletBalance) {
      walletBalance = fixBalanceNumberDecimalsTo18(walletBalance, token.decimals);
      return {
        block: block,
        balance: WrappedBigNumber.from(walletBalance),
      };
    }
    return undefined;
  },
);

export const fetchGateBalanceAction = createAsyncThunk(
  'balance/fetchGateBalanceAction',
  async ({
    chainId,
    userAddr,
  }: {
    chainId: CHAIN_ID;
    userAddr: string;
    tokens: TokenInfo[];
    block?: number;
  }): Promise<
    | BlockyResult<
        {
          token: TokenInfo;
          balance: BigNumber;
          block: number;
        }[]
      >
    | undefined
  > => {
    try {
      // only call worker when in browser
      // window.synWorker.postMessage({
      //   eventName: WorkerEventNames.FetchGateBalance,
      //   data: {
      //     chainId,
      //     userAddr,
      //     tokens,
      //     blockNumber: block,
      //   },
      // });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BALANCE.GATE(chainId, userAddr),
      });
      return undefined;
    } catch (e) {
      console.log('🚀 ~ file: actions.ts:284 ~ e:', e);
      return undefined;
    }
  },
);

export const changeTokenGateBalanceAction = createAsyncThunk(
  'balance/changeTokenGateBalanceAction',
  async ({
    token: token,
    block,
    gateBalance,
  }: WorkerGateBalanceResult): Promise<
    | {
        block: number;
        balance: WrappedBigNumber;
      }
    | undefined
  > => {
    if (!token || !token.address) {
      return;
    }

    let balance: BigNumber = BigNumber.from(gateBalance) || ZERO;
    if (balance) {
      balance = fixBalanceNumberDecimalsTo18(balance, token.decimals);
      return {
        block: block,
        balance: WrappedBigNumber.from(balance),
      };
    }
    return undefined;
  },
);

export const depositOrWithdrawBalance = createAsyncThunk(
  'balance/depositOrWithdrawBalance',
  async (
    {
      signer,
      provider,
      quote,
      amount,
      chainId,
      account: userAddr,
      sdkContext,
      balanceType,
      isDisableNotification,
      marginTokens,
    }: {
      signer: JsonRpcSigner;
      provider?: JsonRpcProvider;
      quote: TokenInfo;
      account: string;
      amount: string | number | BigNumber;
      chainId: CHAIN_ID;
      sdkContext: Context;
      balanceType: BALANCE_TYPE;
      isDisableNotification?: boolean;
      marginTokens: TokenInfo[] | undefined;
    },
    { dispatch },
  ) => {
    try {
      const chainConfig = DAPP_CHAIN_CONFIGS[chainId];
      const txType = balanceType === BALANCE_TYPE.DEPOSIT ? OPERATION_TX_TYPE.DEPOSIT : OPERATION_TX_TYPE.WITHDRAW;
      const isNativeToken = isNativeTokenAddr(quote.address);
      const receipt = await dispatch(
        sendTransaction({
          signer,
          sendFunc: async () => {
            console.record('tx', `Try to send [${txType}] operation tx for quote [${quote.symbol}]`, undefined, {
              chainId,
              userAddr,
              signer,
              quote,
              amount: toWad(amount),
              quoteSymbol: quote.symbol,
              to: userAddr,
              balanceType,
              isNative: isNativeToken,
              nativeTokenAddr: NATIVE_TOKEN_ADDRESS,
            });
            console.log(`Try to send [${txType}] operation tx for quote [${quote.symbol}]`, {
              balanceType,
              userAddr,
              chainId,
              quote,
              quoteAddr: isNativeToken ? NATIVE_TOKEN_ADDRESS : quote.address,
              amount: toWad(amount),
            });

            const populatedTx = await (balanceType === BALANCE_TYPE.DEPOSIT
              ? sdkContext.perp.gate.depositWad(isNativeToken ? NATIVE_TOKEN_ADDRESS : quote.address, toWad(amount), {
                  from: userAddr,
                })
              : sdkContext.perp.gate.withdrawWad(isNativeToken ? NATIVE_TOKEN_ADDRESS : quote.address, toWad(amount), {
                  from: userAddr,
                }));

            return signer.sendTransaction(populatedTx);
          },
          chainId,
          userAddr,
          txParams: {
            isDisableNotification,
            type: txType,
            instrument: {
              quoteSymbol: quote.symbol,
              baseSymbol: '',
              isInverse: false,
              quoteDecimal: quote.decimals,
            },
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            sendingTemplate: parseSendingTxMessageMapping[txType]!(WrappedBigNumber.from(amount), quote.symbol),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      if (receipt?.status === 1) {
        const block = receipt.blockNumber;
        if (balanceType === BALANCE_TYPE.DEPOSIT) {
          dispatch(
            checkTokenAllowance({
              userAddress: userAddr,
              chainId,
              marginToken: quote,
              sdk: sdkContext,
            }),
          );
        }

        dispatch(fetchTokenBalanceAction({ chainId, userAddr: userAddr, token: quote, block }));
        chainConfig.wrappedNativeToken &&
          dispatch(
            fetchGateBalanceAction({
              chainId,
              userAddr,
              tokens: isNativeToken ? [chainConfig.wrappedNativeToken] : [quote],
              block: block,
            }),
          );
        dispatch(
          getUserPendings({
            chainId,
            userAddr,
            blockNumber: block,
            sdkContext,
            marginTokens,
          }),
        );
      }
      return receipt;
    } catch (e) {
      console.error('balance depositOrWithdrawBalance error', e);
      throw e;
    }
  },
);

export const setGateAccountState = createAction<Partial<IGateAccountState> & { chainId: number }>(
  'balance/setGateAccountState',
);

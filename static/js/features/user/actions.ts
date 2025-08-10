import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ZERO } from '@synfutures/sdks-perp';
import { BigNumber, ContractReceipt } from 'ethers';
import _ from 'lodash';

import { OPERATION_TX_TYPE, TRADE_FORM_TYPE } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { TokenInfo } from '@/types/token';
import { ITokenAllowanceInfo } from '@/types/user';
import { formatEther } from '@/utils/numberUtil';
import { getERC2O } from '@/utils/signer';
import { adjustBalanceNumberToTokenDecimals, fixBalanceNumberDecimalsTo18, isNativeTokenAddr } from '@/utils/token';

import { WorkerEventNames } from '@/types/worker';
import { Context } from '@derivation-tech/context/dist/context';
import { AppState } from '../store';
import { addTransaction } from '../transaction/actions';

export const preflightCheckTokeApprovalStatus = createAsyncThunk(
  'user/preflightCheckTokeApprovalStatus',
  async (
    {
      chainId,
      account,
      marginToken,
      spenderAddress,
      sdk,
    }: {
      chainId: number;
      account: string;
      provider: JsonRpcProvider;
      marginToken: TokenInfo;
      spenderAddress?: string;
      sdk: Context;
    },
    { getState, dispatch },
  ): Promise<boolean> => {
    try {
      const {
        user: { chainTokenAllowance, chainTokenAllowanceWithSpender },
      } = getState() as AppState;
      const tokenAllowance = !spenderAddress
        ? _.get(chainTokenAllowance, [chainId, account, marginToken?.address])
        : _.get(chainTokenAllowanceWithSpender, [chainId, account, marginToken?.address, spenderAddress]);
      if (tokenAllowance?.allowance?.gt(0)) {
        return true;
      }

      dispatch(
        checkTokenAllowance({
          spenderAddress,
          userAddress: account,
          chainId,
          marginToken,
          sdk,
        }),
      );
      return false;
    } catch (e) {
      console.error('check token status', e);
      return false;
    }
  },
);

export const approveToken = createAsyncThunk(
  'user/approveToken',
  async (
    {
      signer,
      provider,
      marginToken,
      chainId,
      amount,
      userAddr,
      spenderAddress,
      sdk,
      routerAddr,
    }: // formType = TRADE_FORM_TYPE.TradeForm,
    {
      signer: JsonRpcSigner;
      provider?: JsonRpcProvider;
      marginToken: TokenInfo;
      chainId: number;
      userAddr: string;
      formType?: TRADE_FORM_TYPE;
      amount: BigNumber;
      spenderAddress?: string;
      sdk: Context;
      routerAddr?: string;
    },
    { getState, dispatch },
  ): Promise<boolean> => {
    try {
      const erc20 = await getERC2O(marginToken.address, signer);
      const {
        balance: { chainBalanceMap },
      } = getState() as AppState;
      const routerAddress = routerAddr || sdk.perp.contracts.gate.address;
      const balanceInfo = _.get(chainBalanceMap, [chainId, userAddr, marginToken.address]);
      const balance = WrappedBigNumber.from(balanceInfo?.balance || amount).wadValue;
      // const nonce = await getNonnce(signer, routerAddress);
      const approveResult = await erc20.approve(
        spenderAddress || routerAddress,
        adjustBalanceNumberToTokenDecimals(balance, marginToken.decimals),
        // {
        //   nonce: nonce,
        // },
      );
      dispatch(
        addTransaction({
          chainId,
          traderAddr: signer._address.toLowerCase(),
          txInfo: {
            type: OPERATION_TX_TYPE.APPROVE,
            chainId,
            from: signer._address.toLowerCase(),
            gasLimit: formatEther(approveResult?.gasLimit),
            txHash: approveResult.hash,
            transactionResponse: approveResult,
          },
        }),
      );
      // use websocket provider
      let receipt: ContractReceipt | undefined = undefined;
      if (provider) {
        receipt = await provider.waitForTransaction(approveResult.hash);
      } else {
        receipt = await approveResult.wait();
      }
      if (receipt.status === 1) {
        dispatch(
          checkTokenAllowance({
            userAddress: userAddr,
            chainId,
            marginToken,
            block: receipt.blockNumber,
            spenderAddress,
            sdk,
          }),
        );
      }
      return true;
    } catch (e) {
      console.error('approve token e', e);
      return false;
    }
  },
);

export const checkTokenAllowance = createAsyncThunk(
  'user/checkTokenAllowance',
  async (
    {
      marginToken,
      chainId,
      userAddress: userAddr,
      spenderAddress,
      block,
      sdk,
    }: {
      marginToken: TokenInfo;
      chainId: number;
      userAddress: string;
      spenderAddress?: string;
      block?: number;
      sdk: Context;
    },
    { dispatch },
  ): Promise<ITokenAllowanceInfo | undefined> => {
    try {
      if (marginToken?.address && isNativeTokenAddr(marginToken.address)) {
        return {
          block: 0,
          allowance: ZERO,
        };
      }
      if (!marginToken?.address) {
        return;
      }

      if (!spenderAddress) {
        spenderAddress = sdk.perp.contracts.gate.address;
      }
      dispatch(
        multiCheckTokenAllowancesAction({
          marginTokens: [marginToken],
          chainId,
          userAddress: userAddr,
          spenderAddress,
          block,
        }),
      );
      return;

      // // const exportWorker = Comlink.wrap<ExportUserWorker>(window.userWorker);
      // // const UserWorker = getWrappedUserWorker();
      // const userWorker = await UserWorker.getInstance(chainId);
      // const allowanceInfo = await retryWhenTimeout(
      //   userWorker.callERC20Allowance({
      //     chainId,
      //     userAddr,
      //     token: marginToken,
      //     spender: spenderAddress || sdk.perp.contracts.gate.address,
      //     block,
      //   }),
      // );

      // if (allowanceInfo) {
      //   const allowance = BigNumber.from(allowanceInfo?.data || 0);
      //   return {
      //     block: allowanceInfo.block,
      //     allowance: fixBalanceNumberDecimalsTo18(allowance, marginToken.decimals),
      //   };
      // }
    } catch (e) {
      console.error('checkTokenAllowance token e', e);
      return {
        block: 0,
        allowance: ZERO,
      };
    }
  },
);

export const changeTokenAllowance = createAsyncThunk(
  'user/changeTokenAllowance',
  async (
    {
      token,
      allowanceInfo,
      block,
      sdk,
    }: {
      token: TokenInfo;
      chainId: number;
      userAddr: string;
      allowanceInfo: {
        spender: string;
        allowance: BigNumber;
      };
      block: number;
      sdk?: Context;
    },
    { getState },
  ): Promise<
    | {
        spender: string | undefined;
        allowanceInfo: ITokenAllowanceInfo;
      }
    | undefined
  > => {
    try {
      // check for right result from worker
      if (!sdk) {
        const {
          web3: { chainSDK },
        } = getState() as AppState;
        sdk = chainSDK[token.chainId];
      }

      const allowance = BigNumber.from(allowanceInfo.allowance || 0);

      let spenderAddr: string | undefined = allowanceInfo.spender.toLowerCase();
      if (spenderAddr === sdk.perp.contracts.gate.address.toLowerCase()) {
        spenderAddr = undefined;
      }
      return {
        allowanceInfo: {
          block: block,
          allowance: fixBalanceNumberDecimalsTo18(allowance, token.decimals),
        },
        spender: spenderAddr,
      };
    } catch (e) {
      console.error('changeTokenAllowance token e', e);
    }
  },
);

export const multiCheckTokenAllowancesAction = createAsyncThunk(
  'user/multiCheckTokenAllowancesAction',
  async (
    {
      marginTokens,
      chainId,
      userAddress: userAddr,
      spenderAddress,
      block,
    }: {
      marginTokens: TokenInfo[];
      chainId: number;
      userAddress: string;
      spenderAddress: string;
      block?: number;
    },
    { getState },
  ): Promise<ITokenAllowanceInfo | undefined> => {
    try {
      if (!marginTokens?.length) {
        return;
      }
      const {
        web3: { chainSDK },
      } = getState() as AppState;

      if (!spenderAddress) {
        spenderAddress = chainSDK[chainId]?.perp?.contracts?.gate?.address;
      }

      // remove native token from margin tokens
      if (marginTokens.find((token) => isNativeTokenAddr(token.address))) {
        marginTokens = marginTokens.filter((token) => !isNativeTokenAddr(token.address));
      }

      window.userWorker.postMessage({
        eventName: WorkerEventNames.MulticallTokensAllowance,
        data: {
          chainId,
          userAddr,
          tokens: marginTokens,
          spender: spenderAddress,
          block,
        },
      });
    } catch (e) {
      console.error('checkTokenAllowance token e', e);
      return {
        block: 0,
        allowance: ZERO,
      };
    }
  },
);

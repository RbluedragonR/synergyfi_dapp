import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import { OPERATION_TX_TYPE, ZERO } from '@/constants';
import { CHAIN_ID } from '@/constants/chain';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { TokenInfo } from '@/types/token';
import { parseSendingTxMessageMapping } from '@/utils/notification';
import { fixBalanceNumberDecimalsTo18, isNativeTokenAddr } from '@/utils/token';
import { BlockInfo, Context, TokenInfo as Token } from '@derivation-tech/context';
import { createAsyncThunk } from '@reduxjs/toolkit';
import _ from 'lodash';

import { NATIVE_TOKEN_ADDRESS } from '@synfutures/sdks-perp';
import { ContractReceipt } from 'ethers';

import { IVaultTokenHoldingValue, WrappedArrear } from '@/types/vault';
import { utils as vaultUtils } from '@synfutures/sdks-perp-launchpad';
import { DepositInfo, DepositWithdraw } from '@synfutures/sdks-perp-launchpad-datasource';
import { fetchTokenBalanceAction } from '../balance/actions';
import { sendTransaction } from '../transaction/actions';
import { checkTokenAllowance } from '../user/actions';

export const fetchUserDepositInfo = createAsyncThunk(
  'vault/fetchUserDepositInfo',
  async ({
    userAddr,
    sdk,
  }: {
    chainId: number;
    userAddr: string;
    sdk: Context;
  }): Promise<{ userDepositInfo: Record<string, DepositInfo>; blockInfo: BlockInfo } | undefined> => {
    try {
      if (sdk) {
        const { depositInfos, blockInfo } = await sdk.perpLaunchpadDataSource.getUserDepositInfo(userAddr);
        depositInfos.forEach((info) => {
          info.holdingValue = ZERO;
          info.entryValue = ZERO;
          info.share = ZERO;
        });
        return {
          userDepositInfo: _.keyBy(depositInfos, 'vault'),
          blockInfo,
        };
      }
      return undefined;
    } catch (e) {
      console.log('🚀 ~fetchUserDepositInfo e:', e);
      return undefined;
    }
  },
);

export const depositToVault = createAsyncThunk(
  'vault/depositToVault',
  async (
    {
      signer,
      provider,
      quote,
      amount,
      chainId,
      userAddr,
      isDisableNotification,
      vaultAddr,
      sdk,
    }: {
      signer: JsonRpcSigner;
      provider?: JsonRpcProvider;
      quote: TokenInfo;
      userAddr: string;
      amount: WrappedBigNumber;
      chainId: CHAIN_ID;
      isDisableNotification?: boolean;
      vaultAddr: string;
      sdk: Context;
    },
    { dispatch },
  ): Promise<ContractReceipt | undefined> => {
    try {
      const txType = OPERATION_TX_TYPE.VAULT_DEPOSIT;
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
              amount: amount,
              quoteSymbol: quote.symbol,
              to: userAddr,
              isNative: isNativeToken,
              nativeTokenAddr: NATIVE_TOKEN_ADDRESS,
            });
            const populatedTx = await sdk.perpLaunchpad.deposit(vaultAddr, isNativeToken, amount.wadValue, {
              from: userAddr,
            });
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
            sendingTemplate: parseSendingTxMessageMapping[txType]!(WrappedBigNumber.from(amount), quote.symbol),
          },
          wssProvider: provider,
        }),
      ).unwrap();
      if (receipt?.status === 1) {
        const block = receipt.blockNumber;
        // fetch token allowance
        dispatch(
          checkTokenAllowance({
            userAddress: userAddr,
            chainId,
            marginToken: quote,
            spenderAddress: vaultAddr.toLowerCase(),
            sdk,
          }),
        );
        // fetch token balance

        dispatch(fetchTokenBalanceAction({ chainId, userAddr: userAddr, token: quote, block }));
        dispatch(
          fetchVaultTokenHoldingValue({
            chainId,
            userAddr,
            vaultAddrs: [vaultAddr],
            blockNumber: receipt.blockNumber,
            sdk,
          }),
        );
      }
      return receipt;
    } catch (error) {
      console.error('🚀 ~ depositToVault error:', error);
    }
  },
);

export const withdrawFromVault = createAsyncThunk(
  'vault/withdrawFromVault',
  async (
    {
      signer,
      provider,
      quote,
      amount,
      chainId,
      userAddr,
      arrearRequired,
      blockInfo,
      vaultAddr,
      sdk,
    }: {
      signer: JsonRpcSigner;
      provider?: JsonRpcProvider;
      quote: TokenInfo;
      userAddr: string;
      amount: WrappedBigNumber;
      chainId: CHAIN_ID;
      arrearRequired?: boolean;
      vaultAddr: string;
      blockInfo?: BlockInfo;
      sdk: Context;
    },
    { dispatch },
  ): Promise<ContractReceipt | undefined> => {
    const txType = OPERATION_TX_TYPE.VAULT_WITHDRAW;
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
            amount: amount,
            quoteSymbol: quote.symbol,
            to: userAddr,
            isNative: isNativeToken,
            nativeTokenAddr: NATIVE_TOKEN_ADDRESS,
          });

          const populatedTx = await sdk.perpLaunchpad.withdrawQuote(vaultAddr, isNativeToken, amount.wadValue, {
            blockTag: blockInfo?.height,
            from: userAddr,
          });
          return signer.sendTransaction(populatedTx);
        },
        chainId,
        userAddr,
        txParams: {
          isDisableNotification: arrearRequired,
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
    if (receipt?.status === 1) {
      const block = receipt.blockNumber;

      // fetch token balance
      dispatch(fetchTokenBalanceAction({ chainId, userAddr: userAddr, token: quote, block }));
      dispatch(
        fetchVaultTokenHoldingValue({
          chainId,
          userAddr,
          vaultAddrs: [vaultAddr],
          blockNumber: receipt.blockNumber,
          sdk,
        }),
      );
      if (arrearRequired) {
        dispatch(
          getUserPendingWithdraw({
            chainId,
            userAddr,
            vaultAddr: vaultAddr,
            sdk,
            quoteToken: quote,
          }),
        );
      }
    }
    return receipt;
  },
);

// export const claimWithdrawFromVault = createAsyncThunk(
//   'vault/claimWithdrawFromVault',
//   async (
//     {
//       chainId,
//       userAddr,
//       signer,
//       vaultClient,
//       provider,
//       quote,
//       amount,
//       vaultAddr,
//     }: {
//       chainId: CHAIN_ID;
//       userAddr: string;
//       vaultClient: VaultClient;
//       signer: JsonRpcSigner;
//       provider: JsonRpcProvider;
//       quote: TokenInfo;
//       amount: WrappedBigNumber;
//       vaultAddr: string;
//     },
//     { dispatch },
//   ): Promise<ContractReceipt | undefined> => {
//     const txType = OPERATION_TX_TYPE.CLAIM_WITHDRAW;
//     const receipt = await dispatch(
//       sendTransaction({
//         sendFunc: async () => {
//           console.record('tx', `Try to send [${txType}] operation tx for quote [${quote.symbol}]`, undefined, {
//             chainId,
//             userAddr,
//             signer,
//             quote,
//             amount: amount,
//             quoteSymbol: quote.symbol,
//             to: userAddr,
//           });
//           //return await vaultClient.claimArrear(signer);
//         },
//         chainId,
//         userAddr,
//         txParams: {
//           isDisableNotification: true,
//           type: txType,
//           instrument: {
//             quoteSymbol: quote.symbol,
//             baseSymbol: '',
//             isInverse: false,
//             quoteDecimal: quote.decimals,
//           },
//           sendingTemplate: parseSendingTxMessageMapping[txType]!(WrappedBigNumber.from(amount), quote.symbol),
//         },
//         wssProvider: provider,
//       }),
//     ).unwrap();
//     console.log('claimWithdrawFromVault result:', receipt);
//     if (receipt?.status === 1) {
//       const block = receipt.blockNumber;
//       await sleep(3000);
//       dispatch(fetchTokenBalanceAction({ chainId, userAddr: userAddr, token: quote, block }));
//       dispatch(
//         fetchVaults({
//           chainId,
//         }),
//       );
//       dispatch(
//         fetchUserDepositInfo({
//           chainId,
//           userAddr,
//         }),
//       );
//       if (chainId && userAddr && vaultAddr) {
//         dispatch(
//           getUserPendingWithdraw({
//             chainId,
//             userAddr,
//             vaultAddr,
//             vaultClient,
//           }),
//         );
//       }
//     }
//     return receipt;
//   },
// );

export const getUserPendingWithdraw = createAsyncThunk(
  'vault/getUserPendingWithdraw',
  async ({
    userAddr,
    vaultAddr,
    sdk,
    quoteToken,
  }: {
    chainId: number;
    userAddr: string;
    vaultAddr: string;
    sdk: Context;
    quoteToken: Token;
  }): Promise<WrappedArrear | undefined> => {
    try {
      if (sdk) {
        const arrear = await sdk.perpLaunchpadDataSource.getArrear(userAddr, vaultAddr);
        const { netValue, commissionFee } = await sdk.perpLaunchpad.getOwedQuote(vaultAddr, userAddr);
        return { ...arrear, quantity: fixBalanceNumberDecimalsTo18(netValue, quoteToken.decimals), commissionFee };
      }
    } catch (error) {
      console.error('🚀 ~getUserPendingWithdraw error:', error, { params: { vaultAddr, userAddr } });
    }
  },
);

export const fetchVaultHistory = createAsyncThunk(
  'vault/fetchVaultHistory',
  async ({ userAddr, sdk }: { chainId: number; userAddr: string; sdk: Context }): Promise<DepositWithdraw[]> => {
    try {
      if (sdk) {
        const history = await sdk.perpLaunchpadDataSource.getUserDepositWithdrawHistory(userAddr);
        return history;
      }
      return [];
    } catch (e) {
      console.log('🚀 ~fetchVaultHistory e:', e);
      return [];
    }
  },
);

export const fetchVaultTokenHoldingValue = createAsyncThunk(
  'vault/fetchVaultTokenHoldingValue',
  async ({
    userAddr,
    vaultAddrs,
    blockNumber,
    sdk,
  }: {
    chainId: number;
    userAddr: string;
    vaultAddrs: string[];
    blockNumber?: number;
    sdk: Context;
  }): Promise<
    | {
        deposits: Record<string, IVaultTokenHoldingValue>;
        blockHeight: number;
      }
    | undefined
  > => {
    try {
      if (sdk && vaultAddrs) {
        const res = await vaultUtils.getUserDepositInfo(userAddr, vaultAddrs, sdk, { blockTag: blockNumber });
        if (res.depositInfos) {
          const deposits = _.reduce(
            res.depositInfos,
            (acc, depositInfo) => {
              acc[depositInfo.vault] = {
                user: userAddr,
                vault: depositInfo.vault,
                share: depositInfo.share,
                entryValue: depositInfo.entryValue,
                holdingValue: depositInfo.holdingValue,
              };
              return acc;
            },
            {} as Record<string, IVaultTokenHoldingValue>,
          );
          return { deposits, blockHeight: res.blockHeight };
        }
      }
    } catch (e) {
      console.log('🚀 ~fetchVaultTokenHoldingValue e:', e);
    }
  },
);

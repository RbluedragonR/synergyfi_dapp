import { FETCHING_STATUS } from '@/constants';
import { CHAIN_ID } from '@/constants/chain';
import { getVaultConfig } from '@/constants/launchpad/vault';
import { QUERY_KEYS } from '@/constants/query';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedVault } from '@/entities/WrappedVault';
import { useAppDispatch, useAppSelector } from '@/hooks';
import useSocket from '@/hooks/useSocket';
import { useTxNotification } from '@/hooks/useTxNotification';
import { useChainId, useProvider, useUserAddr } from '@/hooks/web3/useChain';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { queryClient } from '@/pages/App';
import { MESSAGE_TYPE, SUBSCRIBE_TYPE, UNSUBSCRIBE_TYPE } from '@/types/socket';
import { TokenInfo } from '@/types/token';
import {
  IVaultChainConfig,
  IVaultConfig,
  IVaultHistory,
  IVaultInfo,
  IVaultTokenHoldingValue,
  VaultEpochDetail,
  WrappedArrear,
} from '@/types/vault';
import { DepositInfo } from '@synfutures/sdks-perp-launchpad-datasource';
import { ContractReceipt } from 'ethers';
import _ from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTokensInfoConfig } from '../config/hook';
import { useTokenPrices } from '../global/query';
import { useSDK } from '../web3/hook';
import { depositToVault, getUserPendingWithdraw, withdrawFromVault } from './action';
import { useFetchVaultInfos } from './query';
import {
  selectChainUserDepositInfoBlockInfo,
  selectUserDepositInfo,
  selectUserDepositInfoStatus,
  selectUserVaultHistory,
  selectUserVaultHistoryStatus,
  selectUserVaultTokenHoldingValue,
  selectVaultClaimStatus,
  selectVaultTokenHoldingValue,
  selectVaultUserPendingWithdraw,
  selectVaultUserPendingWithdrawFetchingStatus,
  setSelectedVaultAddress,
} from './slice';
export const useDepositInputAmount = () => {
  return useAppSelector((state) => state.vault.input.depositAmount);
};
export const useWithdrawInputAmount = () => {
  return useAppSelector((state) => state.vault.input.withdrawAmount);
};
export function useUserDepositInfoStatus(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): FETCHING_STATUS | undefined {
  return useAppSelector(selectUserDepositInfoStatus(chainId, userAddr));
}
export function useUserDepositInfo(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): Record<string, DepositInfo> | undefined {
  const userVaultHoldingValue = useUserAllVaultTokenHoldingValueMap(chainId, userAddr);
  const deposits = useAppSelector(selectUserDepositInfo(chainId, userAddr));

  return useMemo(() => {
    if (!deposits || !userVaultHoldingValue) {
      return undefined;
    }
    const res = _.mapValues(deposits, (deposit) => {
      const depositRes = { ...deposit };
      if (userVaultHoldingValue) {
        const holdingValue = userVaultHoldingValue[depositRes.vault];
        if (holdingValue) {
          _.set(depositRes, 'holdingValue', holdingValue.holdingValue);
          _.set(depositRes, 'entryValue', holdingValue.entryValue);
          _.set(depositRes, 'share', holdingValue.share);
        }
      }
      return depositRes;
    });
    return res;
  }, [deposits, userVaultHoldingValue]);
}

export function useVaultListIsFetched(chainId: CHAIN_ID | undefined, userAddr: string | undefined): boolean {
  const { isFetched } = useVaultInfos(chainId, userAddr);
  return isFetched;
}
export function useVaultInfos(chainId: CHAIN_ID | undefined, userAddr: string | undefined) {
  const { data: vaultInfosFromVault, isFetched } = useFetchVaultInfos(chainId, userAddr);
  const tokenInfoConfig = useTokensInfoConfig(chainId);
  const vaultInfos = useMemo(() => {
    return _.mapValues(vaultInfosFromVault, (v) => {
      const tokenInfo = tokenInfoConfig?.marginTokenMap?.[v.tokenInfo.address];
      // fix api token decimals error
      if (tokenInfo) return { ...v, tokenInfo: { ...v.tokenInfo, ...tokenInfo } };
      return v;
    });
  }, [tokenInfoConfig, vaultInfosFromVault]);

  return { vaultInfos, isFetched };
}

export const useSelectedVaultAddressSetter = () => {
  const dispatch = useAppDispatch();
  const setter = useCallback(
    (vaultAddress: string | null) => {
      dispatch(setSelectedVaultAddress(vaultAddress));
    },
    [dispatch],
  );
  return setter;
};
export function useSelectedVault() {
  const chainId = useChainId();
  const userAddress = useUserAddr();
  const vaults = useWrappedVaults(chainId, userAddress);
  const selectedVaultAddress = useAppSelector((state) => state.vault.selectedVaultAddress);
  const selectedVault = useMemo(() => {
    return vaults.find((vault) => vault.vaultAddress === selectedVaultAddress) || null;
  }, [selectedVaultAddress, vaults]);
  return {
    selectedVault,
  };
}

export function useWrappedVaults(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  onlyDepositedVaults?: boolean,
): WrappedVault[] {
  const { data: priceInfoMap } = useTokenPrices({ chainId });
  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  const userDepositInfo = useUserDepositInfo(chainId, userAddr);
  // const vaultOOPoints = useVaultPoints(chainId);
  return useMemo(() => {
    if (!vaultInfos || !chainId) {
      return [];
    }

    return _.flatMap(vaultInfos, (vaultInfo) => {
      const wrappedVault = WrappedVault.getInstance(vaultInfo.vaultAddress, chainId);
      const depositInfo = _.get(userDepositInfo, [vaultInfo.vaultAddress]);
      // const ooPointsInfo = _.get(vaultOOPoints, [vaultInfo.vaultAddr]);
      if (onlyDepositedVaults && (depositInfo?.share.lte(0) || !depositInfo?.share)) {
        return [];
      }
      //const userDepositInfo = _.get(userDepositInfo, [origin.vaultAddr, userAddr]);
      if (!wrappedVault) {
        return WrappedVault.wrapInstance({ metaVault: vaultInfo, chainId, depositInfo });
      }
      userAddr && wrappedVault.setUserAddr(userAddr);
      wrappedVault.setMetaVault(vaultInfo);
      wrappedVault.setDepositInfo(depositInfo);
      // wrappedVault._epoch = ooPointsInfo?.epoch;
      // wrappedVault._ooPoints = ooPointsInfo?.distributedVaultPoints || 0;
      if (priceInfoMap) {
        const quotePriceInfo = priceInfoMap[wrappedVault.quoteToken.address];
        if (quotePriceInfo) {
          wrappedVault.quoteToken.setTokenPrice(quotePriceInfo);
        }
      }
      return [wrappedVault];
    });
  }, [vaultInfos, chainId, userDepositInfo, onlyDepositedVaults, userAddr, priceInfoMap]);
}

export function useVaultConfig(): IVaultConfig {
  return useMemo(() => {
    return getVaultConfig();
  }, []);
}

export function useVaultChainConfig(chainId: CHAIN_ID | undefined): IVaultChainConfig | undefined {
  const vaultConfig = useVaultConfig();
  return useMemo(() => {
    return chainId ? vaultConfig.chainConfig[chainId] : undefined;
  }, [chainId, vaultConfig.chainConfig]);
}

export function useVaultClaimStatus(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  vaultAddr: string | undefined,
): FETCHING_STATUS {
  return useAppSelector(selectVaultClaimStatus(chainId, userAddr, vaultAddr));
}

export function useVaultUserPendingWithdrawInfo(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  vaultAddr: string | undefined,
): WrappedArrear | undefined {
  return useAppSelector(selectVaultUserPendingWithdraw(chainId, userAddr, vaultAddr));
}

export function useVaultUserPendingWithdrawFetchingStatus(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  vaultAddr: string | undefined,
): FETCHING_STATUS {
  return useAppSelector(selectVaultUserPendingWithdrawFetchingStatus(chainId, userAddr, vaultAddr));
}

/**
 * Custom React hook for handling vault operations. Deposit Withdraw and Claim Withdraw.
 *
 * @param chainId - The chain ID.
 * @param vaultAddr - The address of the vault.
 * @param quoteToken - The quote token information.
 * @returns An object containing functions for depositing, withdrawing, and claiming withdrawals from the vault.
 */
export function useVaultOperations(
  chainId: CHAIN_ID | undefined,
  vaultAddr: string | undefined,
  quoteToken: TokenInfo | undefined,
) {
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const signer = useWalletSigner();
  const provider = useProvider();
  const blockInfo = useAppSelector(selectChainUserDepositInfoBlockInfo(chainId, userAddr));
  const notification = useTxNotification();
  const sdk = useSDK(chainId);
  const { t } = useTranslation();
  const adjustQuote = useMemo(() => {
    // if (isWrappedNativeTokenInfo) {
    //   return tokenInfo;
    // }
    return quoteToken;
  }, [quoteToken]);

  const onDepositToVault = useCallback(
    async (amount: WrappedBigNumber, onAfterDeposit?: (receipt: ContractReceipt | undefined) => void) => {
      try {
        if (chainId && userAddr && vaultAddr && adjustQuote && signer && amount && !amount.eq(0) && sdk) {
          const receipt = await dispatch(
            depositToVault({
              signer,
              provider,
              quote: adjustQuote,
              amount: amount,
              chainId,
              userAddr,
              vaultAddr,
              sdk,
            }),
          ).unwrap();
          if (receipt) {
            if (receipt.status === 1) {
              // const dappConfig = DAPP_CHAIN_CONFIGS[chainId];
              // // get fund flows with weth
              // const tokenCheck = isNativeTokenAddr(adjustQuote.address) ? dappConfig.wrappedNativeToken : adjustQuote;
              // if (tokenCheck) {
              //   dispatch(
              //     getFundFlows({
              //       chainId,
              //       sdkContext,
              //       userAddr,
              //       quoteTokens: [tokenCheck],
              //       blockNumber: receipt.blockNumber,
              //     }),
              //   );
              // }
            }
            // dispatch(fetchVaultInfos({ chainId, userAddr }));
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.INFOS(chainId, userAddr) });
            onAfterDeposit && onAfterDeposit(receipt);
          }
        }
      } catch (e) {
        console.error('🚀 ~ file: index.tsx ~ line 91 ~ onAfterClickDeposit ~ e', e);
      }
    },
    [chainId, userAddr, vaultAddr, adjustQuote, signer, sdk, dispatch, provider],
  );

  const onWithdrawFromVault = useCallback(
    async (
      amount: WrappedBigNumber,
      arrearRequired: boolean, // when show Request Withdraw btn
      onAfterWithdraw?: (receipt: ContractReceipt | undefined) => void,
    ) => {
      try {
        if (chainId && userAddr && vaultAddr && adjustQuote && signer && amount && !amount.eq(0) && sdk) {
          const receipt = await dispatch(
            withdrawFromVault({
              signer,
              provider,
              quote: adjustQuote,
              amount: amount,
              chainId,
              userAddr,
              arrearRequired,
              vaultAddr,
              blockInfo,
              sdk,
            }),
          ).unwrap();
          if (receipt) {
            if (receipt.status === 1) {
              if (arrearRequired) {
                notification.success({
                  tx: receipt.transactionHash,
                  message: t('notification.vaultWithdraw.success'),
                  description: t('notification.vaultWithdraw.successWithLimit', {
                    quantity: WrappedBigNumber.from(amount).formatDisplayNumber(),
                    quote: adjustQuote.symbol,
                  }),
                });
              }
              queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.INFOS(chainId, userAddr) });
            }
            onAfterWithdraw && onAfterWithdraw(receipt);
          }
        }
      } catch (e) {
        console.error('🚀 ~ file: index.tsx ~ line 91 ~ onAfterClickDeposit ~ e', e);
      }
    },
    [chainId, userAddr, vaultAddr, adjustQuote, signer, sdk, dispatch, provider, blockInfo, notification, t],
  );

  // const onClaimWithdrawFromVault = useCallback(
  //   async (amount: WrappedBigNumber, onAfterWithdraw?: (receipt: ContractReceipt | undefined) => void) => {
  //     if (chainId && userAddr && vaultAddr && adjustQuote && vaultClient && signer && provider) {
  //       if (amount.gt(0)) {
  //         const receipt = await dispatch(
  //           claimWithdrawFromVault({
  //             chainId,
  //             userAddr,
  //             quote: adjustQuote,
  //             vaultClient,
  //             signer,
  //             amount: amount,
  //             provider,
  //             vaultAddr,
  //           }),
  //         ).unwrap();
  //         if (receipt && receipt?.status === 1) {
  //           notification.success({
  //             tx: receipt.transactionHash,
  //             message: t('notification.claimVaultWithdraw.success'),
  //             description: t('notification.claimVaultWithdraw.successDesc', {
  //               quantity: WrappedBigNumber.from(amount).formatDisplayNumber(),
  //               quote: adjustQuote.symbol,
  //             }),
  //           });
  //         }
  //         onAfterWithdraw && onAfterWithdraw(receipt);
  //       }
  //     }
  //   },
  //   [adjustQuote, chainId, dispatch, notification, provider, signer, t, userAddr, vaultAddr, vaultClient],
  // );
  return { onDepositToVault, onWithdrawFromVault };
}
export const useShouldRequestWithdraw = (chainId: CHAIN_ID | undefined, vaultAddr: string | undefined) => {
  const sdk = useSDK(chainId);
  const userAddress = useUserAddr();
  const checkShouldRequestWithdraw = useCallback(
    async (amount: WrappedBigNumber) => {
      if (vaultAddr && userAddress && sdk) {
        try {
          const { availableNow } = await sdk?.perpLaunchpad?.inquireWithdrawal(vaultAddr, userAddress, amount.wadValue);
          return !availableNow;
        } catch (error) {
          console.log('🚀 ~ checkShouldRequestWithdraw ~ error:', error);
          return false;
        }
      }
      return false;
    },
    [sdk, userAddress, vaultAddr],
  );
  return { checkShouldRequestWithdraw };
};

export function useVaultUserPendingWithdraw(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  vaultAddr: string | undefined,
) {
  const dispatch = useAppDispatch();
  const userPendingWithdrawInfo = useVaultUserPendingWithdrawInfo(chainId, userAddr, vaultAddr);
  const pendingWithdrawFetchingStatus = useVaultUserPendingWithdrawFetchingStatus(chainId, userAddr, vaultAddr);
  const userPendingWithdrawFetchingStatus = useVaultUserPendingWithdrawFetchingStatus(chainId, userAddr, vaultAddr);
  const sdk = useSDK(chainId);
  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  const fetchUserPendingWithdraw = useCallback(() => {
    if (chainId && userAddr && vaultAddr && sdk) {
      const vaultInfo = vaultInfos?.[vaultAddr];
      vaultInfo?.tokenInfo &&
        dispatch(
          getUserPendingWithdraw({
            chainId,
            userAddr,
            vaultAddr,
            sdk,
            quoteToken: vaultInfo?.tokenInfo,
          }),
        );
    }
  }, [chainId, userAddr, vaultAddr, sdk, vaultInfos, dispatch]);

  const isDisableRequestButton = useMemo(() => {
    if (userPendingWithdrawInfo?.quantity.gte(0)) {
      return true;
    }
    return false;
  }, [userPendingWithdrawInfo?.quantity]);

  return {
    fetchUserPendingWithdraw,
    userPendingWithdrawInfo,
    userPendingWithdrawFetchingStatus,
    isDisableRequestButton,
    pendingWithdrawFetchingStatus,
  };
}

export function useUserVaultHistory(chainId: number | undefined, userAddr: string | undefined): IVaultHistory[] {
  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  const history = useAppSelector(selectUserVaultHistory(chainId, userAddr));
  return useMemo(() => {
    if (!vaultInfos) return [];
    const vaultMap = vaultInfos;
    return history
      .map((h) => ({ ...h, vault: vaultMap[h.vaultAddr] }))
      .sort((prev, cur) => cur.timestamp - prev.timestamp) as IVaultHistory[];
  }, [history, vaultInfos]);
}
export function useUserVaultHistoryStatus(
  chainId: number | undefined,
  userAddr: string | undefined,
): FETCHING_STATUS | undefined {
  return useAppSelector(selectUserVaultHistoryStatus(chainId, userAddr));
}

export function useUserAllVaultTokenHoldingValueMap(
  chainId: number | undefined,
  userAddr: string | undefined,
): Record<string, IVaultTokenHoldingValue> | undefined {
  const rec = useAppSelector(selectUserVaultTokenHoldingValue(chainId, userAddr));

  return rec;
}

export function useVaultTokenHoldingValue(
  chainId: number | undefined,
  userAddr: string | undefined,
  vaultAddr: string | undefined,
): IVaultTokenHoldingValue | undefined {
  return useAppSelector(selectVaultTokenHoldingValue(chainId, userAddr, vaultAddr));
}

export function useUserVaultPointsDetail(
  chainId: number | undefined,
  userAddr: string | undefined,
  vaultAddr: string | undefined,
): VaultEpochDetail[] {
  return useMemo(
    () =>
      // _.orderBy(
      //   _.map(details, (d) => {
      //     const epoch = epochs.find((e) => e.epoch === d.epoch) as IEpoch;
      //     return {
      //       ...d,
      //       ...epoch,
      //     };
      //   }),
      //   ['epoch'],
      //   ['desc'],
      // ),
      [],
    [chainId, userAddr, vaultAddr],
  );
}

export function useWatchVaultListChange(chainId: number | undefined, userAddr: string | undefined): void {
  const { socket } = useSocket();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket || !chainId || !userAddr) return;
    socket.emit(SUBSCRIBE_TYPE.VAULT, { chainId: chainId });

    socket.on(MESSAGE_TYPE.vaultChanged, (data) => {
      console.log(MESSAGE_TYPE.vaultChanged, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.INFOS(chainId, userAddr) });
    });

    return () => {
      socket.off(MESSAGE_TYPE.vaultChanged);
      socket.emit(UNSUBSCRIBE_TYPE.VAULT, { chainId: chainId });
    };
  }, [chainId, dispatch, socket]);
}

export function useVaultInfo(chainId: number | undefined, vaultAddr: string | undefined): IVaultInfo | undefined {
  const userAddress = useUserAddr();
  const { vaultInfos } = useVaultInfos(chainId, userAddress);
  return useMemo(() => {
    if (vaultInfos && vaultAddr) {
      return vaultInfos[vaultAddr];
    }
  }, [vaultAddr, vaultInfos]);
}

import { checkTokenAllowance } from '@/features/user/actions';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { usePoller } from '@/hooks/common/usePoller';
import usePageSupported from '@/hooks/usePageSupported';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { RouteBasePath } from '@/pages/routers';
import { useDebounceEffect } from 'ahooks';
import React, { useCallback, useEffect, useMemo } from 'react';
import { fetchUserDepositInfo, fetchVaultTokenHoldingValue, getUserPendingWithdraw } from '../action';
import { useSelectedVaultAddressSetter, useVaultInfos } from '../hook';
const vaultInterval = 5000;
function useFetchVaultTokenList(): void {
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  useCheckTokenApprovalStatus(chainId, userAddr);
  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  const sdk = useSDK(chainId);

  const fetchUserDepositInfoCB = useCallback(() => {
    if (chainId && userAddr && sdk) {
      dispatch(
        fetchUserDepositInfo({
          chainId,
          userAddr,
          sdk,
        }),
      );
    }
  }, [chainId, dispatch, sdk, userAddr]);

  const fetchVaultTokenHoldingValueCB = useCallback(() => {
    if (chainId && userAddr && vaultInfos && sdk) {
      dispatch(
        fetchVaultTokenHoldingValue({
          chainId,
          userAddr,
          vaultAddrs: Object.keys(vaultInfos),
          sdk,
        }),
      );
    }
  }, [chainId, dispatch, sdk, userAddr, vaultInfos]);

  // usePoller(
  //   () => {
  //     fetchVaultsInfoCB();
  //   },
  //   [fetchVaultsInfoCB],
  //   vaultInterval,
  // );
  usePoller(
    () => {
      fetchUserDepositInfoCB();
    },
    [fetchUserDepositInfoCB],
    vaultInterval,
  );
  usePoller(
    () => {
      fetchVaultTokenHoldingValueCB();
    },
    [fetchVaultTokenHoldingValueCB],
    vaultInterval,
  );
}

// export function useFetchVaultOOPoints(): void {
//   const chainId = useChainId();
//   const vaults = useVaultList(chainId);
//   // const userAddr = useUserAddr();
//   const dispatch = useAppDispatch();
//   const fetchVaultOOPointsCB = useCallback(() => {
//     chainId && vaults?.length && dispatch(fetchVaultOOPoints({ chainId, wallets: vaults.map((v) => v.vaultAddr) }));
//   }, [chainId, dispatch, vaults]);
//   // const fetchUserVaultOOPointsCB = useCallback(() => {
//   //   chainId && userAddr && dispatch(fetchUserVaultOOPoints({ chainId, userAddr }));
//   // }, [chainId, dispatch, userAddr]);

//   usePoller(
//     () => {
//       fetchVaultOOPointsCB();
//     },
//     [fetchVaultOOPointsCB],
//     vaultInterval,
//   );
//   // usePoller(
//   //   () => {
//   //     fetchUserVaultOOPointsCB();
//   //   },
//   //   [fetchUserVaultOOPointsCB],
//   //   vaultInterval,
//   // );
// }
// export function useFetchVaultOOPointsDetail(): void {
//   const chainId = useChainId();
//   const userAddr = useUserAddr();
//   const depositInfo = useUserDepositInfo(chainId, userAddr);
//   const deposits = useMemo(() => _.values(depositInfo), [depositInfo]);
//   const dispatch = useAppDispatch();
//   const fetchVaultOOPointsDetail = useCallback(() => {
//     chainId &&
//       userAddr &&
//       !!deposits.length &&
//       deposits.forEach((d) => {
//         dispatch(
//           fetchUserOOPointsDetail({
//             chainId,
//             userAddr,
//             vaultAddr: d.vault,
//           }),
//         );
//       });
//   }, [chainId, deposits, dispatch, userAddr]);
//   useEffect(() => {
//     chainId && dispatch(getEpochs({ chainId }));
//   }, [chainId, deposits, dispatch, userAddr]);
//   usePoller(
//     () => {
//       fetchVaultOOPointsDetail();
//     },
//     [fetchVaultOOPointsDetail],
//     vaultInterval,
//   );
// }

const useUpdateSelectedWrappedVaultToken = () => {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const setSelectedVaultAddress = useSelectedVaultAddressSetter();
  useEffect(() => {
    chainId && userAddr && setSelectedVaultAddress(null);
  }, [chainId, setSelectedVaultAddress, userAddr]);
};
const useFetchPendingWithdraw = () => {
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  const vaultAddresses = useMemo(() => (vaultInfos ? Object.keys(vaultInfos) : []), [vaultInfos]);
  const sdk = useSDK(chainId);
  const fetchUserPendingWithdraw = useCallback(() => {
    if (chainId && userAddr && sdk) {
      vaultAddresses?.forEach((vaultAddr) => {
        const vault = vaultInfos?.[vaultAddr];
        vault &&
          vault?.tokenInfo &&
          dispatch(
            getUserPendingWithdraw({
              chainId,
              userAddr,
              vaultAddr: vaultAddr,
              sdk,
              quoteToken: vault?.tokenInfo,
            }),
          );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, userAddr, JSON.stringify(vaultAddresses), dispatch]);
  useEffect(() => {
    fetchUserPendingWithdraw();
  }, [fetchUserPendingWithdraw]);
};

function useCheckTokenApprovalStatus(chainId: number | undefined, userAddr: string | undefined): void {
  const dispatch = useAppDispatch();
  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  const vaultInfoKeys = useMemo(() => !!vaultInfos && Object.keys(vaultInfos), [vaultInfos]);
  const sdk = useSDK(chainId);
  // automatically check all margin tokens approval
  useDebounceEffect(
    () => {
      if (userAddr && chainId && vaultInfos && sdk) {
        Object.values(vaultInfos)?.forEach((vault) => {
          vault &&
            dispatch(
              checkTokenAllowance({
                userAddress: userAddr,
                chainId,
                marginToken: vault.tokenInfo,
                spenderAddress: vault.vaultAddress,
                sdk,
              }),
            );
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [userAddr, chainId, dispatch, sdk, vaultInfoKeys],
    { wait: 500 },
  );
}

function VaultGlobalEffect(): null {
  usePageSupported({ page: RouteBasePath.launchpad });
  // const fetchVaultsCB = useCallback(() => {
  //   if (chainId && sdk) {
  //     dispatch(
  //       fetchVaults({
  //         chainId,
  //         sdk,
  //       }),
  //     );
  //   }
  // }, [chainId, dispatch, sdk]);
  useFetchVaultTokenList();
  // useFetchVaultOOPoints();
  // useFetchVaultOOPointsDetail();
  useUpdateSelectedWrappedVaultToken();
  useFetchPendingWithdraw();
  return null;
}

export default React.memo(VaultGlobalEffect);

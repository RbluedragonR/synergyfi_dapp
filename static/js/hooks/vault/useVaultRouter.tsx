import { CHAIN_ID, DEFAULT_CHAIN_ID, SUPPORTED_CHAIN_ID } from '@/constants/chain';
import { useVaultInfos } from '@/features/vault/hook';
import { setSelectedVaultAddress } from '@/features/vault/slice';
import { RouteBasePath } from '@/pages/routers';
import { getChainShortName } from '@/utils/chain';
import { useCallback, useEffect } from 'react';
import { NavigateOptions, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '..';
import { useChainId, useUserAddr } from '../web3/useChain';
export const getVaultLink = ({ chainId, vaultAddress }: { chainId?: CHAIN_ID; vaultAddress?: string }) => {
  const theChainId = chainId || DEFAULT_CHAIN_ID;
  const finalChainId = SUPPORTED_CHAIN_ID.includes(theChainId) ? theChainId : DEFAULT_CHAIN_ID;
  const chainShortName = getChainShortName(finalChainId);
  return `/${RouteBasePath.launchpad}/${chainShortName}/${vaultAddress || ''}`;
};
export default function useVaultRouter() {
  const navigate = useNavigate();
  const chainId = useChainId();
  const goToVault = useCallback(
    ({ vaultAddress }: { vaultAddress?: string }, options?: NavigateOptions) => {
      navigate(getVaultLink({ vaultAddress, chainId }), options);
    },
    [chainId, navigate],
  );

  return { goToVault, getVaultLink };
}

export function useVaultRouteSelectVault() {
  const disppatch = useAppDispatch();
  const { vaultAddress } = useParams();
  const location = useLocation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { vaultInfos } = useVaultInfos(chainId, userAddr);
  useEffect(() => {
    if (location.pathname.includes(RouteBasePath.launchpad)) {
      const vaultList = Object.values(vaultInfos || {});
      const vaultAddrFromSymbol = vaultList?.find(
        (info) => info.tokenInfo.symbol.toLowerCase() === vaultAddress?.toLowerCase(),
      )?.vaultAddress;
      const vaultAddrFromAddress = vaultAddress ? vaultInfos?.[vaultAddress.toLowerCase()]?.vaultAddress : undefined;
      const vaultAddr = vaultAddrFromAddress || vaultAddrFromSymbol;
      if (vaultAddr) {
        disppatch(setSelectedVaultAddress(vaultAddr));
      } else {
        disppatch(setSelectedVaultAddress(null));
      }
    }
  }, [disppatch, location.pathname, vaultAddress, vaultInfos]);
}

import { ThirdGlobalModalType } from '@/constants';
import { useBackendChainConfig } from '@/features/config/hook';
import { useThirdModalOpen, useToggleThirdModal } from '@/features/global/hooks';
import { useChainId } from '@/hooks/web3/useChain';
export const useIsTokenExchangeHidden = (qouteTokenSymbol?: string) => {
  const chainId = useChainId();
  const backendChainConfig = useBackendChainConfig(chainId);
  const hiddenBtns = backendChainConfig?.exchange?.hiddenBtns;

  return hiddenBtns?.includes(qouteTokenSymbol?.toUpperCase() || 'USDB');
};
export function useTokenExchangeModal() {
  const isOpenModal = useThirdModalOpen(ThirdGlobalModalType.TOKEN_EXCHANGE);
  const toggleModal = useToggleThirdModal(ThirdGlobalModalType.TOKEN_EXCHANGE);
  return {
    isOpenModal,
    toggleModal,
  };
}

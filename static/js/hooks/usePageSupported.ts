import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { RouteBasePath } from '@/pages/routers';
import { getChainIdByChainShortName } from '@/utils/chain';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useChainId } from './web3/useChain';
import { useSwitchNetwork } from './web3/useSwitchConnectorNetwork';

export const getIsPageSupported = (chainId: number, page: RouteBasePath) => {
  const chainConfig = DAPP_CHAIN_CONFIGS[chainId];
  return chainConfig?.network.isPageSupported?.[page];
};

export default function usePageSupported({ page }: { page: RouteBasePath }) {
  const navigate = useNavigate();
  const { switchAppNetwork } = useSwitchNetwork();
  const { chainShortName } = useParams();
  const chainId = useChainId();
  const location = useLocation();

  useEffect(() => {
    const chainConfig = chainId && DAPP_CHAIN_CONFIGS[chainId];

    if (!location.pathname.includes(page) || !chainConfig) return;
    if (!chainConfig.network.isPageSupported?.[page]) {
      navigate('/market', { replace: true });
    }
  }, [chainId, location.pathname, navigate, page, switchAppNetwork]);

  useEffect(() => {
    const chainIdFromShortName = chainShortName && getChainIdByChainShortName(chainShortName);
    const chainConfig = chainIdFromShortName && DAPP_CHAIN_CONFIGS[chainIdFromShortName];

    if (!location.pathname.includes(page) || !chainConfig) return;
    if (chainConfig.network.isPageSupported?.[page]) {
      chainIdFromShortName && switchAppNetwork(chainIdFromShortName);
    } else {
      navigate('/market', { replace: true });
    }
  }, [chainShortName, location.pathname, navigate, page, switchAppNetwork]);
}

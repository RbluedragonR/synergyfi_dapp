/**
 * @description Component-SwitchNetworkButton
 */
import { CHAIN_ID } from '@derivation-tech/context';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { NetworkButton } from '@/components/Button';
import { Tooltip } from '@/components/ToolTip';
import { fetchIpIsBlocked } from '@/features/global/actions';
import { useIsIpBlocked } from '@/features/global/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId, useDappChainConfig } from '@/hooks/web3/useChain';
import { useSwitchNetwork } from '@/hooks/web3/useSwitchConnectorNetwork';
import { NetworkButtonProps } from '@/types/button';

const SwitchNetworkButton: FC<NetworkButtonProps & { chainId?: CHAIN_ID }> = function ({
  chainId,
  children,
  ...props
}) {
  const defaultChainId = useChainId();
  const isIpBlocked = useIsIpBlocked();
  const dappConfig = useDappChainConfig(chainId || defaultChainId);
  const chainName = useMemo(() => {
    return dappConfig?.network?.name || undefined;
  }, [dappConfig?.network?.name]);

  if (!chainId) {
    chainId = defaultChainId;
  }
  const { switchWalletNetwork } = useSwitchNetwork();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  return (
    <Tooltip showOnMobile={true} title={isIpBlocked ? t('') : undefined}>
      <NetworkButton
        block
        iconType="network"
        disabled={isIpBlocked}
        onClick={async () => {
          // switch local and wallet network
          const ipBlocked = await dispatch(fetchIpIsBlocked()).unwrap();
          if (ipBlocked) {
            return;
          }
          chainId && switchWalletNetwork && switchWalletNetwork(chainId);
        }}
        {...props}>
        {children || t('common.switchToChain', { chainName: chainName })}
      </NetworkButton>
    </Tooltip>
  );
};

export default SwitchNetworkButton;

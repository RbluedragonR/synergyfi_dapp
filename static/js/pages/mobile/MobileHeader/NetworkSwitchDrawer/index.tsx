/**
 * @description Component-NetwerkSwitchDrawer
 */
import './index.less';

import React, { FC, useMemo, useState } from 'react';

import { ReactComponent as DownIcon } from '@/assets/svg/icon_chevron_down.svg';
import { Button } from '@/components/Button';
import DrawerSelector from '@/components/Drawer/DrawerSelector';
import { CHAIN_ID, DAPP_CHAIN_CONFIGS, DISPLAYABLE_CHAIN_ID } from '@/constants/chain';
import { useChainId } from '@/hooks/web3/useChain';
import { useSwitchNetwork } from '@/hooks/web3/useSwitchConnectorNetwork';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const NetworkSwitchDrawer: FC<IPropTypes> = function () {
  const [openDrawer, setOpenDrawer] = useState(false);
  const chainId = useChainId();
  const { switchAppNetwork, switchWalletNetwork } = useSwitchNetwork();
  const selectOptions = useMemo(
    () =>
      DISPLAYABLE_CHAIN_ID.map((selectChainId: CHAIN_ID) => {
        return {
          key: selectChainId,
          value: selectChainId,
          className: 'syn-network-switch-drawer-item',
          label: <div>{DAPP_CHAIN_CONFIGS[selectChainId]?.network?.name}</div>,
        };
      }),
    [],
  );
  return (
    <>
      <DrawerSelector
        className="syn-network-switch-drawer"
        closeIcon={false}
        placement="bottom"
        height={'auto'}
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        value={chainId}
        selectOptions={selectOptions}
        onChange={(selectChainId: CHAIN_ID) => {
          switchAppNetwork(selectChainId);
          switchWalletNetwork(selectChainId);
        }}>
        <Button type="text" className="syn-network-switch-drawer-btn" onClick={() => setOpenDrawer(true)}>
          {chainId && DAPP_CHAIN_CONFIGS[chainId]?.network.icon && (
            <img
              loading="lazy"
              src={DAPP_CHAIN_CONFIGS[chainId]?.network.icon}
              className="syn-network-switch-drawer-icon"
              alt="Switch Network"
            />
          )}
          <DownIcon className={openDrawer ? 'rotate' : ''} />
        </Button>
      </DrawerSelector>
    </>
  );
};

export default NetworkSwitchDrawer;

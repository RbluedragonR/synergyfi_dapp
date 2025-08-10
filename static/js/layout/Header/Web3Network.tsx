import './Web3Network.less';

import { useMemo, useState } from 'react';

import { ReactComponent as IconChevron } from '@/assets/svg/icon_chevron_d_dark.svg';
import Button from '@/components/Button/Button';
import Dropdown from '@/components/Dropdown';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { CHAIN_ID, DAPP_CHAIN_CONFIGS, DISPLAYABLE_CHAIN_ID } from '@/constants/chain';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useGa } from '@/hooks/useGa';
import { useChainId } from '@/hooks/web3/useChain';
import { useSwitchNetwork } from '@/hooks/web3/useSwitchConnectorNetwork';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { GaCategory } from '@/utils/analytics';
import classNames from 'classnames';

function Web3Network(): JSX.Element | null {
  const chainId = useChainId();
  const { isMobile } = useMediaQueryDevice();
  const gaEvent = useGa();
  const [open, setOpen] = useState(false);
  const { switchAppNetwork, switchWalletNetwork } = useSwitchNetwork();
  const connectStatus = useWalletConnectStatus();

  const dropdownOptions = useMemo(
    () => (
      <div className="header-network-item-container">
        {DISPLAYABLE_CHAIN_ID.map((selectChainId: CHAIN_ID, i: number) => {
          // if (isTestnet(selectChainId) && !isMobile) {
          //   return (
          //     <Option className="header-network-item" key={i} value={selectChainId}>
          //       {/* <div className="goerli-indicator"></div> */}
          //       <div>{NETWORK_LABEL[selectChainId]}</div>
          //     </Option>
          //   );
          // }
          return (
            <div
              className={classNames('header-network-item', { selected: chainId === selectChainId })}
              key={i}
              onClick={async () => {
                // switch local and wallet network
                switchAppNetwork(selectChainId);
                connectStatus !== WALLET_CONNECT_STATUS.UN_CONNECT && switchWalletNetwork(selectChainId);
                gaEvent({
                  category: GaCategory.HEADER,
                  action: 'Trade-Click on Chains',
                  value: selectChainId,
                  label: DAPP_CHAIN_CONFIGS[selectChainId]?.network?.name,
                });
              }}>
              {DAPP_CHAIN_CONFIGS[selectChainId]?.network.icon && (
                <img
                  loading="lazy"
                  src={DAPP_CHAIN_CONFIGS[selectChainId]?.network.icon}
                  className="header-network-img"
                  alt="Switch Network"
                />
              )}
              <div className="header-network-label">{DAPP_CHAIN_CONFIGS[selectChainId]?.network?.name}</div>
            </div>
          );
        })}
      </div>
    ),

    [chainId, gaEvent, switchAppNetwork],
  );

  if (!chainId || chainId <= 0) return null;

  return (
    <>
      <Dropdown
        className={`header-network-select ${isMobile && 'mobile'}`}
        overlayClassName="header-network__dropdown"
        onOpenChange={(open) => setOpen(open)}
        placement="bottom"
        align={{ offset: [0, 4] }}
        dropdownRender={() => {
          return dropdownOptions;
        }}
        overlayStyle={isMobile ? { width: 52 } : {}}>
        <Button type="link" className="header-network-select-button">
          <div className="header-network-select-button-left">
            {DAPP_CHAIN_CONFIGS[chainId]?.network.icon && (
              <img
                loading="lazy"
                src={DAPP_CHAIN_CONFIGS[chainId]?.network.icon}
                className="header-network-img"
                alt="Switch Network"
              />
            )}
          </div>
          <span className={classNames('header-network-select-button-icon', open ? 'rotate' : '')}>
            <IconChevron />
          </span>
        </Button>
      </Dropdown>
    </>
  );
}

export default Web3Network;

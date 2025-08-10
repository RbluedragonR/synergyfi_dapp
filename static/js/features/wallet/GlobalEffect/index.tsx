import { useAppDispatch } from '@/hooks';
import {
  useWalletAccount,
  useWalletConnector,
  useWalletConnectorChainId,
  useWalletIsActive,
} from '@/hooks/web3/useWalletNetwork';
import { WALLET_CONNECT_STATUS, WalletType } from '@/types/wallet';
import { setUser } from '@sentry/react';
import { useEffect } from 'react';

import { getWalletConfigSetting } from '@/configs';
import { WALLET_TYPE } from '@/constants/storage';
import { useWagmiAccount } from '@/hooks/web3/useWagami';
import { setWalletChainId } from '../actions';
import { useWalletConnectStatus, useWalletIsWrongNetwork } from '../hook';
import { setWalletConnectStatus, setWalletType } from '../walletSlice';
const walletConfigs = getWalletConfigSetting();
export const useListenWalletChange = (): void => {
  const dispatch = useAppDispatch();
  const isWrongNetwork = useWalletIsWrongNetwork();
  const account = useWalletAccount();
  const isActive = useWalletIsActive();
  const walletConnect = useWalletConnector();
  const walletStatus = useWalletConnectStatus();
  const walletChainId = useWalletConnectorChainId();
  const { connector } = useWagmiAccount();

  // watch wallet connect status
  useEffect(() => {
    if (isActive && !!account && !isWrongNetwork) {
      dispatch(setWalletConnectStatus({ status: WALLET_CONNECT_STATUS.CONNECTED }));
    } else if (!isActive || !account) {
      dispatch(setWalletConnectStatus({ status: WALLET_CONNECT_STATUS.UN_CONNECT }));
    } else if (isWrongNetwork) {
      dispatch(setWalletConnectStatus({ status: WALLET_CONNECT_STATUS.WRONG_NETWORK }));
    }
  }, [account, isActive, dispatch, isWrongNetwork]);

  useEffect(() => {
    // fix metamask lost connect bug by reconnect
    if (!isActive && walletStatus === WALLET_CONNECT_STATUS.UN_CONNECT) {
      // re-activate to connect metamask
      // walletConnect?.connect();
    }
  }, [isActive, walletConnect, walletStatus]);

  useEffect(() => {
    const lastWallet = localStorage.getItem(WALLET_TYPE) as WalletType | null;
    if (lastWallet === WalletType.PRIVY) dispatch(setWalletType({ type: WalletType.PRIVY }));
    else {
      if (connector?.id) {
        const wallets = Object.values(walletConfigs.walletConfig);
        const wallet = wallets.find((w) => w.id === connector.id);
        const walletByrdns = wallets.find((w) => w.rdns === connector.id);
        if (wallet) {
          // adapt for burrito walletConnect
          if (lastWallet === WalletType.BURRITO) dispatch(setWalletType({ type: WalletType.BURRITO }));
          else dispatch(setWalletType({ type: wallet.type }));
        } else if (walletByrdns) {
          if (lastWallet === WalletType.BURRITO) dispatch(setWalletType({ type: WalletType.BURRITO }));
          else dispatch(setWalletType({ type: walletByrdns.type }));
        } else if (connector.type === 'injected') {
          // fallback to metamask
          dispatch(setWalletType({ type: WalletType.METAMASK }));
        }
        setUser({ connectorType: connector?.type, connectorId: connector?.id, connectorName: connector?.name });
      } else {
        dispatch(setWalletType({ type: undefined }));
      }
    }
  }, [connector, dispatch]);

  // watch wallet chain id
  useEffect(() => {
    dispatch(setWalletChainId({ chainId: walletChainId }));
  }, [dispatch, walletChainId]);
};

export default function WalletGlobalEffect(): null {
  useListenWalletChange();
  return null;
}

// import { useAccountWrap } from '@/features/global/hooks';
import UserAddressButton from '@/features/user/UserAddressButton';
import WalletConnectButton from '@/features/wallet/WalletConnectButton';
import { useAppIsActive } from '@/features/web3/hook';
import { useWalletAccount, useWalletIsActive } from '@/hooks/web3/useWalletNetwork';

function Web3StatusInner({ desktopOnly }: { desktopOnly?: boolean }) {
  // const isWrongNetwork = useWalletIsWrongNetwork();
  const isActive = useWalletIsActive();
  // const walletProvider = useWalletProvider();
  const account = useWalletAccount();

  // const walletConnector = useWalletConnector();
  // const { switchChain: switchNetwork } = useSwitchNetwork(walletConnector);
  // const appChainId = useAppChainId();
  // const accountWrap = useAccountWrap();

  // const toggleWalletModal = useWalletModalToggle();
  // const toggleWalletModal = () => {
  //   // setIsShowUserModal(true);
  // };
  if (!isActive || !account) {
    return <WalletConnectButton desktopOnly={desktopOnly} />;
  }
  //  else if (isWrongNetwork) {
  //   return (
  //     <WrongNetworkButton
  //       onClick={
  //         isWrongNetwork
  //           ? () => {
  //               walletProvider && appChainId && switchNetwork(appChainId);
  //             }
  //           : toggleWalletModal
  //       }
  //     />
  //   );
  // }
  else if (account) {
    return <UserAddressButton className="Web3StatusConnected" id="web3-status-connected" />;
  }
  return null;
}

export default function Web3Status({ desktopOnly }: { desktopOnly?: boolean }): JSX.Element | null {
  const isActive = useWalletIsActive();
  const appIsActive = useAppIsActive();

  if (!appIsActive && !isActive) {
    return null;
  }

  return (
    <>
      <Web3StatusInner desktopOnly={desktopOnly} />
    </>
  );
}

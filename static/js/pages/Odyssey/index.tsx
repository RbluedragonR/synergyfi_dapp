/**
 * @description Component-Odessy
 */
import './index.less';

import React, { FC, useEffect } from 'react';

import { useUserAddr } from '@/hooks/web3/useChain';
import OdysseyEnd from './OdysseyEnd';

// import ClaimTokenModal from './components/ClaimTokenModal';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}

const Odyssey: FC<IPropTypes> = function ({}) {
  // const dispatch = useAppDispatch();
  // const chainId = useChainId();
  const userAddr = useUserAddr();
  // const profile = useOdysseyProfile(userAddr, chainId);
  // const profileFetchingStatus = useOdysseyProfileStatus(userAddr, chainId);
  // useGetUserProfile(true);
  // useOdysseyReferralNetworkCheck();
  //const walletConnectStatus = useWalletConnectStatus();
  // const epochs = useEpochs(chainId);
  // useGetSharedCode(userAddr);
  // useHandleTwitterErrorMsg();

  // const { run: recordGtagEvent } = useDebounceFn(
  //   () => {
  //     if (walletConnectStatus === WALLET_CONNECT_STATUS.CONNECTED) {
  //       gtag('event', 'connect_wallet_status', {
  //         connect_wallet_status: userAddr ? 'connect' : 'not_connect', // connect, not_connect
  //       });
  //     } else {
  //       gtag('event', 'connect_wallet_status', {
  //         connect_wallet_status: 'not_connect', // connect, not_connect
  //       });
  //     }
  //   },
  //   { wait: 300 },
  // );

  // useEffect(() => {
  //   // when no connected setTab to reward
  //   // !userAddr && setTab(ODYSSEY_TABS.EARN_POINTS);
  //   recordGtagEvent();
  // }, [userAddr]);

  // const loadImg = useMemo(() => {
  //   return <></>;
  // }, []);

  // useEffect(() => {
  //   chainId && dispatch(getEpochs({ chainId }));
  // }, [dispatch, chainId]);

  // useEffect(() => {
  //   userAddr && chainId && dispatch(getUserEpochDetails({ userAddr, chainId }));
  // }, [dispatch, epochs, userAddr, chainId]);

  useEffect(() => {
    if (userAddr) {
      gtag('event', 'enter_odyssey', {
        enter_odyssey_address: `@${userAddr}`,
      });
    }
    // only one
  }, [userAddr]);

  return (
    <div className="syn-odyssey">
      <OdysseyEnd />
      {/* <OdysseyHeader />
      <div className={classNames('syn-odyssey-container')}>
        {profileFetchingStatus !== FETCHING_STATUS.DONE && !profile ? (
          loadImg
        ) : (
          <>
            <OdysseyLeaderboard />
            <OdysseyRight />
          </>
        )}
        {}
      </div>
      <PreLoadImgs />
      <MysteryBox />
      <SpinWheel />
      <InviteFriendModal />
      <SquadRewardModal />
      <ProvideLiquidityModal /> */}
      {/* <ClaimTokenModal /> */}
    </div>
  );
};

export default Odyssey;

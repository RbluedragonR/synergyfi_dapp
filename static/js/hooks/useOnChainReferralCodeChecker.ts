import { setOnChainReferralCode } from '@/features/global/actions';
import { useWalletConnectStatus, useWalletType } from '@/features/wallet/hook';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '.';

export function useOnChainReferralCodeChecker(): void {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const channel = searchParams.get('channel');
  const walletConnectStatus = useWalletConnectStatus();
  const walletType = useWalletType();

  useEffect(() => {
    dispatch(setOnChainReferralCode({ channel: channel || undefined, walletType: walletType }));
    if (walletConnectStatus !== WALLET_CONNECT_STATUS.UN_CONNECT) {
      // delete channel from searchParams
      searchParams.delete('channel');
      setSearchParams(searchParams);
      return;
    }
  }, [channel, dispatch, walletConnectStatus, walletType]);
}
